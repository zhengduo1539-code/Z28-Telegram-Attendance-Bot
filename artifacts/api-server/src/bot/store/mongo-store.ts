import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";
import { FileBotStore } from "./file-store";
import type { BotState } from "../types";
import type { BotStore } from "./types";

type MongoStateDocument = {
  _id: "bot-state";
  state: BotState;
  updatedAt: Date;
};

const DATABASE_NAME = "z28_attendance_bot";
const COLLECTION_NAME = "bot_state";
const STATE_ID = "bot-state";

export class MongoBotStore implements BotStore {
  private readonly client: MongoClient;
  private connected = false;
  private state?: BotState;
  private updateQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly uri: string,
    private readonly legacyFilePath?: string,
  ) {
    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      appName: "z28-telegram-attendance-bot",
    });
  }

  private async collection() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }

    return this.client
      .db(DATABASE_NAME)
      .collection<MongoStateDocument>(COLLECTION_NAME);
  }

  async load(): Promise<BotState> {
    if (this.state) return this.state;

    const collection = await this.collection();
    const document = await collection.findOne({ _id: STATE_ID });

    if (document) {
      this.state = document.state;
      return this.state;
    }

    const migratedState = await this.loadLegacyState();
    const initialState = migratedState || emptyState();
    await this.save(initialState);
    return this.state as BotState;
  }

  async save(state: BotState): Promise<void> {
    this.state = state;
    const collection = await this.collection();
    await collection.replaceOne(
      { _id: STATE_ID },
      {
        _id: STATE_ID,
        state,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
  }

  async update(mutator: (state: BotState) => void): Promise<BotState> {
    let updatedState: BotState | undefined;

    const update = this.updateQueue.then(async () => {
      const state = await this.load();
      const nextState = structuredClone(state);
      mutator(nextState);
      await this.save(nextState);
      updatedState = nextState;
    });

    this.updateQueue = update.catch(() => undefined);
    await update;
    return updatedState as BotState;
  }

  private async loadLegacyState(): Promise<BotState | undefined> {
    if (!this.legacyFilePath) return undefined;

    try {
      await readFile(this.legacyFilePath, "utf8");
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (code === "ENOENT") return undefined;
      throw error;
    }

    // Reuse the existing file-store parser/quarantine behavior for a
    // one-time migration. MongoDB remains the source of truth afterward.
    const legacyStore = new FileBotStore(this.legacyFilePath);
    return legacyStore.load();
  }
}

const emptyState = (): BotState => ({
  users: {},
  activeActivities: {},
  records: [],
  activityLimits: {},
  connectedGroups: {},
  pendingConnects: {},
});
