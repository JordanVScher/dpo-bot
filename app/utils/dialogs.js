const assistenteAPI = require('../chatbot_api');
const flow = require('./flow');
const attach = require('./attach');
const checkQR = require('./checkQR');
const help = require('./helper');

async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.sendText(textToSend, await checkQR.buildMainMenu(context));
}

async function checkFullName(context) {
	if (/^[a-zA-Z]+$/.test(context.state.whatWasTyped)) {
		await context.setState({ titularNome: context.state.whatWasTyped, dialog: 'askTitularCPF' });
	} else {
		await context.sendText(flow.titularSim.askTitularNameFail);
		await context.setState({ dialog: 'invalidName' });
	}
}

async function checkCPF(context) {
	const cpf = await help.getCPFValid(context.state.whatWasTyped);

	if (cpf) {
		await context.setState({ titularCPF: cpf, dialog: 'askTitularPhone' });
	} else {
		await context.sendText(flow.titularSim.askTitularCPFFail);
		await context.setState({ dialog: 'invalidCPF' });
	}
}

async function checkPhone(context) {
	const phone = await help.getPhoneValid(context.state.whatWasTyped);

	if (phone) {
		await context.setState({ titularPhone: phone, dialog: 'askTitularMail' });
	} else {
		await context.sendText(flow.titularSim.askTitularPhoneFail);
		await context.setState({ dialog: 'invalidPhone' });
	}
}

async function checkEmail(context) {
	if (context.state.whatWasTyped.includes('@')) {
		await context.setState({ titularMail: context.state.whatWasTyped, dialog: 'gerarTicket' });
	} else {
		await context.sendText(flow.titularSim.askTitularMailFail);
		await context.setState({ dialog: 'invalidMail' });
	}
}

async function meuTicket(context) {
	await context.setState({ userTickets: await assistenteAPI.getuserTickets(context.session.user.id) });

	if (context.state.userTickets.itens_count > 0) {
		for (const ticket of context.state.userTickets.tickets) { // eslint-disable-line no-restricted-syntax
			await attach.sendTicket(context, ticket);
		}
		await context.typing(1000 * 3);
	}
	await sendMainMenu(context);
}

async function atendimentoLGPD(context) {
	const options = await checkQR.buildAtendimento(context);
	if (!options) {
		await sendMainMenu(context);
	} else {
		await context.sendText(flow.atendimentoLGPD.text1, options);
	}
}

module.exports = {
	sendMainMenu, checkFullName, checkCPF, checkPhone, checkEmail, meuTicket, atendimentoLGPD,
};
