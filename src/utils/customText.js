import chatbotApi from '../chatbot_api';

async function getCustomText(context, code) {
	const customAnswers = await chatbotApi.getCustomAswers(context.state.JWT);
	if (customAnswers && customAnswers.length > 0) {
		const currentMsg = customAnswers.find((x) => x.code === code);
		if (currentMsg && currentMsg.content) return currentMsg.content;
	}

	return false;
}

export default getCustomText;
