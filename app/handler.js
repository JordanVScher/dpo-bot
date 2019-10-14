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

module.exports = async (context) => {
	try {
		// let user = await getUser(context)
		// we reload politicianData on every useful event
		await context.setState({ politicianData: await assistenteAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
		// console.log(context.state.politicianData);

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
			await context.setState({ lastPBpayload: context.event.postback.payload });
			if (context.state.lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
				await context.setState({ dialog: 'greetings' });
				await context.setState({ dialog: 'solicitacao1' });
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
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			if (context.state.lastQRpayload.slice(0, 4) === 'quiz') {
			// await quiz.handleAnswerA(context, context.state.lastQRpayload.replace('quiz', '').replace(context.state.currentQuestion.code), '');
				await quiz.handleAnswer(context, context.state.lastQRpayload.charAt(4));
			} else if (context.state.lastQRpayload.slice(0, 13) === 'extraQuestion') {
				await quiz.answerExtraQuestion(context);
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
				await dialogs.checkFullName(context, 'titularNome', 'askRevogarPhone', 'invalidName');
			} else if (['askRevogarPhone', 'invalidPhone'].includes(context.state.dialog)) {
				await dialogs.checkPhone(context, 'titularPhone', 'askRevogarMail', 'invalidPhone');
			} else if (['askRevogarMail', 'invalidMail'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket1', 'invalidMail');
				// -- 2
			} else if (['solicitacao2', 'consultaCPF'].includes(context.state.dialog)) {
				await dialogs.checkCPF(context, 'titularCPF', 'consultaTitular', 'consultaCPF');
			} else if (['consultaEmail', 'consultaEmailReAsk'].includes(context.state.dialog)) {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket2', 'consultaEmailReAsk');
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
			await dialogs.solicitacoesMenu(context);
			break;
		case 'titularNao':
			await context.sendText(flow.CPFConfirm.revogacaoNao);
			await dialogs.sendMainMenu(context);
			break;
		case 'solicitacao1': // revogar
			await attach.sendMsgFromAssistente(context, 'ticket_type_1', [flow.revogar.text1, flow.revogar.text2, flow.revogar.text3, flow.revogar.text4]);
			await context.sendText(flow.revogar.text5, await attach.getQR(flow.revogar));
			break;
		case 'revogacaoNao':
			await context.sendText(flow.revogar.revogacaoNao);
			await dialogs.sendMainMenu(context);
			break;
		case 'askRevogarCPF':
			await context.sendText(flow.revogar.askRevogarCPF);
			break;
		case 'askRevogarTitular':
			await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.titularCPF), await attach.getQRCPF(flow.CPFConfirm, flow.revogar.CPFNext));
			break;
		case 'askRevogarName':
			await context.sendText(flow.revogar.askRevogarName);
			break;
		case 'askRevogarPhone':
			await context.sendText(flow.revogar.askRevogarPhone);
			break;
		case 'askRevogarMail':
			await context.sendText(flow.revogar.askRevogarMail);
			break;
		case 'gerarTicket1':
			await dialogs.createTicket(context,
				await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 1, await help.buildTicket(context.state)));
			break;
		// case 'solicitacao2': // 'consulta'
		// 	await attach.sendMsgFromAssistente(context, 'ticket_type_2', []);
		// 	await context.sendText(flow.consulta.consultaCPF);
		// 	break;
		// case 'consultaTitular':
		// 	await context.sendText(flow.CPFConfirm.ask.replace('<CPF>', context.state.dadosCPF), await attach.getQRCPF(flow.CPFConfirm, flow.consulta.CPFNext));
		// 	break;
		// case 'consultaEmail':
		// 	await context.sendText(flow.consulta.askMail);
		// 	break;
		// case 'gerarTicket2':
		// 	await dialogs.createTicket(context,
		// 		await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 2, await help.buildTicket(context.state)));
		// 	break;
		case 'sobreLGPD':
			await context.sendText(flow.sobreLGPD.text1);
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
		case 'faleConosco':
			await context.sendText(flow.faleConosco.text1);
			await timer.createFaleConoscoTimer(context.session.user.id, context);
			break;
		case 'testeAtendimento':
			await context.sendText(flow.solicitacoes.text1, await attach.getQR(flow.solicitacoes));
			break;
		case 'notificationOn':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 1);
			await assistenteAPI.logNotification(context.session.user.id, context.state.politicianData.user_id, 3);
			await context.sendText(flow.notifications.on);
			break;
		case 'notificationOff':
			await assistenteAPI.updateBlacklistMA(context.session.user.id, 0);
			await assistenteAPI.logNotification(context.session.user.id, context.state.politicianData.user_id, 4);
			await context.sendText(flow.notifications.off);
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
}; // handler function
