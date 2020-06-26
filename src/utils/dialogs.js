import chatbotAPI from '../chatbot_api';
import flow from './flow';
import attach from './attach';
import checkQR from './checkQR';
import help from './helper';
// const { createFilesTimer } = require('./timer');

async function sendMainMenu(context, text) {
	const textToSend = text || help.getRandomArray(flow.mainMenu.text1);
	await context.setState({ onSolicitacoes: false, dialog: '' });
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

async function ticketFollowUp(context, ticket, desiredTicket) {
	if (ticket && ticket.id) {
		await context.typing(1000 * 2.5);
		const time = help.getResponseTime(context.state.ticketTypes.ticket_types, desiredTicket);

		await context.sendText(context.session.platform === 'browser' ? flow.mainMenu.createTicketBrowser : flow.mainMenu.createTicket);

		const { ticketID } = context.state;
		if (ticketID && ticketID.toString() === '7') {
			await context.sendText('Você pode mandar as provas do seu incidente para o nosso e-mail em: "email@gmail.com"');
		}

		await sendMainMenu(context, flow.mainMenu.ticketTime.replace('<TIME>', time).replace('<TICKET>', ticket.id));
	} else {
		await context.sendText('Erro ao criar o ticket.');
		await sendMainMenu(context);
	}
}
async function createTicket(context) {
	await checkQR.reloadTicket(context);
	await context.sendText(flow.mainMenu.gerando);

	const { ticketID } = context.state;
	const activeTickets = context.state.ticketTypes.ticket_types;

	const { id: desiredTicket } = activeTickets.find((x) => x.ticket_type_id.toString() === ticketID.toString());

	const res = await chatbotAPI.postNewTicket(
		context.state.politicianData.organization_chatbot_id, context.state.recipientID, desiredTicket, await help.buildTicket(context.state),
		'', 0, [], context.state.JWT,
	);

	await ticketFollowUp(context, res, desiredTicket);
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

async function ask(context, text, buttons, placeholder = '') {
	let textToSend = text;

	if (context.session.platform === 'browser') {
		textToSend = `${textToSend} ${flow.ask.writeKeyword}`;
	} else {
		textToSend = `${textToSend} ${flow.ask.clickTheButton}`;
	}

	await help.expectText(context, textToSend, await attach.getQR(buttons), placeholder);
}

async function checkNome(context, stateName, successDialog, invalidDialog, reaskMsg = flow.ask.cpfFail) {
	const nome = context.state.whatWasTyped;

	if (nome) {
		await context.setState({ [stateName]: nome, dialog: successDialog });
		return nome;
	}

	await context.setState({ dialog: invalidDialog || '' });
	if (reaskMsg) {
		await ask(context, reaskMsg, flow.ask, flow.ask.nomePlaceholder);
	}

	return '';
}

async function checkCPF(context, stateName, successDialog, invalidDialog, reaskMsg = flow.ask.cpfFail) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ [stateName]: cpf, dialog: successDialog });
		return cpf;
	}

	await context.setState({ dialog: invalidDialog || '' });
	if (reaskMsg) {
		await ask(context, reaskMsg, flow.ask, flow.ask.cpfPlaceholder);
	}

	return '';
}

async function checkPhone(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.phone) {
	const phone = await help.getPhoneValid(context.state.whatWasTyped);

	if (phone) {
		await context.setState({ [stateName]: phone, dialog: successDialog });
		return phone;
	}

	await context.setState({ dialog: invalidDialog || '' });
	if (reaskMsg) {
		await ask(context, reaskMsg, flow.ask);
	}

	return '';
}

async function checkInteger(context, stateName, successDialog, invalidDialog, reaskMsg = flow.dataFail.phone) {
	const number = Number.parseInt(context.state.whatWasTyped, 10);
	const isInteger = Number.isInteger(number);

	if (isInteger) {
		await context.setState({ [stateName]: number, dialog: successDialog });
		return number;
	}

	await context.setState({ dialog: invalidDialog || '' });
	if (reaskMsg) {
		await ask(context, reaskMsg, flow.ask);
	}

	return '';
}

async function checkEmail(context, stateName, successDialog, invalidDialog, reaskMsg = flow.askMail.fail) {
	if (context.state.whatWasTyped.includes('@')) {
		await context.setState({ [stateName]: context.state.whatWasTyped, dialog: successDialog });
		if (context.session.platform === 'browser') await context.setState({ userEmail: context.state[stateName] });
	} else {
		await context.setState({ dialog: invalidDialog || '' });
		if (reaskMsg)	{
			await ask(context, reaskMsg, flow.ask, flow.ask.mailPlaceholder);
		}
	}
}

