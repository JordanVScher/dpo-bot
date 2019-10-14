const { sendMainMenu } = require('./dialogs');
const { informacoes } = require('./flow');

const informacoesTimer = {};

async function createInformacoesTimer(userID, context) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
	informacoesTimer[userID] = setTimeout(async () => {
		await context.sendText(informacoes.textWait);
		await sendMainMenu(context);
		delete informacoesTimer[userID]; // deleting this timer from timers object
	}, informacoes.time);
}

async function deleteTimers(userID) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
}


module.exports = {
	deleteTimers, createInformacoesTimer,
};
