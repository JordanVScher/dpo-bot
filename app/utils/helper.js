const Sentry = require('@sentry/node');
const moment = require('moment');
const accents = require('remove-accents');
const validarCpf = require('validar-cpf');

// Sentry - error reporting
Sentry.init({	dsn: process.env.SENTRY_DSN, environment: process.env.ENV, captureUnhandledRejections: false });
moment.locale('pt-BR');

function sentryError(msg, err, override) {
	console.log(msg, JSON.stringify(err, null, 2) || '');
	if (override || process.env.ENV !== 'local') { Sentry.captureMessage(msg); }
	return false;
}

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

async function sendTextAnswer(context, knowledge) {
	if (knowledge && knowledge.answer) {
		await context.setState({ resultTexts: await separateString(knowledge.answer) });
		if (context.state.resultTexts && context.state.resultTexts.firstString) {
			await context.sendText(context.state.resultTexts.firstString);
			if (context.state.resultTexts.secondString) {
				await context.sendText(context.state.resultTexts.secondString);
			}
		}
	}
}

async function sendAttachment(context, knowledge) {
	if (knowledge.saved_attachment_type === 'image') { // if attachment is image
		await context.sendImage({ attachment_id: knowledge.saved_attachment_id });
	}
	if (knowledge.saved_attachment_type === 'video') { // if attachment is video
		await context.sendVideo({ attachment_id: knowledge.saved_attachment_id });
	}
	if (knowledge.saved_attachment_type === 'audio') { // if attachment is audio
		await context.sendAudio({ attachment_id: knowledge.saved_attachment_id });
	}
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

async function buildTicket(state) {
	const result = {};
	if (state.titularNome) { result.titularNome = state.titularNome;	}
	if (state.titularCPF) { result.cpf = state.titularCPF;	}
	// if (state.titularPhone) { result.telefone = state.titularPhone;	}
	if (state.titularMail) { result.mail = state.titularMail;	}

	return result;
}

async function getCPFValid(cpf) {
	let result = cpf.replace(/[_.,-\s]/g, '');
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

// get the types of tickets the user has opened to stop the user from creating them again
async function getUserTicketTypes(tickets) {
	const result = [];

	tickets.forEach((element) => {
		if (!result.includes(element.type.id)) { // dont add repeated types
			if (element.status !== 'canceled' && element.status !== 'closed') { // add types that are open or in_progress
				result.push(element.type.id);
			}
		}
	});

	return result.sort();
}


async function handleErrorApi(options, res, err) {
	let msg = `Endereço: ${options.host}`;
	msg += `\nPath: ${options.path}`;
	msg += `\nQuery: ${JSON.stringify(options.query, null, 2)}`;
	msg += `\nMethod: ${options.method}`;
	msg += `\nMoment: ${new Date()}`;
	if (res) msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;
	if (err) msg += `\nErro: ${err.stack}`;

	// console.log('----------------------------------------------', `\n${msg}`, '\n\n');

	if ((res && (res.error || res.form_error)) || (!res && err)) {
		if (process.env.ENV !== 'local') {
			msg += `\nEnv: ${process.env.ENV}`;
			await Sentry.captureMessage(msg);
		}
	}
}

async function handleRequestAnswer(response) {
	try {
		const res = await response.json();
		await handleErrorApi(response.options, res, false);
		return res;
	} catch (error) {
		await handleErrorApi(response.options, false, error);
		return {};
	}
}

function getRandomArray(array) {
	return array[Math.floor((Math.random() * array.length))];
}

function formatTimeString(originalText) {
	if (!originalText || originalText.slice(0, 1) === '0') return '48 horas';

	const text = originalText.replace(/\D/g, '');
	if (!text) return '48 horas';
	let res = '';

	if (['1', '2', '3'].includes(text)) {
		res = `${text * 24} horas`;
	} else {
		res = `${text} dias`;
	}

	return res;
}

function getResponseTime(tickets, ticketID) {
	let res = '';
	const currentTicket = tickets.find((x) => x.ticket_type_id.toString() === ticketID.toString());
	res = currentTicket && currentTicket.usual_response_interval ? currentTicket.usual_response_interval : null;
	res = formatTimeString(res);
	return res || '48 horas';
}

module.exports = {
	Sentry,
	moment,
	separateString,
	formatDialogFlow,
	buildTicket,
	getCPFValid,
	getPhoneValid,
	getUserTicketTypes,
	handleRequestAnswer,
	sentryError,
	getRandomArray,
	sendTextAnswer,
	sendAttachment,
	getResponseTime,
};
