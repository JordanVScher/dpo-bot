const flow = require('./flow');
const quiz = require('./quiz');
const attach = require('./attach');
const DF = require('./dialogFlow');
const dialogs = require('./dialogs');
const { checkUserOnLabelName } = require('./labels');

const handleQuickReply = async (context) => {
	// if (context.state.onSolicitacoes) await DF.textRequestDF('sair', context.session.user.id);
	const { lastQRpayload } = context.state;
	await context.setState({ onSolicitacoes: false, solicitacaoCounter: 0 });
	if (lastQRpayload === 'greetings') {
		if (context.session.platform === 'browser') await context.resetMessages();
		await context.setState({ dialog: 'greetings' });
	} else if (lastQRpayload.slice(0, 4) === 'quiz') {
		await quiz.handleAnswer(context, lastQRpayload.charAt(4));
	} else if (lastQRpayload.slice(0, 13) === 'extraQuestion') {
		await quiz.answerExtraQuestion(context);
	} else if (lastQRpayload.slice(0, 7) === 'InfoRes') {
		await context.setState({ dialog: 'infoRes', infoChoice: lastQRpayload.replace('InfoRes', '') });
	} else if (lastQRpayload.slice(0, 9) === 'leaveTMsg') {
		await context.setState({ dialog: 'leaveTMsg', ticketID: lastQRpayload.replace('leaveTMsg', '') });
		await context.sendText(flow.leaveTMsg.text1, await attach.getQR(flow.leaveTMsg));
	} else if (['solicitacao2', 'solicitacao3', 'solicitacao4', 'solicitacao5', 'solicitacao6', 'solicitacao8', 'solicitacao9', 'solicitacao10'].includes(context.state.lastQRpayload)) {
		await context.setState({ ticketID: lastQRpayload.replace('solicitacao', '') });
		await context.setState({ dialog: 'solicitacao', ticketID: await parseInt(context.state.ticketID, 10) });
	} else {
		await context.setState({ dialog: lastQRpayload });
	}
};

const handlePostback = async (context) => {
	await context.setState({ onSolicitacoes: false, solicitacaoCounter: 0 });

	const { lastPBpayload } = context.state;
	if (context.state.onSolicitacoes) await DF.textRequestDF('sair', context.session.user.id);

	if (lastPBpayload === 'greetings' || !context.state.dialog || context.state.dialog === '') {
		await context.setState({ dialog: 'greetings' });
	} else if (lastPBpayload.slice(0, 9) === 'cancelarT') {
		await context.setState({ dialog: 'cancelConfirmation', ticketID: lastPBpayload.replace('cancelarT', '') });
	} else if (lastPBpayload.slice(0, 9) === 'leaveTMsg') {
		await context.setState({ dialog: 'leaveTMsg', ticketID: lastPBpayload.replace('leaveTMsg', '') });
		await context.sendText(flow.leaveTMsg.text1, await attach.getQR(flow.leaveTMsg));
	} else if (lastPBpayload.slice(0, 7) === 'verTMsg') {
		await context.setState({ dialog: 'verTMsg', ticketID: lastPBpayload.replace('verTMsg', '') });
	} else {
		await context.setState({ dialog: lastPBpayload });
	}
};


const handleText = async (context, incidenteCPFAux) => {
	const { whatWasTyped } = context.state;
	const cancelKeywords = ['cancelar', 'sair', 'voltar', 'desisto'];

	if (context.session.platform === 'browser' && context.state.onSolicitacoes !== true && cancelKeywords.includes(whatWasTyped.toLowerCase())) {
		await context.setState({ dialog: 'mainMenu' });
	} else if (['solicitacao', 'askCPF', 'invalidCPF'].includes(context.state.dialog)) {
		await dialogs.checkCPF(context, 'titularCPF', 'askTitular', 'invalidCPF');
	} else if (['askMail', 'invalidMail'].includes(context.state.dialog)) {
		await dialogs.checkEmail(context, 'titularMail', 'gerarTicket', 'invalidMail');
		// -- 1
	} else if (['askRevogarCPF', 'invalidCPF'].includes(context.state.dialog)) {
		await dialogs.checkCPF(context, 'titularCPF', 'askRevogarTitular', 'invalidCPF');
	} else if (['askRevogarMail', 'invalidMail'].includes(context.state.dialog)) {
		await dialogs.checkEmail(context, 'titularMail', 'gerarTicket1', 'invalidMail');
		// -- 7
	} else if (['incidenteAskPDF', 'incidenteCPF', 'incidenteFilesTimer'].includes(context.state.dialog)) {
		incidenteCPFAux[context.session.user.id] = await dialogs.checkCPF(context, 'titularCPF', 'incidenteTitular', 'incidenteCPF');
	} else if (['incidenteEmail', 'incidenteEmailReAsk'].includes(context.state.dialog)) {
		await dialogs.checkEmail(context, 'titularMail', 'gerarTicket7', 'incidenteEmailReAsk');
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
	} else if (context.state.whatWasTyped === process.env.NOTIFICATION_KEY) {
		await context.setState({ wantNotification: true, notificacao: null, dialog: 'mainMenu' });
		await context.sendText('Você receberá as notificações');
	} else {
		await DF.dialogFlow(context);
	}
};

const isButton = (context) => {
	if (context.event && context.event.rawEvent && context.event.rawEvent.message && context.event.rawEvent.message.type === 'button') {
		return true;
	}

	return false;
};

const isText = async (context) => {
	if (context.event.isText) {
		await context.setState({ whatWasTyped: context.event.message.text });
		return true;
	}
	if (context.event && context.event.rawEvent && context.event.rawEvent.message && context.event.rawEvent.message.type === 'text') {
		await context.setState({ whatWasTyped: context.event.rawEvent.message.value });
		return true;
	}
	return false;
};

module.exports = {
	handleQuickReply,
	handlePostback,
	handleText,
	isText,
	isButton,
};
