const { sendMainMenu } = require('./dialogs');
const { ticketFollowUp } = require('./dialogs');
const { ask } = require('./dialogs');
const { postNewTicket } = require('../chatbot_api');
// const { getQR } = require('./attach');
const flow = require('./flow');


const informacoesTimer = {};
const filesTimer = {};

async function createInformacoesTimer(userID, context) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
	informacoesTimer[userID] = setTimeout(async () => {
		await context.sendText(flow.informacoes.textWait);
		await sendMainMenu(context);
		delete informacoesTimer[userID]; // deleting this timer from timers object
	}, flow.informacoes.time);
}

async function createFilesTimer(userID, context) {
	if (filesTimer[userID]) { clearTimeout(filesTimer[userID]); delete filesTimer[userID]; }

	filesTimer[userID] = setTimeout(async () => {
		if (context.state.dialog === 'incidenteFilesTimer') {
			if (context.state.incidenteAnonimo === true) {
				const desiredTicket = 7;
				await ticketFollowUp(context,
					await postNewTicket(
						context.state.politicianData.organization_chatbot_id,
						context.session.user.id, desiredTicket,
						'', '', 1, context.state.titularFiles,
					), desiredTicket);
			} else {
				await ask(context, flow.incidente.incidenteCPF, flow.ask, flow.ask.cpfPlaceholder);
				// await context.sendText(flow.incidente.incidenteCPF, await getQR(flow.ask));
			}
		} else if (context.state.dialog === 'avançadoFilesTimer') {
			await ask(context, flow.avançado.incidenteCPF, flow.ask, flow.ask.cpfPlaceholder);
			// await context.sendText(flow.avançado.incidenteCPF, await getQR(flow.ask));
		}
		delete filesTimer[userID];
	}, flow.incidente.time); // waiting for facebook to process all the files
}

async function deleteTimers(userID) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
	if (filesTimer[userID]) { clearTimeout(filesTimer[userID]); delete filesTimer[userID]; }
}


module.exports = {
	deleteTimers, createInformacoesTimer, createFilesTimer,
};
