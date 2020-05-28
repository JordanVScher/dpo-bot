async function getCustomText(context, code) {
	const answers = context.state && context.state.politicianData && context.state.politicianData.answers ? context.state.politicianData.answers : false;
	if (answers && answers.length > 0) {
		const currentMsg = answers.find((x) => x.code === code);
		if (currentMsg && currentMsg.content) return currentMsg.content;
	}

	return false;
}

async function sendMsgFromAssistente(context, code, defaultMsgs) {
	try {
		const msgToSend = await getCustomText(context, code);

		if (msgToSend && typeof msgToSend === 'string' && msgToSend.length > 0) {
			await context.sendText(msgToSend);
		} else if (defaultMsgs && defaultMsgs.length > 0) {
			for (const msg of defaultMsgs) { // eslint-disable-line
				await context.sendText(msg);
			}
		}
	} catch (error) {
		throw ('Erro em sendMsgFromAssistente', error);
	}
}

export default { sendMsgFromAssistente };
