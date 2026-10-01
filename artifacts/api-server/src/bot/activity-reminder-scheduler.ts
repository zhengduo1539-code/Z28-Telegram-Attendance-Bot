import type { Logger } from "pino";
import { AttendanceService } from "./attendance-service";
import { activityLabel, getLocale } from "./locales";
import { TelegramClient } from "./telegram-client";
import type { ActiveActivity } from "./types";

const CHECK_INTERVAL_MS = 1_000;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1_000;

export class ActivityReminderScheduler {
  private timer?: ReturnType<typeof setInterval>;
  private checking = false;
  private lastCleanupAt = 0;

  constructor(
    private readonly attendance: AttendanceService,
    private readonly telegram: TelegramClient,
    private readonly logger: Logger,
  ) {}

  start(): void {
    if (this.timer) return;
    void this.check();
    this.timer = setInterval(() => void this.check(), CHECK_INTERVAL_MS);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private async check(): Promise<void> {
    if (this.checking) return;
    this.checking = true;
    try {
      const now = Date.now();
      if (now - this.lastCleanupAt >= CLEANUP_INTERVAL_MS) {
        const cutoff = new Date(now - this.attendance.getHistoryRetentionDays() * 24 * 60 * 60 * 1_000);
        const removed = await this.attendance.pruneHistoryBefore(cutoff);
        this.lastCleanupAt = now;
        if (removed.records || removed.warnings || removed.pendingConnects) {
          this.logger.info({ removed, cutoff: cutoff.toISOString() }, "Historical attendance data pruned");
        }
      }

      const dueActivities = await this.attendance.dueActivityReminders();
      for (const candidate of dueActivities) {
        await this.sendReminder(candidate);
      }
    } catch (error: unknown) {
      this.logger.error(
        { err: error },
        "Activity reminder check failed; it will retry",
      );
    } finally {
      this.checking = false;
    }
  }

  private async sendReminder(candidate: ActiveActivity): Promise<void> {
    const claim = await this.attendance.claimActivityReminder(candidate);
    if (!claim) return;

    const { activity } = claim;
    const locale = getLocale(claim.locale);
    const message = locale.timeoutReminder(
      activity.displayName,
      activity.userId,
      activityLabel(activity.kind, claim.locale),
    );

    try {
      await this.telegram.sendMessage(activity.chatId, message);
    } catch (error: unknown) {
      try {
        await this.attendance.releaseActivityReminderClaim(claim);
      } catch (releaseError: unknown) {
        this.logger.error(
          {
            err: releaseError,
            chatId: activity.chatId,
            userId: activity.userId,
          },
          "Failed to release activity reminder claim",
        );
      }
      this.logger.error(
        { err: error, chatId: activity.chatId, userId: activity.userId },
        "Activity reminder delivery failed; it will retry",
      );
      return;
    }

    try {
      await this.attendance.markActivityReminderSent(claim);
    } catch (error: unknown) {
      this.logger.error(
        { err: error, chatId: activity.chatId, userId: activity.userId },
        "Activity reminder was sent but its state could not be saved",
      );
    }
  }
}
