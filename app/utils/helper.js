const Sentry = require('@sentry/node');
const dialogFlow = require('apiai-promise');
const accents = require('remove-accents');
const validarCpf = require('validar-cpf');

// Sentry - error reporting
Sentry.init({	dsn: process.env.SENTRY_DSN, environment: process.env.ENV, captureUnhandledRejections: false });

async function addChar(a, b, position) { return a.substring(0, position) + b + a.substring(position); }

// separates string in the first dot on the second half of the string
async function separateString(someString) {
	if (someString.trim()[someString.length - 1] !== '.') { // trying to guarantee the last char is a dot so we never use halfLength alone as the divisor
		someString += '.'; // eslint-disable-line no-param-reassign
	}
	const halfLength = Math.ceil(someString.length / 2.5); // getting more than half the length (the bigger the denominator the shorter the firstString tends to be)
	const newString = someString.substring(halfLength); // get the second half of the original string
	const sentenceDot = new RegExp('(?<!www)\\.(?!com|br|rj|sp|mg|bh|ba|sa|bra|gov|org)', 'i');// Regex -> Don't consider dots present in e-mails and urls
	// getting the index (in relation to the original string -> halfLength) of the first dot on the second half of the string. +1 to get the actual dot.
	const dotIndex = halfLength + newString.search(sentenceDot) + 1;

	const firstString = someString.substring(0, dotIndex);
	const secondString = someString.substring(dotIndex);

	return { firstString, secondString };
}

async function formatDialogFlow(text) {
	let result = text.toLowerCase();
	result = await result.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF])/g, '');
	result = await accents.remove(result);
	if (result.length >= 250) {
		result = result.slice(0, 250);
	}
	return result.trim();
}

async function buildTicketRevogar(state) {
	let result = 'Ticket Revogar Dados\n';
	if (state.titularNome) { result += `Nome: ${state.titularNome}\n`;	}
	if (state.titularCPF) { result += `CPF: ${state.titularCPF}\n`;	}
	if (state.titularPhone) { result += `Telefone: ${state.titularPhone}\n`;	}
	if (state.titularMail) { result += `E-mail: ${state.titularMail}\n`;	}

	return result;
}

async function buildTicketVisualizar(state) {
	let result = 'Ticket Visualizar Dados\n';
	if (state.dadosCPF) { result += `CPF: ${state.dadosCPF}\n`;	}

	return result;
}

async function getCPFValid(cpf) {
	let result = cpf.replace(/[_.,-]/g, '');
	if (!result || cpf.length < 11 || !/^\d+$/.test(result)) { return false; }
	result = await addChar(result, '.', 3);
	result = await addChar(result, '.', 7);
	result = await addChar(result, '-', 11);
	if (validarCpf(result) === false) { return false;	}
	return result;
}


async function getPhoneValid(phone) {
	const result = phone.trim().replace(/[^0-9]+/ig, '');
	if (!result || !parseInt(result, 10)) { return false; }
	if (result.length < 8 || result.length > 18) { return false; }

	return result;
}

async function getUserTicketTypes(tickets) {
	const result = [];

	tickets.forEach((element) => {
		if (!result.includes(element.id)) {
			result.push(element.id);
		}
	});

	return result.sort();
}

module.exports = {
	Sentry,
	apiai: dialogFlow(process.env.DIALOGFLOW_TOKEN),
	separateString,
	formatDialogFlow,
	buildTicketRevogar,
	buildTicketVisualizar,
	getCPFValid,
	getPhoneValid,
	getUserTicketTypes,
};
