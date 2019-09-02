const assistenteAPI = require('./chatbot_api');
// const opt = require('./util/options');
const { createIssue } = require('./utils/send_issue');
const flow = require('./utils/flow');
const help = require('./utils/helper');
const dialogs = require('./utils/dialogs');
const attach = require('./utils/attach');
const DF = require('./utils/dialogFlow');

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
			await context.setState({ dialog: context.state.lastPBpayload });
			if (context.state.lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
				await context.setState({ dialog: 'greetings' });
			}
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			await context.setState({ dialog: context.state.lastQRpayload });
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.message.quick_reply.payload, context.event.message.quick_reply.payload);
		} else if (context.event.isText) {
			await context.setState({ whatWasTyped: context.event.message.text });
			if (context.state.dialog === 'titularSim' || context.state.dialog === 'invalidName') {
				await dialogs.checkFullName(context);
			} else if (context.state.dialog === 'askTitularCPF' || context.state.dialog === 'invalidCPF') {
				await dialogs.checkCPF(context);
			} else if (context.state.dialog === 'askTitularPhone' || context.state.dialog === 'invalidPhone') {
				await dialogs.checkPhone(context);
			} else if (context.state.dialog === 'askTitularMail' || context.state.dialog === 'invalidMail') {
				await dialogs.checkEmail(context);
			} else if (context.state.dialog === 'meusDados' || context.state.dialog === 'meusDadosCPF') {
				await context.setState({ dadosCPF: await help.getCPFValid(context.state.whatWasTyped) });
				if (context.state.dadosCPF) {
					await context.setState({ dadosCPF: context.state.whatWasTyped, dialog: 'meusDadosTitular' });
				} else {
					await context.setState({ dadosCPF: '', dialog: 'meusDadosCPF' });
					await context.sendText(flow.titularSim.askTitularCPFFail);
				}
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
			await context.sendText(flow.meusDados.meusDadosTitular, await attach.getQR(flow.meusDados));
			break;
		case 'dadosTitularNao':
			await context.sendText(flow.meusDados.dadosTitudadosTitularNaolarSim);
			await dialogs.sendMainMenu(context);
			break;
		case 'dadosTitularSim': // meusDados
			await context.sendText(flow.meusDados.dadosTitularSim);
			await assistenteAPI.postNewTicket(context.state.politicianData.organization_chatbot_id, context.session.user.id, 2, await help.buildTicketVisualizar(context.state));
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreLGPD':
			await context.sendText(flow.sobreLGPD.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'revogarDados':
			await context.sendText(flow.revogarDados.text1);
			await context.sendText(flow.revogarDados.text2);
			await context.sendText(flow.revogarDados.text3);
			await context.sendText(flow.revogarDados.text4, await attach.getQR(flow.revogarDados));
			break;
		case 'revogacaoSim':
			await context.sendText(flow.revogacaoSim.text1);
			await context.sendText(flow.revogacaoSim.text2);
			await context.sendText(flow.revogacaoSim.text3, await attach.getQR(flow.revogacaoSim));
			break;
		case 'revogacaoNao':
			await context.sendText(flow.revogacaoNao.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'sobreDipiou':
			await context.sendText(flow.sobreDipiou.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'titularNao':
			await context.sendText(flow.titularNao.text1);
			await dialogs.sendMainMenu(context);
			break;
		case 'titularSim':
			await context.sendText(flow.titularSim.text1);
			await context.sendText(flow.titularSim.askTitularName);
			break;
		case 'askTitularCPF':
			await context.sendText(flow.titularSim.askTitularCPF);
			break;
		case 'askTitularPhone':
			await context.sendText(flow.titularSim.askTitularPhone);
			break;
		case 'askTitularMail':
			await context.sendText(flow.titularSim.askTitularMail);
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
		case 'createIssueDirect':
			await createIssue(context);
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
