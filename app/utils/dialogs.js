const flow = require('./flow');
// const attach = require('./attach');
const { checkPosition } = require('./dialogFlow');
const help = require('./helper');
const checkQR = require('./checkQR');

async function dialogFlow(context) {
	console.log('--------------------------');
	console.log(`${context.session.user.first_name} ${context.session.user.last_name} digitou ${context.event.message.text}`);
	console.log('Usa dialogflow?', context.state.politicianData.use_dialogflow);
	if (context.state.politicianData.use_dialogflow === 1) { // check if 'politician' is using dialogFlow
		await context.setState({ apiaiResp: await help.apiai.textRequest(await help.formatDialogFlow(context.state.whatWasTyped), { sessionId: context.session.user.id }) });
		// await context.setState({ resultParameters: context.state.apiaiResp.result.parameters }); // getting the entities
		await context.setState({ intentName: context.state.apiaiResp.result.metadata.intentName }); // getting the intent
		await checkPosition(context);
	} else { // not using dialogFlow
		await context.setState({ dialog: 'createIssueDirect' });
	}
}

async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.sendText(textToSend, await checkQR.buildMainMenu(context.state));
}

module.exports = {
	sendMainMenu, dialogFlow,
};
