const { sendMainMenu } = require('./dialogs');
const { faleConosco } = require('./flow');

const faleConoscoTimer = {};

async function createFaleConoscoTimer(userID, context) {
	if (faleConoscoTimer[userID]) { clearTimeout(faleConoscoTimer[userID]); delete faleConoscoTimer[userID]; }
	faleConoscoTimer[userID] = setTimeout(async () => {
		await context.sendText(faleConosco.textWait);
		await sendMainMenu(context);
		delete faleConoscoTimer[userID]; // deleting this timer from timers object
	}, faleConosco.time);
}

async function deleteTimers(userID) {
	if (faleConoscoTimer[userID]) { clearTimeout(faleConoscoTimer[userID]); delete faleConoscoTimer[userID]; }
}


module.exports = {
	deleteTimers, createFaleConoscoTimer,
};
