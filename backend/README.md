# Backend Service

This backend handles all API fetching, data transformation, storage, and Telegram bot notifications for your app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Telegram bot:
   - Open `index.js` and set:
     - `TELEGRAM_BOT_TOKEN` to your bot token
     - `TELEGRAM_CHAT_ID` to your group chat ID

3. Start the backend:
   ```bash
   node index.js
   ```

## API Endpoints

- `GET /api/actions/fetch` — Fetches latest actions from Vanaheimex and stores them in the database.
- `GET /api/actions` — Returns the 50 most recent stored actions.
- `POST /api/notify-telegram` — Sends Telegram notifications for unnotified whale actions.

## Notes
- The backend uses SQLite for storage (`actions.db` file).
- Only the backend communicates with the Telegram Bot API for security and reliability.
- Update the whale threshold and logic in `index.js` as needed. 