async function checkDescricao(context, stateName, successDialog, invalidDialog, reaskMsg = flow.ask.cpfFail) {
	const descricao = context.state.whatWasTyped;

	if (descricao) {
		await context.setState({ [stateName]: descricao, dialog: successDialog });
		return descricao;
	}

	await context.setState({ dialog: invalidDialog || '' });
	if (reaskMsg) {
		await ask(context, reaskMsg, flow.ask, flow.ask.descricaoPlaceholder);
	}

	return '';
}

async function meuTicket(context) {
	await context.setState({ userTickets: await chatbotAPI.getUserTickets(context.session.user.id, context.state.JWT), currentTicket: '', ticketID: '' });
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
	await checkQR.reloadTicket(context);
	const data = {};
	const { apiaiTextAnswer } = context.state;

	const entities = context.state.resultParameters; data.entities = entities; data.apiaiResp = context.state.apiaiResp; data.userName = context.state.sessionUser.name;
	if (entities.solicitacao) entities.solicitacao = entities.solicitacao.filter((x) => x !== 'solicitar');

	if (!context.state.solicitacaoCounter) { await context.setState({ solicitacaoCounter: 0 }); } // setting up or the first time
	await context.setState({ solicitacaoCounter: context.state.solicitacaoCounter + 1 });

	if (apiaiTextAnswer) {
		await context.setState({ dialog: '' });

		// if user cancels the request, send to mainMenu (check if one of the built-in response texts contains our mapped keywords)
		if (await checkSairMsg(apiaiTextAnswer, flow.solicitacoes.builtInSairResponse)) {
			await context.sendText(apiaiTextAnswer);
			await context.setState({ dialog: 'mainMenu' });
		} else if (context.state.solicitacaoCounter >= 3) {
			await help.expectText(context, apiaiTextAnswer, await attach.getQR(flow.solicitacaoVoltar), 'Qual sua requisição?');
		} else {
			await help.expectText(context, apiaiTextAnswer, await attach.getQR(flow.solicitacaoVoltar), 'Qual sua requisição?');
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
			await help.expectText(context, flow.solicitacoes.noSolicitationType, await attach.getQR(flow.solicitacaoVoltar), 'Qual sua requisição?');
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

async function cancelarConfirma(context) {
	const { cancelarNumero } = context.state;
	const { cancelarCPF } = context.state;
	const { recipientID } = context.state;

	const ticket = await chatbotAPI.getBrowserTicket(cancelarNumero, recipientID, cancelarCPF, context.state.JWT);

	if (ticket && ticket.id) {
		if (ticket.status !== 'canceled') {
			const ticketText = help.viewTicket(ticket);
			if (ticketText) {
				await context.setState({ ticketID: ticket.id });
				await context.sendText(flow.cancelarTicket.found);
				await context.sendHTML(`<p class="botui-message-content text">${ticketText}</p>`);
				// await context.sendHTML(`<div class="botui-message-content text ticketView">${ticketText}</div>`);
				await context.sendText(flow.cancelarTicket.success.text, await attach.getQR(flow.cancelarTicket.success));
				return;
			}
		} else {
			await context.sendText(flow.cancelarTicket.cancelledAlready);
			await sendMainMenu(context);
			return;
		}
	}

	await context.sendText(flow.cancelarTicket.failure.text, await attach.getQR(flow.cancelarTicket.failure));
}


async function cancelTicket(context, cpf = null) {
	const res = await chatbotAPI.putStatusTicket(context.state.ticketID, 'canceled', cpf, context.state.JWT);
	if (res && res.id) {
		await context.sendText(flow.cancelConfirmation.cancelSuccess);
	} else {
		await context.sendText(flow.cancelConfirmation.cancelFailure);
	}
	await sendMainMenu(context);
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
	const res = await chatbotAPI.putAddMsgTicket(context.state.currentTicket.id, context.state.ticketMsg, context.state.JWT);
	if (res && res.id) {
		await context.sendText(flow.leaveTMsg.cancelSuccess);
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.leaveTMsg.cancelFailure);
	}
}

async function handleReset(context) {
	console.log('Deletamos o quiz?', await chatbotAPI.resetQuiz(context.session.user.id, 'preparatory', context.state.JWT));
	const meusTickets = await chatbotAPI.getUserTickets(context.session.user.id, context.state.JWT);
	if (meusTickets && meusTickets.tickets) {
		meusTickets.tickets.forEach((element) => {
			chatbotAPI.putStatusTicket(element.id, 'canceled', context.state.JWT);
		});
	}
	await context.setState({ dialog: 'greetings', quizEnded: false, sendShare: false });
}

export default {
	sendMainMenu,
	checkFullName,
	checkDescricao,
	checkNome,
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
	ask,
	checkInteger,
	cancelarConfirma,
};
