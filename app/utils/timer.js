const { sendMainMenu } = require('./dialogs');
const { createTicket } = require('./dialogs');
const { postNewTicket } = require('../chatbot_api');
const { getQR } = require('./attach');
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
		if (context.state.dialog === 'reportarIncidente') {
			if (context.state.incidenteAnonimo === true) {
				await createTicket(context,
					await postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 7, '', '', 1, context.state.titularFiles));
			} else {
				await context.sendText(flow.incidente.incidenteCPF, await getQR(flow.askCPF));
			}
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

// sendFiles(payload = {}, config = {}) {
// 	config.headers = { 'Content-Type': 'multipart/form-data' };

// 	return payload.teamId
// 		? apiClient.post(`/teams/${payload.teamId}/contacts/upload`, payload, config)
// 		: Promise.reject(new Error('{teamId} is missing'));
// },
