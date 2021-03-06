const assistenteAPI = require('../chatbot_api');
const flow = require('./flow');
const attach = require('./attach');
const checkQR = require('./checkQR');
const help = require('./helper');
// const { createFilesTimer } = require('./timer');

async function sendMainMenu(context, text) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	await context.setState({ onSolicitacoes: false });
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

async function createTicket(context, ticketID) {
	await context.sendText(flow.mainMenu.gerando);
	if (ticketID && ticketID.id) {
		await context.typing(1000 * 2.5);
		const time = help.getResponseTime(context.state.ticketTypes.ticket_types, context.state.ticketID);
		await context.sendText(flow.mainMenu.createTicket);
		await sendMainMenu(context, flow.mainMenu.ticketTime.replace('<TIME>', time).replace('<TICKET>', ticketID.id));
	} else {
		await context.sendText('Erro ao criar o ticket');
	}
}

// obs: facebook may take a while to process larger files, so if the user updates multiple files, we must wait for facebook to finish them all (actually we just wait for a few seconds)
async function handleFiles(context, dialog) {
	const newFiles = context.event.message.attachments; // get new files from facebook event

	// send a message after first file enters as event
	if (context.state.dialog !== dialog) await context.sendText(flow.files.wait);

	const filesToAdd = [];
	newFiles.forEach(async (e) => {
		if (e.payload.url) await filesToAdd.push(e.payload.url);
	});
	await context.setState({ titularFiles: [...context.state.titularFiles, ...filesToAdd] }); // add new files tot he files we already have
	await context.setState({ dialog }); // send to specific timer dialog
	await context.typingOn();
}

async function checkFullName(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.name) {
	if (/^[A-Za-zÀ-ÿ\s]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
	} else {
		if (reaskMsg) await context.sendText(reaskMsg);
		await context.setState({ dialog: invalidDialog });
	}
}

async function checkCPF(context, stateName, successDialog, invalidDialog, reaskMsg = flow.solicitacao.fail) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ [stateName]: cpf, dialog: successDialog });
		return cpf;
	}

	if (reaskMsg) await context.sendText(reaskMsg, await attach.getQR(flow.askCPF));
	await context.setState({ dialog: invalidDialog });
	return '';
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

async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg = flow.askMail.fail) {
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

async function atendimentoAvançado(context) {
	const options = await checkQR.buildAtendimentoAvancado(context);
	if (!options) {
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.atendimentoAvançado.intro1);
		await context.sendText(flow.atendimentoAvançado.intro2, await attach.getQR(flow.atendimentoAvançado));
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

async function checkSairMsg(message, keywords) {
	if (message.includes('"Cancelar"')) return false;
	if (keywords.some((x) => message.toLowerCase().includes(x))) return true;
	return false;
}

async function handleSolicitacaoRequest(context) {
	const data = {};
	const entities = context.state.resultParameters; data.entities = entities; data.apiaiResp = context.state.apiaiResp; data.userName = context.state.sessionUser.name;
	if (entities.solicitacao) entities.solicitacao = entities.solicitacao.filter((x) => x !== 'solicitar');
	if (!context.state.solicitacaoCounter) { await context.setState({ solicitacaoCounter: 0 }); } // setting up or the first time
	await context.setState({ solicitacaoCounter: context.state.solicitacaoCounter + 1 });
	if (context.state.apiaiTextAnswer) {
		await context.setState({ dialog: '' });
		if (context.state.solicitacaoCounter >= 3) {
			await context.sendText(context.state.apiaiTextAnswer, await attach.getQR(flow.solicitacaoVoltar));
		} else {
			await context.sendText(context.state.apiaiTextAnswer);
		}
		// if user cancels the request, send to mainMenu (check if one of the built-in response texts contains our mapped keywords)
		if (await checkSairMsg(context.state.apiaiTextAnswer, flow.solicitacoes.builtInSairResponse))	{
			await context.setState({ dialog: 'mainMenu' });
		}
	} else if (!entities) {
		await context.setState({ dialog: 'solicitacoes' });
	} else if (!entities.solicitacao || entities.solicitacao.length === 0) {
		await context.setState({ dialog: 'solicitacoes' });
	} else {
		let idSolicitation = '';
		// run through all entities until we find one that is a valid solicitation
		entities.solicitacao.forEach((e) => { if (!idSolicitation) idSolicitation = flow.solicitacoes.typeDic[e]; }); data.idSolicitation = idSolicitation;
		const userHas = context.state.userTicketTypes.includes(idSolicitation); data.userHas = userHas; data.userTicketTypes = context.state.userTicketTypes;
		const ticket = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === idSolicitation);
		data.ticket = ticket; data.ticketTypes = context.state.ticketTypes.ticket_types;
		if (ticket) {
			ticket.name = ticket.name.toLowerCase();
			await context.setState({ solicitacaoCounter: 0 });
			if (userHas && idSolicitation !== 7) { // if user already has an open ticket for this, warn him and go to main menu
				await context.sendText(flow.solicitacoes.userHasOpenTicket.replace('<TIPO_TICKET>', ticket.name));
				await sendMainMenu(context);
			} else { // no open ticket, send user to the proper solicitation flow
				await context.setState({ dialog: 'confirmaSolicitacao', idSolicitation, onSolicitacoes: false });
			}
		} else { // DF found an entity but we dont have it in our dictionary, ask again
			await context.sendText(flow.solicitacoes.noSolicitationType);
			await context.setState({ dialog: 'solicitacoes' });
		}
	}

	return data;
}

async function confirmaSolicitacao(context) {
	const QR = JSON.parse(JSON.stringify(flow.confirmaSolicitacao));
	QR.menuPostback[0] = `solicitacao${context.state.idSolicitation}`;
	const text = flow.confirmaSolicitacao.text1.replace('<TIPO>', flow.confirmaSolicitacao.typeDic[context.state.idSolicitation] || flow.confirmaSolicitacao.default);
	await context.sendText(text, await attach.getQR(QR));
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
	atendimentoAvançado,
	confirmaSolicitacao,
};
