const Sentry = require('@sentry/node');
const dialogFlow = require('apiai-promise');
const accents = require('remove-accents');

// Sentry - error reporting
Sentry.init({	dsn: process.env.SENTRY_DSN, environment: process.env.ENV, captureUnhandledRejections: false });


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
};

async function formatDialogFlow(text) {
	let result = text.toLowerCase();
	result = await result.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF])/g, '');
	result = await accents.remove(result);
	if (result.length >= 250) {
		result = result.slice(0, 250);
	}
	return result.trim();
};

const aaa = {

};
async function buildTicket(state) {
	let result = 'Ticket Revogar Dados\n';
	if (state.titularNome) { result += `Nome: ${state.titularNome}\n`	}
	if (state.titularCPF) { result += `CPF: ${state.titularCPF}\n`	}
	if (state.titularPhone) { result += `Telefone: ${state.titularPhone}\n`	}
	if (state.titularMail) { result += `E-mail: ${state.titularMail}\n`	}

	return result;
}


module.exports = {
	Sentry,
	apiai: dialogFlow(process.env.DIALOGFLOW_TOKEN),
	separateString,
	formatDialogFlow,
	buildTicket,
}
