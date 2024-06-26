# Zyloxbot

Free Telegram bot deployed on cloudflare workers, that rewrites a tweet that you send with a LLM. Powered by Workers AI

### Important

`wrangler.tomp` is not included in the repo. Please rename the `wrangler_sample.toml` to `wrangler.toml` and fill in the api key from @botfather

The bot also runs a check for all its users to have joined the community channel. The channel username is currently hardcoded in the code. You can change it by replacing the value of `channelUsername` in `index.js:31`
```javascript src/index.js
const channelUsername = 'zyloxcommunity'; // Replace with your channel's username
```
