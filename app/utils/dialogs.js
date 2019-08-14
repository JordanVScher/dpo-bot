const flow = require('./flow');
// const attach = require('./attach');
const checkQR = require('./checkQR');
const help = require('./helper');

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


async function sendMainMenu(context, text) {
	const textToSend = text || flow.mainMenu.text1;
	await context.sendText(textToSend, await checkQR.buildMainMenu(context.state));
}

module.exports = {
	sendMainMenu, checkFullName, checkCPF, checkPhone, checkEmail,
};
