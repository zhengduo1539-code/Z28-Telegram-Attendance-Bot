# M58 Telegram Attendance Bot

A modular Telegram group bot for work, break, return-to-seat, and activity-time tracking with Chinese and English language switching.

See `render.yaml` for Render deployment configuration.

## Configure animated reply-keyboard icons

Use `/setmsg` in the bot's private chat (bot owner / configured administrators only):

1. Choose **Toilet**, **Smoke**, **WCD**, or **Back**.
2. Send a single Telegram **custom emoji** directly to the bot. A standard Unicode emoji is not sufficient; the bot reads the custom emoji ID from the Telegram message entity.
3. The icon is saved to persistent bot state and the keyboard is refreshed. Use `/cancel` to cancel a pending setup, or choose **Clear** / **Clear all** in the menu to remove icons. You can also use `/setmsg wc`, `/setmsg smoke`, `/setmsg wcd`, or `/setmsg back` to configure a specific button directly. `/setmsg reset` clears all configured icons.

Custom emoji button icons are subject to Telegram Bot API eligibility requirements: the bot owner must have Telegram Premium, unless the bot has the applicable additional usernames purchased on Fragment. The custom emoji ID must refer to an actual Telegram custom emoji; animated effects depend on the selected emoji and the Telegram client.
