const assistenteAPI = require('../chatbot_api');
const flow = require('./flow');
const attach = require('./attach');
const checkQR = require('./checkQR');
const help = require('./helper');

async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg) {
	if (/^[a-zA-Z\s]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkCPF(context, stateName, successDialog, invalidDialog, reaskMsg) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ [stateName]: cpf, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkPhone(context, stateName, successDialog, invalidDialog, reaskMsg) {
	const phone = await help.getPhoneValid(context.state.whatWasTyped);

	if (phone) {
		await context.setState({ [stateName]: phone, dialog: successDialog });
		// await context.setState({ titularPhone: phone, dialog: 'askRevogarMail' });
	} else {
		if (reaskMsg) await context.sendText(flow.revogarDados.askRevogarPhoneFail);
		// await context.sendText(flow.revogarDados.askRevogarPhoneFail);
		await context.setState({ dialog: invalidDialog });
		// await context.setState({ dialog: 'invalidPhone' });
	}
}

async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg) {
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
	sendMainMenu, checkFullName, checkCPF, checkPhone, checkEmail, meuTicket, solicitacoesMenu, cancelTicket, seeTicketMessages, newTicketMessage, handleReset,
};
