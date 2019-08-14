const flow = require('./flow');
// const attach = require('./attach');
const checkQR = require('./checkQR');

async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.sendText(textToSend, await checkQR.buildMainMenu(context.state));
}

module.exports = {
	sendMainMenu,
};
