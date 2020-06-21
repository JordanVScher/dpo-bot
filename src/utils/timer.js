import dialogs from './dialogs';
import chatbotApi from '../chatbot_api';
import flow from './flow';
// import { getQR } from './attach';

const informacoesTimer = {};
const filesTimer = {};

async function createInformacoesTimer(userID, context) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
	informacoesTimer[userID] = setTimeout(async () => {
		await context.sendText(flow.informacoes.textWait);
		await dialogs.sendMainMenu(context);
		delete informacoesTimer[userID]; // deleting this timer from timers object
	}, flow.informacoes.time);
}

async function createFilesTimer(userID, context) {
	if (filesTimer[userID]) { clearTimeout(filesTimer[userID]); delete filesTimer[userID]; }

	filesTimer[userID] = setTimeout(async () => {
		if (context.state.dialog === 'incidenteFilesTimer') {
			if (context.state.incidenteAnonimo === true) {
				const desiredTicket = 7;
				await dialogs.ticketFollowUp(context,
					await chatbotApi.postNewTicket(
						context.state.politicianData.organization_chatbot_id,
						context.session.user.id, desiredTicket,
						'', '', 1, context.state.titularFiles,
					), desiredTicket);
			} else {
				await dialogs.ask(context, flow.incidente.incidenteCPF, flow.ask, flow.ask.cpfPlaceholder);
				// await context.sendText(flow.incidente.incidenteCPF, await getQR(flow.ask));
			}
		} else if (context.state.dialog === 'avançadoFilesTimer') {
			await dialogs.ask(context, flow.avançado.incidenteCPF, flow.ask, flow.ask.cpfPlaceholder);
			// await context.sendText(flow.avançado.incidenteCPF, await getQR(flow.ask));
		}
		delete filesTimer[userID];
	}, flow.incidente.time); // waiting for facebook to process all the files
}

async function deleteTimers(userID) {
	if (informacoesTimer[userID]) { clearTimeout(informacoesTimer[userID]); delete informacoesTimer[userID]; }
	if (filesTimer[userID]) { clearTimeout(filesTimer[userID]); delete filesTimer[userID]; }
}


export default {
	deleteTimers,
	createInformacoesTimer,
	createFilesTimer,
};
