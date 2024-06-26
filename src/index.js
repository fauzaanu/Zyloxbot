async function checkUserInChannel(chatId, userId, channelUsername, telegramApiKey) {
	const getChatMemberUrl = `https://api.telegram.org/bot${telegramApiKey}/getChatMember`;
	const response = await fetch(`${getChatMemberUrl}?chat_id=@${channelUsername}&user_id=${userId}`);
	const data = await response.json();
	console.log(data);
	return data.ok && ['member', 'administrator', 'creator'].includes(data.result.status);
}

export default {
	async fetch(request, env, ctx) {
		let telegramUpdate;

		try {
			// Attempt to parse the incoming request as JSON
			telegramUpdate = await request.json();
		} catch (error) {
			// Redirect to fauzaanu.com
			return new Response(null, {
				status: 302, // Using 302 for temporary redirect
				headers: {
					'Location': 'https://fauzaanu.com',
				},
			});
		}

		const chatId = telegramUpdate.message.chat.id;
		const userId = telegramUpdate.message.from.id;
		const userMessage = telegramUpdate.message.text;

		// Check if the user has joined the specific channel
		const channelUsername = 'zyloxcommunity'; // Replace with your channel's username
		const isUserInChannel = await checkUserInChannel(chatId, userId, channelUsername, env.TELEGRAM_API_KEY);

		if (!isUserInChannel) {
			// Send a message asking the user to join the channel
			const telegramApiUrl = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendMessage`;
			await fetch(telegramApiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id: chatId,
					text: `Please join our channel @${channelUsername} to use this bot.`,
				}),
			});
			return new Response('User not in channel', {status: 200});
		}

		// Generate simplified tweet using AI
		const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
			max_tokens: 2048,
			messages: [
				{
					role: "system", content: `You are a twitter user who saw a tweet that you want to post,
					but you dont want to copy the tweet as it is, so you are now step by step, methodically and metaculously
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

		// Extract the simplified tweet from the response
		let simplifiedTweet = response.response;
		simplifiedTweet = simplifiedTweet.replace(/<simplified_tweet>/, '').replace(/<\/simplified_tweet>/, '');

		// Send the simplified tweet back to the user
		const telegramApiUrl = `https://api.telegram.org/bot${env.TELEGRAM_API_KEY}/sendMessage`;

		const telegramResponse = await fetch(telegramApiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chat_id: chatId,
				text: simplifiedTweet,
			}),
		});

		if (telegramResponse.ok) {
			return new Response('Message sent to Telegram successfully', {status: 200});
		} else {
			return new Response('Failed to send message to Telegram', {status: 500});
		}
	}
	,
};
