require('dotenv').config();

const assistenteAPI = require('./chatbot_api');
// const opt = require('./util/options');
const { createIssue } = require('./utils/send_issue');
const flow = require('./utils/flow');
const help = require('./utils/helper');
const dialogs = require('./utils/dialogs');
const attach = require('./utils/attach');
const DF = require('./utils/dialogFlow');
const quiz = require('./utils/quiz');
const timer = require('./utils/timer');
const input = require('./utils/input');
const { reloadTicket } = require('./utils/checkQR'); // eslint-disable-line

const incidenteCPFAux = {}; // because the file timer stops setState from working

// const getPageChatbotID = (context) => {
// 	if (context && context.event && context.event.rawEvent && context.event.rawEvent.recipient && context.event.rawEvent.recipient.id) {
// 		return context.event.rawEvent.recipient.id;
// 	}
// 	return process.env.REACT_APP_MESSENGER_PAGE_ID;
// };

// we update context data at every interaction that's not a comment or a post
const postRecipient = async (context) => {
	const params = {
		name: context.state.sessionUser.name,
		origin_dialog: 'greetings',
	};

	if (context.session.platform === 'browser') {
		params.uuid = context.session.user.id;
	} else {
		params.fb_id = context.session.user.id;
		params.picture = context.state.sessionUser.profilePic;
		// session: JSON.stringify(context.state),
	}

	// return recipient id, which will be used on the others endpoints
	const recipient = await assistenteAPI.postRecipient(context.state.politicianData.user_id, params);
	return recipient.id;
};


