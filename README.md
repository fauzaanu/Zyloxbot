# Zyloxbot

Free Telegram bot deployed on cloudflare workers, that rewrites a tweet that you send with a LLM. Powered by Workers AI.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fauzaanu/zyloxbot)

### Important

Add an environment variable `TELEGRAM_API_KEY` inside the workers dashboard or even in the wrangler.toml file.
This is the API key for the telegram bot. You can get it by creating a new bot on telegram and getting the API key from BotFather.


The bot also runs a check for all its users to have joined the community channel. The channel username is currently hardcoded in the code. You can change it by replacing the value of `channelUsername` in `src/index.js:31`
```javascript src/index.js
const channelUsername = 'zyloxcommunity'; // Replace with your channel's username
```
