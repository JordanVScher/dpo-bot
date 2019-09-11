const assistenteAPI = require('./chatbot_api');
// const opt = require('./util/options');
const { createIssue } = require('./utils/send_issue');
const flow = require('./utils/flow');
const help = require('./utils/helper');
const dialogs = require('./utils/dialogs');
const attach = require('./utils/attach');
const DF = require('./utils/dialogFlow');
const quiz = require('./utils/quiz');
const { checkUserOnLabelName } = require('./utils/postback');

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

		if (context.event.isPostback) {
			await context.setState({ lastPBpayload: context.event.postback.payload });
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
			} else if (context.state.dialog === 'askRevogarCPF' || context.state.dialog === 'invalidCPF') {
				await dialogs.checkCPF(context, 'titularCPF', 'askRevogarTitular', 'invalidCPF', flow.revogarDados.askRevogarCPFFail);
			} else if (context.state.dialog === 'askRevogarName' || context.state.dialog === 'invalidName') {
				await dialogs.checkFullName(context, 'titularNome', 'askRevogarPhone', 'invalidName', flow.revogarDados.askRevogarNameFail);
			} else if (context.state.dialog === 'askRevogarPhone' || context.state.dialog === 'invalidPhone') {
				await dialogs.checkPhone(context, 'titularPhone', 'askRevogarMail', 'invalidPhone', flow.revogarDados.askRevogarPhoneFail);
			} else if (context.state.dialog === 'askRevogarMail' || context.state.dialog === 'invalidMail') {
				await dialogs.checkEmail(context, 'titularMail', 'gerarTicket', 'invalidMail', flow.revogarDados.askRevogarMailFail);
			} else if (context.state.dialog === 'meusDados' || context.state.dialog === 'meusDadosCPF') {
				await dialogs.checkCPF(context, 'dadosCPF', 'meusDadosTitular', 'meusDadosCPF', flow.revogarDados.askRevogarCPFFail);
			} else if (context.state.dialog === 'meusDadosEmail' || context.state.dialog === 'meusDadosEmailReAsk') {
				await dialogs.checkEmail(context, 'dadosMail', 'meusDadosEnd', 'meusDadosEmailReAsk', flow.meusDados.askMail);
			} else if (context.state.onTextQuiz === true) {
				await context.setState({ whatWasTyped: parseInt(context.state.whatWasTyped, 10) });
				if (Number.isInteger(context.state.whatWasTyped, 10) === true) {
					await quiz.handleAnswer(context, context.state.whatWasTyped);
				} else {
					await context.sendText('Formato inválido, digite só um número, exemplo 10');
					await context.setState({ dialog: 'startQuiz' });
				}
			} else if (context.state.whatWasTyped.toLowerCase() === process.env.GET_PERFILDATA && await checkUserOnLabelName(context.session.user.id, 'admin')) {
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
			await context.sendText(flow.greetings.text2);
			await dialogs.sendMainMenu(context);
			await context.setState({ sendShare: true });
			break;
		case 'mainMenu':
			await dialogs.sendMainMenu(context);
			break;
		case 'atendimentoLGPD':
			await dialogs.atendimentoLGPD(context);
			break;
		case 'meusDados':
			await context.sendText(flow.meusDados.meusDadosCPF);
			break;
		case 'meusDadosTitular':
			await context.sendText(flow.meusDados.meusDadosTitular.replace('<CPF>', context.state.dadosCPF), await attach.getQR(flow.meusDados));
			break;
		case 'dadosTitularNao':
			await context.sendText(flow.meusDados.dadosTitudadosTitularNaolarSim);
			await dialogs.sendMainMenu(context);
			break;
		case 'meusDadosEmail':
			await context.sendText(flow.meusDados.askMail);
			break;
		case 'meusDadosEnd':
			await context.sendText(flow.meusDados.meusDadosFim);
			await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 2, await help.buildTicketVisualizar(context.state));
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreLGPD':
			await context.sendText(flow.sobreLGPD.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreDipiou':
			await context.sendText(flow.sobreDipiou.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'revogarDados':
			await context.sendText(flow.revogarDados.text1);
			await context.sendText(flow.revogarDados.text2);
			await context.sendText(flow.revogarDados.text3);
			await context.sendText(flow.revogarDados.text4, await attach.getQR(flow.revogarDados));
			break;
		case 'revogacaoNao':
			await context.sendText(flow.revogacaoNao.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'askRevogarCPF':
			await context.sendText(flow.revogarDados.askRevogarCPF);
			break;
		case 'askRevogarTitular':
			await context.sendText(flow.renovarDadosAskTitular.ask.replace('<CPF>', context.state.titularCPF), await attach.getQR(flow.renovarDadosAskTitular));
			break;
		case 'titularNao':
			await dialogs.sendMainMenu(context);
			break;
		case 'askRevogarName':
			await context.sendText(flow.revogarDados.askRevogarName);
			break;
		case 'askRevogarPhone':
			await context.sendText(flow.revogarDados.askRevogarPhone);
			break;
		case 'askRevogarMail':
			await context.sendText(flow.revogarDados.askRevogarMail);
			break;
		case 'gerarTicket': // revogar dados
			await context.sendText(flow.titularDadosFim.text1);
			await context.sendImage(flow.titularDadosFim.gif);
			await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 1, await help.buildTicketRevogar(context.state));
			await dialogs.sendMainMenu(context, flow.titularDadosFim.ticketOpened);
			break;
		case 'meuTicket':
			await dialogs.meuTicket(context);
			break;
		case 'compartilhar':
			await context.sendText(flow.share.txt1);
			await attach.sendShare(context, flow.share.cardData);
			await dialogs.sendMainMenu(context);
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
		case 'testeAtendimento':
			await context.sendText(flow.atendimentoLGPD.text1, await attach.getQR(flow.atendimentoLGPD));
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
