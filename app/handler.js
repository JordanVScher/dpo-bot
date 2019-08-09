const assistenteAPI = require('./chatbot_api');
// const opt = require('./util/options');
const { createIssue } = require('./utils/send_issue');
const flow = require('./utils/flow');
const help = require('./utils/helper');
const dialogs = require('./utils/dialogs');
const attach = require('./utils/attach');

module.exports = async (context) => {
	try {
		// console.log(await MaAPI.getLogAction()); // print possible log actions
		if (!context.state.dialog || context.state.dialog === '' || (context.event.postback && context.event.postback.payload === 'greetings')) { // because of the message that comes from the comment private-reply
			await context.resetState(); await context.setState({ dialog: 'greetings' });
		}
		// let user = await getUser(context)
		// we reload politicianData on every useful event
		await context.setState({ politicianData: await assistenteAPI.getPoliticianData(context.event.rawEvent.recipient.id) });
		console.log(context.state.politicianData);

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
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.postback.payload, context.event.postback.title);
		} else if (context.event.isQuickReply) {
			await context.setState({ lastQRpayload: context.event.quickReply.payload });
			await context.setState({ dialog: context.state.lastQRpayload });
			await assistenteAPI.logFlowChange(context.session.user.id, context.state.politicianData.user_id,
				context.event.message.quick_reply.payload, context.event.message.quick_reply.payload);
		} else if (context.event.isText) {
			await context.setState({ whatWasTyped: context.event.message.text });
			if (context.state.dialog === 'titularSim') {
				await context.setState({ titularNome: context.state.whatWasTyped, dialog: 'askTitularCPF' });
			} if (context.state.dialog === 'askTitularCPF') {
				await context.setState({ titularCPF: context.state.whatWasTyped, dialog: 'askTitularPhone' });
			} if (context.state.dialog === 'askTitularPhone') {
				await context.setState({ titularPhone: context.state.whatWasTyped, dialog: 'askTitularMail' });
			} if (context.state.dialog === 'askTitularMail') {
				await context.setState({ titularMail: context.state.whatWasTyped, dialog: 'titularDadosFim' });
			} else {
				await dialogs.dialogFlow(context);
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
			if (!context.state.ticketOn) {
				await context.sendText(flow.atendimentoLGPD.text1, await attach.getQR(flow.atendimentoLGPD));
			} else {
				await context.sendText(flow.atendimentoLGPD.waitQuestion);
			}
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
		case 'titularDadosFim':
			await context.sendText(flow.titularDadosFim.text1);
			await context.sendImage(flow.titularDadosFim.gif);
			await context.sendText(flow.titularDadosFim.text2);
			await context.setState({ ticketOn: true });
			await dialogs.sendMainMenu(context, flow.titularDadosFim.ticketOpened);
			break;
		case 'createIssueDirect':
			await createIssue(context);
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
