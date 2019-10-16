const assistenteAPI = require('../chatbot_api');
const flow = require('./flow');
const attach = require('./attach');
const checkQR = require('./checkQR');
const help = require('./helper');

async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.setState({ onSolicitacoes: false });
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

async function createTicket(context, ticketID) {
	await context.sendText(flow.mainMenu.gerando);
	if (ticketID && ticketID.id) {
		await context.typing(1000 * 2.5);
		await sendMainMenu(context, flow.mainMenu.createTicket.replace('<TICKET>', ticketID.id));
	} else {
		await context.sendText('Erro ao criar o ticket');
	}
}

async function handleFiles(context) {
	const filesUrl = [];

	console.log(context.event.message.attachments);
	filesUrl.push(...context.state.titularFiles);
	context.event.message.attachments.forEach((element) => {
		if (element.payload && element.payload.url) filesUrl.push(element.payload.url);
	});

	await context.setState({ titularFiles: filesUrl });
	if (['incidenteAskFile', 'incidenteI', 'incidenteA'].includes(context.state.dialog)) {
		if (context.state.incidenteAnonimo === true) {
			await context.setState({ dialog: 'gerarTicketAnomino7' });
		} else {
			await context.setState({ dialog: 'incidenteAskPDF' });
		}
	}
}

async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.name) {
	if (/^[A-Za-zÀ-ÿ\s]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkCPF(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.cpf) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ [stateName]: cpf, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkPhone(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.phone) {
	const phone = await help.getPhoneValid(context.state.whatWasTyped);

	if (phone) {
		await context.setState({ [stateName]: phone, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.mail) {
	if (context.state.whatWasTyped.includes('@')) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg)	await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function meuTicket(context) {
	await context.setState({ userTickets: await assistenteAPI.getUserTickets(context.session.user.id), currentTicket: '', ticketID: '' });
	if (context.state.userTickets.itens_count > 0) {
		await attach.sendTicketCards(context, context.state.userTickets.tickets);
		await context.typing(1000 * 3);
	}
	await sendMainMenu(context);
}

async function solicitacoesMenu(context) {
	const options = await checkQR.buildAtendimento(context);
	if (!options) {
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.solicitacoes.text1, options);
	}
}

async function consumidorMenu(context) {
	const options = await checkQR.buildConsumidorMenu(context);
	if (!options) {
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.consumidor.text1, options);
	}
}

async function handleSolicitacaoRequest(context) {
	const data = {};
	const entities = context.state.resultParameters; data.entities = entities; data.apiaiResp = context.state.apiaiResp; data.userName = context.session.user.name;

	if (context.state.apiaiTextAnswer) {
		await context.setState({ dialog: '' });
		await context.sendText(context.state.apiaiTextAnswer);
		if (context.state.apiaiResp.result.actionIncomplete === false) {
			await sendMainMenu(context);	// if user cancels the request, send to mainMenu
		}
	} else if (!entities) {
		await context.setState({ dialog: 'solicitacoes' });
	} else if (!entities.solicitacao) {
		await context.setState({ dialog: 'solicitacoes' });
	} else {
		const idSolicitation = flow.solicitacoes.typeDic[entities.solicitacao]; data.idSolicitation = idSolicitation;
		const userHas = context.state.userTicketTypes.includes(idSolicitation); data.userHas = userHas; data.userTicketTypes = context.state.userTicketTypes;
		const ticket = context.state.ticketTypes.ticket_types.find((x) => x.id === idSolicitation); data.ticket = ticket; data.ticketTypes = context.state.ticketTypes.ticket_types;
		if (ticket) {
			if (userHas) { // if user already has an open ticket for this, warn him and go to main menu
				await context.sendText(flow.solicitacoes.userHasOpenTicket.replace('<TIPO_TICKET>', ticket.name));
				await sendMainMenu(context);
			} else { // no open ticket, send user to the proper solicitation flow
				await context.setState({ dialog: `solicitacao${idSolicitation}`, onSolicitacoes: false });
			}
		} else { // DF found an entity but we dont have it in our dictionary
			await context.sendText(flow.solicitacoes.noSolicitationType);
			await context.setState({ onSolicitacoes: false });
			await sendMainMenu(context);
		}
	}

	return data;
}

async function cancelTicket(context) {
	const res = await assistenteAPI.putStatusTicket(context.state.ticketID, 'canceled');
	if (res && res.id) {
		await context.sendText(flow.cancelConfirmation.cancelSuccess);
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.cancelConfirmation.cancelFailure);
	}
}

async function seeTicketMessages(context) {
	await context.setState({ currentTicket: await context.state.userTickets.tickets.find((x) => x.id.toString() === context.state.ticketID) });
	const messages = context.state.currentTicket.message;
	await context.sendText('Mensagens do ticket:');
	for (let i = 0; i < messages.length; i++) {
		const element = messages[i];
		await context.sendText(element);
	}
	await sendMainMenu(context);
}

async function newTicketMessage(context) {
	await context.setState({ currentTicket: await context.state.userTickets.tickets.find((x) => x.id.toString() === context.state.ticketID) });
	const res = await assistenteAPI.putAddMsgTicket(context.state.currentTicket.id, context.state.ticketMsg);
	if (res && res.id) {
		await context.sendText(flow.leaveTMsg.cancelSuccess);
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.leaveTMsg.cancelFailure);
	}
}

async function handleReset(context) {
	console.log('Deletamos o quiz?', await assistenteAPI.resetQuiz(context.session.user.id, 'preparatory'));
	const meusTickets = await assistenteAPI.getUserTickets(context.session.user.id);
	if (meusTickets && meusTickets.tickets) {
		meusTickets.tickets.forEach((element) => {
			assistenteAPI.putStatusTicket(element.id, 'canceled');
		});
	}
	await context.setState({ dialog: 'greetings', quizEnded: false, sendShare: false });
}

module.exports = {
	sendMainMenu,
	checkFullName,
	checkCPF,
	checkPhone,
	checkEmail,
	meuTicket,
	solicitacoesMenu,
	cancelTicket,
	seeTicketMessages,
	newTicketMessage,
	handleReset,
	createTicket,
	handleFiles,
	handleSolicitacaoRequest,
	consumidorMenu,
};
