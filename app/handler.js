// handler function
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
const { checkUserOnLabelName } = require('./utils/labels');

const incidenteCPFAux = {}; // because the file timer stops setState from working

module.exports = async (context) => {
	try {
		// let user = await getUser(context)
		// we reload politicianData on every useful event
		await context.setState({ politicianData: await assistenteAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
		// console.log(context.state.ticketTypes);

		// we update context data at every interaction that's not a comment or a post
		await assistenteAPI.postRecipient(context.state.politicianData.user_id, {
			fb_id: context.session.user.id,
			name: `${context.session.user.first_name} ${context.session.user.last_name}`,
			origin_dialog: 'greetings',
			picture: context.session.user.profile_pic,
			// session: JSON.stringify(context.state),
		});

		await timer.deleteTimers(context.session.user.id);

		if (context.event.isPostback) {
			if (context.state.onSolicitacoes) await DF.textRequestDF('sair', context.session.user.id);
			await context.setState({ lastPBpayload: context.event.postback.payload, onSolicitacoes: false, solicitacaoCounter: 0 });
			if (context.state.lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
				await context.setState({ dialog: 'greetings' });
			} else if (context.state.lastPBpayload.slice(0, 9) === 'cancelarT') {
				await context.setState({ dialog: 'cancelConfirmation', ticketID: context.state.lastPBpayload.replace('cancelarT', '') });
			} else if (context.state.lastPBpayload.slice(0, 9) === 'leaveTMsg') {
				await context.setState({ dialog: 'leaveTMsg', ticketID: context.state.lastPBpayload.replace('leaveTMsg', '') });
				await context.sendText(flow.leaveTMsg.text1, await attach.getQR(flow.leaveTMsg));
			} else if (context.state.lastPBpayload.slice(0, 7) === 'verTMsg') {
				await context.setState({ dialog: 'verTMsg', ticketID: context.state.lastPBpayload.replace('verTMsg', '') });
			} else {
				await context.setState({ dialog: context.state.lastPBpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			// if (context.state.onSolicitacoes) await DF.textRequestDF('sair', context.session.user.id);
			await context.setState({ lastQRpayload: context.event.quickReply.payload, onSolicitacoes: false, solicitacaoCounter: 0 });
			if (context.state.lastQRpayload.slice(0, 4) === 'quiz') {
			// await quiz.handleAnswerA(context, context.state.lastQRpayload.replace('quiz', '').replace(context.state.currentQuestion.code), '');
				await quiz.handleAnswer(context, context.state.lastQRpayload.charAt(4));
			} else if (context.state.lastQRpayload.slice(0, 13) === 'extraQuestion') {
				await quiz.answerExtraQuestion(context);
			} else if (context.state.lastQRpayload.slice(0, 7) === 'InfoRes') {
				await context.setState({ dialog: 'infoRes', infoChoice: context.state.lastQRpayload.replace('InfoRes', '') });
			} else if (context.state.lastQRpayload.slice(0, 9) === 'leaveTMsg') {
				await context.setState({ dialog: 'leaveTMsg', ticketID: context.state.lastQRpayload.replace('leaveTMsg', '') });
				await context.sendText(flow.leaveTMsg.text1, await attach.getQR(flow.leaveTMsg));
			} else {
				await context.setState({ dialog: context.state.lastQRpayload });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.message.quick_reply.payload, context.event.message.quick_reply.payload);
		} else if (context.event.isText) {
			await context.setState({ whatWasTyped: context.event.message.text });

			if (context.state.whatWasTyped === process.env.TESTEKEYWORD) {
				await context.setState({ dialog: 'testeAtendimento' });
				// -- 1
			} else if (['askRevogarCPF', 'invalidCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'askRevogarTitular', 'invalidCPF');
			} else if (['askRevogarName', 'invalidName'].includes(context.state.dialog)) {
				await dialogs.checkFullName(context, 'titularNome', 'askRevogarMail', 'invalidName');
			} else if (['askRevogarPhone', 'invalidPhone'].includes(context.state.dialog)) {
				await dialogs.checkPhone(context, 'titularPhone', 'askRevogarMail', 'invalidPhone');
			} else if (['askRevogarMail', 'invalidMail'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket1', 'invalidMail');
				// -- 2
			} else if (['solicitacao2', 'consultarCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'consultarTitular', 'consultarCPF');
			} else if (['consultarEmail', 'consultarEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket2', 'consultarEmailReAsk');
				// -- 3
			} else if (['solicitacao3', 'alterarCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'alterarTitular', 'alterarCPF');
			} else if (['alterarEmail', 'alterarEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket3', 'alterarEmailReAsk');
				// -- 5
			} else if (['solicitacao5', 'faleConoscoCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'faleConoscoTitular', 'faleConoscoCPF');
			} else if (['faleConoscoEmail', 'faleConoscoEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket5', 'faleConoscoEmailReAsk');
				// -- 6
			} else if (['solicitacao6', 'atendimentoAskCPF', 'atendimentoCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'atendimentoTitular', 'atendimentoCPF');
			} else if (['atendimentoEmail', 'atendimentoEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket6', 'atendimentoEmailReAsk');
				// -- 7
			} else if (['incidenteAskPDF', 'incidenteCPF', 'incidenteFilesTimer'].includes(context.state.dialog)) {
				incidenteCPFAux[context.session.user.id] = await dialogs.checkCPF(context, 'titularCPF', 'incidenteTitular', 'incidenteCPF');
			} else if (['incidenteEmail', 'incidenteEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket7', 'incidenteEmailReAsk');
				// -- 9
			} else if (['solicitacao9', 'avançadoMAskCPF', 'avançadoMCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'avançadoMTitular', 'avançadoMCPF');
			} else if (['avançadoMEmail', 'avançadoMEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket9', 'avançadoMEmailReAsk');
				// -- 10
			} else if (['solicitacao10', 'avançadoAAskCPF', 'avançadoACPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'avançadoATitular', 'avançadoACPF');
			} else if (['avançadoAEmail', 'avançadoAEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket10', 'avançadoMEmailReAsk');
				// --
			} else if (context.state.onTextQuiz === true) {
				await context.setState({ whatWasTyped: parseInt(context.state.whatWasTyped, 10) });
				if (Number.isInteger(context.state.whatWasTyped, 10) === true) {
					await quiz.handleAnswer(context, context.state.whatWasTyped);
				} else {
					await context.sendText('Formato inválido, digite só um número, exemplo 10');
					await context.setState({ dialog: 'startQuiz' });
				}
			} else if (context.state.whatWasTyped.toLowerCase() === process.env.GET_PERFILDATA && await checkUserOnLabelName(context.session.user.id, 'admin', context.state.politicianData.fb_access_token)) {
				await dialogs.handleReset(context);
			} else if (context.state.dialog === 'leaveTMsg') {
				await context.setState({ dialog: 'newTicketMsg', ticketMsg: context.state.whatWasTyped });
			} else {
				await DF.dialogFlow(context);
			}
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
			await context.sendText(flow.greetings.text1.replace('<USERNAME>', context.session.user.first_name));
			await attach.sendMsgFromAssistente(context, 'greetings', [flow.greetings.text2]);
			await dialogs.sendMainMenu(context, flow.mainMenu.firstTime);
			break;
		case 'mainMenu':
			await dialogs.sendMainMenu(context);
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
			await context.sendText(flow.revogar.askRevogarCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'askRevogarTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.revogar.CPFNext));
			break;
		case 'askRevogarName':
			await context.sendText(flow.revogar.askRevogarName, await attach.getQR(flow.askCPF));
			break;
		case 'askRevogarPhone':
			await context.sendText(flow.revogar.askRevogarPhone, await attach.getQR(flow.askCPF));
			break;
		case 'askRevogarMail':
			await context.sendText(flow.revogar.askRevogarMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket1':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 1, await help.buildTicket(context.state)));
			break;
		case 'solicitacao2': // 'consultar'
			await attach.sendMsgFromAssistente(context, 'ticket_type_2', []);
			await context.sendText(flow.consultar.consultarCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'consultarTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.consultar.CPFNext));
			break;
		case 'consultarEmail':
			await context.sendText(flow.consultar.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket2':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 2, await help.buildTicket(context.state)));
			break;
		case 'solicitacao3': // 'alterar'
			await attach.sendMsgFromAssistente(context, 'ticket_type_3', []);
			await context.sendText(flow.alterar.alterarCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'alterarTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.alterar.CPFNext));
			break;
		case 'alterarEmail':
			await context.sendText(flow.alterar.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket3':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 3, await help.buildTicket(context.state)));
			break;
		case 'solicitacao5': // 'fale conosco'
			await attach.sendMsgFromAssistente(context, 'ticket_type_5', []);
			await context.sendText(flow.faleConosco.faleConoscoCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'faleConoscoTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.faleConosco.CPFNext));
			break;
		case 'faleConoscoEmail':
			await context.sendText(flow.faleConosco.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket5':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 5, await help.buildTicket(context.state)));
			break;
		case 'solicitacao6': // 'atendimento'
			await attach.sendMsgFromAssistente(context, 'ticket_type_6', []);
			await context.sendText(flow.atendimento.intro, await attach.getQR(flow.atendimento));
			break;
		case 'atendimentoAskCPF':
			await context.sendText(flow.atendimento.atendimentoCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'atendimentoTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.atendimento.CPFNext));
			break;
		case 'atendimentoEmail':
			await context.sendText(flow.atendimento.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket6':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 6, await help.buildTicket(context.state)));
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
			await context.setState({ titularFiles: [] }); // clean any past files
			await context.sendText(flow.incidente.askFile);
			break;
		case 'incidenteTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', incidenteCPFAux[context.session.user.id]), await attach.getQRCPF(flow.CPFConfirm, flow.incidente.CPFNext));
			await context.setState({ titularCPF: incidenteCPFAux[context.session.user.id] }); // passing memory data to state
			delete incidenteCPFAux[context.session.user.id];
			break;
		case 'incidenteEmail':
			await context.sendText(flow.incidente.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket7':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 7, await help.buildTicket(context.state), '', 0, context.state.titularFiles));
			break;
		case 'solicitacao8': // 'portabilidade'
		case 'portabilidadeAskCPF':
			await context.sendText(flow.portabilidade.atendimentoCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'portabilidadeTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.portabilidade.CPFNext));
			break;
		case 'portabilidadeEmail':
			await context.sendText(flow.portabilidade.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket8':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 8, await help.buildTicket(context.state)));
			break;
		case 'atendimentoAvançado':
			await context.sendText(flow.atendimentoAvançado.intro, await attach.getQR(flow.atendimentoAvançado));
			break;
		case 'solicitacao9': // 'Avançado Mídia'
		case 'avançadoMAskCPF':
			await context.sendText(flow.avançadoMidia.atendimentoCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'avançadoMTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.avançadoMidia.CPFNext));
			break;
		case 'avançadoMEmail':
			await context.sendText(flow.avançadoMidia.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket9':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 9, await help.buildTicket(context.state)));
			break;
		case 'solicitacao10': // 'Avançado ANDP'
		case 'avançadoAAskCPF':
			await context.sendText(flow.avançadoANDP.atendimentoCPF + flow.askCPF.clickTheButton, await attach.getQR(flow.askCPF));
			break;
		case 'avançadoATitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.avançadoANDP.CPFNext));
			break;
		case 'avançadoAEmail':
			await context.sendText(flow.avançadoANDP.askMail, await attach.getQR(flow.askCPF));
			break;
		case 'gerarTicket10':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 10, await help.buildTicket(context.state)));
			break;
		case 'sobreLGPD':
			await context.sendText(flow.sobreLGPD.text1);
			await context.sendVideo(flow.sobreLGPD.videoLink);
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreDipiou':
			await context.sendText(flow.sobreDipiou.text1);
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
		case 'testeAtendimento':
			await context.sendText(flow.solicitacoes.text1, await attach.getQR(flow.solicitacoes));
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
		} // end switch case
	} catch (error) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(error);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.'); // warning user

		await help.Sentry.configureScope(async (scope) => { // sending to sentry
			scope.setUser({ username: context.session.user.first_name });
			scope.setExtra('state', context.state);
			throw error;
		});
	} // catch
};