module.exports = async function App(context) {
	try {
		await context.setState({
			politicianData: await assistenteAPI.getPoliticianData('1'),
			sessionUser: { ...await context.getUserProfile() },
		});

		await context.setState({ recipientID: await postRecipient(context) });
		// await reloadTicket(context); // await help.resumoTicket(context.state.ticketTypes.ticket_types);

		await timer.deleteTimers(context.session.user.id);


		if (context.event.isPostback) {
			await context.setState({ lastPBpayload: context.event.postback.payload });
			await input.handlePostback(context);
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			await input.handleQuickReply(context);
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id, context.state.lastQRpayload, context.state.lastQRpayload);
		} else if (input.isButton(context) === true) {
			await context.setState({ lastQRpayload: context.event.rawEvent.message.value });
			await input.handleQuickReply(context);
		} else if (await input.isText(context) === true) {
			await input.handleText(context, incidenteCPFAux);
		} else if (context.event.isFile || context.event.isVideo || context.event.isImage) {
			if (['incidenteAskFile', 'incidenteI', 'incidenteA', 'incidenteFilesTimer'].includes(context.state.dialog)) {
				await dialogs.handleFiles(context, 'incidenteFilesTimer');
			} else if (['avançadoAskFile', 'avançadoM', 'avançadoA', 'avançadoFilesTimer'].includes(context.state.dialog)) {
				await dialogs.handleFiles(context, 'avançadoFilesTimer');
			}
		}

		switch (context.state.dialog) {
		case 'greetings':
			await context.sendImage(flow.avatarImage);
			if (context.session.platform !== 'browser') {
				await context.sendText(flow.greetings.text1.replace('<USERNAME>', context.state.sessionUser.firstName));
			} else {
				await context.sendText(flow.greetings.text1b);
			}
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text2]);
			await dialogs.sendMainMenu(context, flow.mainMenu.firstTime);
			break;
		case 'mainMenu':
			await dialogs.sendMainMenu(context);
			break;
		case 'faleConosco':
			await attach.sendMsgFromAssistente(context, 'fale-conosco', []);
			await dialogs.sendMainMenu(context);
			break;
		case 'duvidas':
			await dialogs.ask(context, flow.duvidas.intro, flow.ask, flow.duvidas.duvidaPlaceholder);
			break;
		case 'askEmailDuvida':
			await context.sendText(flow.duvidas.naoEntendi);
			await dialogs.ask(context, flow.duvidas.askEmail, flow.ask, flow.duvidas.emailPlaceholder);
			break;
		case 'solicitacoes':
			await context.setState({ whatWasTyped: 'Quero fazer uma solicitação' });
			await DF.dialogFlow(context);
			// await context.sendText(flow.solicitacoes.text1);
			// await dialogs.solicitacoesMenu(context);
			break;
		case 'confirmaSolicitacao':
			await dialogs.confirmaSolicitacao(context);
			break;
		case 'consumidor':
			await dialogs.consumidorMenu(context);
			break;
		case 'titularNao':
			await context.sendText(flow.CPFConfirm.revogacaoNao);
			await dialogs.sendMainMenu(context);
			break;
		case 'solicitacao1': // revogar
			await attach.sendMsgFromAssistente(context, 'ticket_type_1', [flow.revogar.text1, flow.revogar.text2]);
			await context.sendText(flow.revogar.text3, await attach.getQR(flow.revogar));
			break;
		case 'revogacaoNao':
			await context.sendText(flow.revogar.revogacaoNao);
			await dialogs.sendMainMenu(context);
			break;
		case 'askRevogarCPF':
			await dialogs.ask(context, flow.revogar.askRevogarCPF, flow.ask, flow.ask.cpfPlaceholder);
			break;
		case 'askRevogarTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.revogar.CPFNext));
			break;
		case 'askRevogarNome':
			await dialogs.ask(context, flow.revogar.askRevogarName, flow.ask, flow.ask.nomePlaceholder);
			break;
		case 'askRevogarMail':
			await dialogs.ask(context, flow.revogar.askRevogarMail, flow.ask, flow.ask.mailPlaceholder);
			break;
		case 'gerarTicket1':
			await context.setState({ ticketID: '1' });
			await dialogs.createTicket(context);
			break;
		case 'solicitacao':
			await attach.sendMsgFromAssistente(context, `ticket_type_${context.state.ticketID}`, []);
			await dialogs.ask(context, `${flow.solicitacao.askCPF.base}${flow.solicitacao.askCPF[context.state.ticketID]}.`, flow.ask, flow.ask.cpfPlaceholder);
			await context.setState({ dialog: 'askCPF' });
			break;
		case 'askTitular':
			await context.sendText(flow.askTitular.ask.replace('<CPF>', context.state.titularCPF), await attach.getQR(flow.askTitular));
			break;
		case 'askNome':
			await dialogs.ask(context, flow.revogar.askRevogarName, flow.ask, flow.ask.nomePlaceholder);
			break;
		case 'askMail':
			await dialogs.ask(context, flow.askMail.ask, flow.ask, flow.ask.mailPlaceholder);
			break;
		case 'gerarTicket':
			try {
				await dialogs.createTicket(context);
			} catch (error) {
				console.log('--\ncontext.state.ticketTypes.ticket_types', context.state.ticketTypes.ticket_types);
				console.log('context.state.ticketID', context.state.ticketID);
				await help.errorDetail(context, error);
			}
			break;
		case 'solicitacao7': // 'incidente'
			await context.setState({ incidenteAnonimo: false, titularFiles: [], fileTimerType: 7 });
			await attach.sendMsgFromAssistente(context, 'ticket_type_7', []);
			await context.sendText(flow.incidente.intro, await attach.getQR(flow.incidente));
			break;
		case 'incidenteA':
			await context.setState({ incidenteAnonimo: true });
			// falls throught
		case 'incidenteI':
		case 'incidenteAskFile':
			if (context.session.platform === 'browser') {
				await context.setState({ dialog: 'askDescricaoIdentificado' });
				if (context.state.incidenteAnonimo === true) await context.setState({ dialog: 'askDescricaoAnonimo' });
				await dialogs.ask(context, flow.askDescrição.ask, flow.ask, flow.ask.descricaoPlaceholder);
			} else {
				await context.setState({ titularFiles: [] }); // clean any past files
				await context.sendText(flow.incidente.askFile);
			}
			break;
		case 'incidenteCPF':
			await dialogs.ask(context, flow.incidente.incidenteCPF, flow.ask, flow.ask.cpfPlaceholder);
			break;
		case 'incidenteTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', incidenteCPFAux[context.session.user.id]), await attach.getQRCPF(flow.CPFConfirm, flow.incidente.CPFNext));
			await context.setState({ titularCPF: incidenteCPFAux[context.session.user.id] }); // passing memory data to state
			delete incidenteCPFAux[context.session.user.id];
			break;
		case 'incidenteNome':
			await dialogs.ask(context, flow.incidente.askName, flow.ask, flow.ask.nomePlaceholder);
			break;
		case 'incidenteEmail':
			await dialogs.ask(context, flow.incidente.askMail, flow.ask, flow.ask.mailPlaceholder);
			break;
		case 'gerarTicket7':
			await context.setState({ ticketID: '7' });
			await dialogs.createTicket(context);
			break;
		case 'atendimentoAvançado':
			await dialogs.atendimentoAvançado(context);
			break;
		case 'sobreLGPD':
			await attach.sendMsgFromAssistente(context, 'sobre_lgpd', [flow.sobreLGPD.text1]);
			await context.typingOn();
			await context.sendVideo(flow.sobreLGPD.videoLink);
			await context.typingOff();
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreDipiou':
			await attach.sendMsgFromAssistente(context, 'sobre_dipiou', [flow.sobreDipiou.text1]);
			await dialogs.sendMainMenu(context);
			break;
		case 'meuTicket':
			await dialogs.meuTicket(context);
			break;
		case 'cancelConfirmation':
			await context.setState({ currentTicket: await context.state.userTickets.tickets.find((x) => x.id.toString() === context.state.ticketID) });
			await context.sendText(flow.cancelConfirmation.confirm.replace('<TYPE>', context.state.currentTicket.type.name), await attach.getQR(flow.cancelConfirmation));
			break;
		case 'confirmaCancelamento':
			await dialogs.cancelTicket(context);
			break;
		case 'verTicketMsg':
			await dialogs.seeTicketMessages(context);
			break;
		case 'newTicketMsg':
			await dialogs.newTicketMessage(context);
			break;
		case 'createIssueDirect':
			await createIssue(context);
			break;
		case 'beginQuiz':
			await context.setState({ startedQuiz: true, typeQuiz: 'preparatory' });
			await context.sendText(flow.quiz.beginQuiz);
			// falls throught
		case 'startQuiz':
			await quiz.answerQuiz(context);
			break;
		case 'informacoes': {
			const buttons = await DF.buildInformacoesMenu(context);
			if (buttons) {
				await context.sendText(flow.informacoes.text1, buttons);
			} else {
				await context.sendText(flow.informacoes.text2, buttons);
				await timer.createInformacoesTimer(context.session.user.id, context);
			} }
			break;
		case 'infoRes': {
			const answer = context.state.infoRes[context.state.infoChoice];
			if (answer) {
				await help.sendTextAnswer(context, answer);
				await help.sendAttachment(context, answer);
			}
			await dialogs.sendMainMenu(context); }
			break;
		case 'notificationOn':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 1);
			await assistenteAPI.logNotification(context.session.user.id, context.state.politicianData.user_id, 3);
			await context.sendText(flow.notifications.on);
			await dialogs.sendMainMenu(context);
			break;
		case 'notificationOff':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 0);
			await assistenteAPI.logNotification(context.session.user.id, context.state.politicianData.user_id, 4);
			await context.sendText(flow.notifications.off);
			await dialogs.sendMainMenu(context);
			break;
		case 'incidenteFilesTimer':
		case 'avançadoFilesTimer':
		case 'createFilesTimer':
			await timer.createFilesTimer(context.session.user.id, context); // time to wait for the uploaded files to enter as new events on facebook
			break;
		case 'end':
			break;
		default:
			break;
		} // end switch case
	} catch (error) {
		await help.errorDetail(context, error);
	} // catch
};
