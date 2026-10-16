# M58 Telegram Attendance Bot

A modular Telegram group bot for work, break, return-to-seat, and activity-time tracking with Chinese and English language switching.

See `render.yaml` for Render deployment configuration.

## Configure animated reply-keyboard icons

Use `/setmsg` in the bot's private chat (bot owner / configured administrators only):

1. Choose **Toilet**, **Smoke**, **WCD**, or **Back**.
2. Send a single Telegram **custom emoji** directly to the bot. A standard Unicode emoji is not sufficient; the bot reads the custom emoji ID from the Telegram message entity.
3. The icon is saved to persistent bot state and the keyboard is refreshed. Use `/cancel` to cancel a pending setup, or choose **Clear** / **Clear all** in the menu to remove icons. You can also use `/setmsg wc`, `/setmsg smoke`, `/setmsg wcd`, or `/setmsg back` to configure a specific button directly. `/setmsg reset` clears all configured icons.

Custom emoji button icons are subject to Telegram Bot API eligibility requirements: the bot owner must have Telegram Premium, unless the bot has the applicable additional usernames purchased on Fragment. The custom emoji ID must refer to an actual Telegram custom emoji; animated effects depend on the selected emoji and the Telegram client.

## Bot reply customization

Use `/setmsg` in the bot's private chat as the configured bot owner or administrator.

- **Animated Emoji** configures or clears the four reply-keyboard custom emoji icons.
- **Bot Reply Text** lets you choose a language, category, and individual reply to customize. Custom text is stored separately for English, Burmese, and Simplified Chinese.
- Send the replacement message as plain text. Multi-line text is supported. Use the placeholders shown in the prompt exactly, such as `{user_name}`, `{user_id}`, or `{time}`.
- Send `/reset` while editing a reply to restore that message's default text, or `/cancel` to leave it unchanged. The menu also allows resetting all custom reply text for the selected language.
- Direct shortcut: `/setmsg welcome`. Existing shortcuts such as `/setmsg wc`, `/setmsg smoke`, `/setmsg wcd`, and `/setmsg back` continue to configure emoji icons.

Custom reply templates are global per language. Existing group-specific activity templates remain higher priority for their matching activity replies. Custom reply text is sent as plain text; HTML markup is not interpreted.
