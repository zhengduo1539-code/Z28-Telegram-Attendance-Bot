# M58 Telegram Attendance Bot

A modular Telegram group bot for work, break, return-to-seat, and activity-time tracking with Chinese and English language switching.

See `render.yaml` for Render deployment configuration.

## Animated reply-keyboard icons

Z28 supports Telegram Bot API 9.4 custom emoji icons on reply-keyboard buttons. Configure these optional environment variables with **custom emoji IDs** (numeric IDs, not Unicode emoji or sticker file IDs):

- `REPLY_KEYBOARD_EMOJI_WC_ID` — Toilet
- `REPLY_KEYBOARD_EMOJI_SMOKE_ID` — Smoke
- `REPLY_KEYBOARD_EMOJI_WCD_ID` — WCD
- `REPLY_KEYBOARD_EMOJI_BACK_ID` — Return to seat

Use IDs for animated custom emojis to get the animated effect. If an ID is unset or is not numeric, Z28 leaves that button without a custom icon and continues to function normally. The bot owner must have Telegram Premium (unless the bot has the applicable additional usernames purchased on Fragment) for custom emoji button icons to be available.

After setting the values in the hosting service's environment, redeploy or restart the bot.
