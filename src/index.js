async function checkUserInChannel(chatId, userId, channelUsername, telegramApiKey) {
	const getChatMemberUrl = `https://api.telegram.org/bot${telegramApiKey}/getChatMember`;
	const response = await fetch(`${getChatMemberUrl}?chat_id=@${channelUsername}&user_id=${userId}`);
	const data = await response.json();
	console.log(data);
	return data.ok && ['member', 'administrator', 'creator'].includes(data.result.status);
}

async function generateSimplifiedTweet(AI, userMessage) {
	const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
		max_tokens: 2048,
		messages: [
			{
				role: "system", content: `You are a twitter user who saw a tweet that you want to post,
                but you dont want to copy the tweet as it is, so you are now step by step, methodically and meticulously
                with a lot of creativity and thought, rewriting the tweet in your own words.`
			},
			{
				role: "user",
				content: `The original tweet: <original_tweet>${userMessage}</original_tweet>.

Write your version of the tweet inside <simplified_tweet> xml tags.
Make sure to close the tag with </simplified_tweet> .
Your response should only contain the tweet, nothing else.`
			}
		],
	});

	let simplifiedTweet = response.response;
	return simplifiedTweet.replace(/<simplified_tweet>/, '').replace(/<\/simplified_tweet>/, '');
}

async function sendTelegramMessage(chatId, text, telegramApiKey) {
	const telegramApiUrl = `https://api.telegram.org/bot${telegramApiKey}/sendMessage`;
	const response = await fetch(telegramApiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			chat_id: chatId,
			text: text,
		}),
	});
	return response.ok;
}

export default {
	async fetch(request, env, ctx) {
		let telegramUpdate;

		try {
			telegramUpdate = await request.json();
		} catch (error) {
			return new Response(null, {
				status: 302,
				headers: {
					'Location': 'https://fauzaanu.com',
				},
			});
		}

		const chatId = telegramUpdate.message.chat.id;
		const userId = telegramUpdate.message.from.id;
		const userMessage = telegramUpdate.message.text;

		const channelUsername = 'zyloxcommunity';
		const isUserInChannel = await checkUserInChannel(chatId, userId, channelUsername, env.TELEGRAM_API_KEY);

		if (!isUserInChannel) {
			await sendTelegramMessage(chatId, `Please join our channel @${channelUsername} to use this bot.`, env.TELEGRAM_API_KEY);
			return new Response('User not in channel', {status: 200});
		}

		// Generate 10 simplified tweets
		const simplifiedTweets = [];
		for (let i = 0; i < 10; i++) {
			const tweet = await generateSimplifiedTweet(env.AI, userMessage);
			simplifiedTweets.push(tweet);
		}

		// Send each simplified tweet as a separate message
		for (const tweet of simplifiedTweets) {
			await sendTelegramMessage(chatId, tweet, env.TELEGRAM_API_KEY);
		}

		return new Response('Messages sent to Telegram successfully', {status: 200});
	},
};
