// const Sentry = require('@sentry/node');
import moment from 'moment';
import accents from 'remove-accents';
import validarCpf from 'validar-cpf';
import Sentry from './sentry';
import mailer from './mailer';
import flow from './flow';

// Sentry - error reporting
Sentry.init({	dsn: process.env.REACT_APP_SENTRY_DSN, environment: process.env.REACT_APP_ENV, captureUnhandledRejections: false });
moment.locale('pt-BR');

async function sentryError(msg, err, platform) {
	if (platform === 'browser') return null;
	let erro;
	if (typeof err === 'string') {
		erro = err;
	} else if (err && err.stack) {
		erro = err.stack;
	}

	if (process.env.REACT_APP_ENV !== 'local') {
		Sentry.captureMessage(msg);
		await mailer.sendHTMLMail(`Erro no DPO - ${process.env.REACT_APP_ENV || ''}`, process.env.REACT_APP_MAILDEV, `${msg || ''}\n\n${erro}`);
		console.log(`Error sent at ${new Date()}!\n `);
	} else {
		console.log('erro', erro);
	}
	return false;
}

async function addChar(a, b, position) { return a.substring(0, position) + b + a.substring(position); }

// separates string in the first dot on the second half of the string
async function separateString(someString, platform) {
	if (platform === 'browser') return { firstString: someString, secondString: '' };
	let removeLastChar = false;
	if (someString.trim()[someString.length - 1] !== '.') { // trying to guarantee the last char is a dot so we never use halfLength alone as the divisor
		someString += '.'; // eslint-disable-line no-param-reassign
		removeLastChar = true;
	}
	const halfLength = Math.ceil(someString.length / 2.5); // getting more than half the length (the bigger the denominator the shorter the firstString tends to be)
	const newString = someString.substring(halfLength); // get the second half of the original string
	const sentenceDot = new RegExp('(?<!www|sr|sra|mr|mrs|srta|srto)\\.(?!com|br|rj|sp|mg|bh|ba|sa|bra|gov|org)', 'i');// Regex -> Don't consider dots present in e-mails and urls
	// getting the index (in relation to the original string -> halfLength) of the first dot on the second half of the string. +1 to get the actual dot.
	const dotIndex = halfLength + newString.search(sentenceDot) + 1;

	let firstString = someString.substring(0, dotIndex);
	let secondString = someString.substring(dotIndex);

	// if we added a dot on the last char, remove it
	if (removeLastChar && !secondString) firstString = firstString.slice(0, -1);
	if (removeLastChar && secondString) secondString = secondString.slice(0, -1);

	return { firstString, secondString };
}

async function sendTextAnswer(context, knowledge) {
	const timeToWait = process.env.REACT_APP_ISSUE_TIME_WAIT;
	if (knowledge && knowledge.answer) {
		await context.setState({ resultTexts: await separateString(knowledge.answer, context.session.platform) });
		if (context.state.resultTexts && context.state.resultTexts.firstString) {
			if (timeToWait) await context.typing(timeToWait);
			await context.sendText(context.state.resultTexts.firstString);
			if (context.state.resultTexts.secondString) {
				if (timeToWait) await context.typing(timeToWait);
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
	if (state.titularDescription) { result.description = state.titularDescription;	}

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

function maskEmail(email) {
	const index = email.indexOf('@');
	if (!index) return email;
	const subs = email.substring(3, index);
	const sublength = subs.length;
	const replaceWith = '*'.repeat(sublength);
	return email.replace(subs, replaceWith);
}

async function handleErrorApi(options, res, statusCode, err) {
	let msg = `Endereço: ${options.url}`;
	msg += `\nMethod: ${options.method}`;
	if (options.params)	msg += `\nQuery: ${JSON.stringify(options.params, null, 2)}`;
	if (options.headers) msg += `\nHeaders: ${JSON.stringify(options.headers, null, 2)}`;
	msg += `\nMoment: ${new Date()}`;
	if (statusCode) msg += `\nStatus Code: ${statusCode}`;

	if (res) msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;
	if (err) msg += `\nErro: ${err.stack || err}`;

	// console.log('----------------------------------------------', `\n${msg}`, '\n\n');

	if ((res && (res.error || res.form_error)) || (!res && err)) {
		if (process.env.REACT_APP_ENV !== 'local') {
			msg += `\nEnv: ${process.env.REACT_APP_ENV}`;
			await Sentry.captureMessage(msg);
		}
	}
}

async function handleRequestAnswer(response) {
	try {
		const { status } = response;
		const { data } = await response;
		await handleErrorApi(response.config, data, status, false);
		return data;
	} catch (error) {
		await handleErrorApi(response.config, false, null, error);
		return {};
	}
}

function getRandomArray(array) {
	return array[Math.floor((Math.random() * array.length))];
}

async function errorDetail(context, error) {
	const date = new Date();
	await context.sendText('Ops. Tive um erro interno. Tente novamente.');
	console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} com ${context.state.sessionUser.name}=>`);
	console.log(error);


	// await Sentry.configureScope(async (scope) => { // sending to sentry
	// scope.setUser({ username: context.state.sessionUser.name });
	// scope.setExtra('state', context.state);
	// throw error;
	// });
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

async function resumoTicket(ticketTypes) {
	const sorted = ticketTypes.sort((a, b) => a.ticket_type_id - b.ticket_type_id);
	sorted.forEach((e) => {
		console.log(`Type ${e.ticket_type_id} - ${e.name} - ID: ${e.id}`);
	});
}

async function expectText(context, text, buttons, placeholder) {
	if (context.session.platform === 'browser') {
		await context.sendTextArea(text, placeholder);
	} else {
		await context.sendText(text, buttons);
	}
}

function viewTicket(ticket) {
	let msg = `Número de Protocolo: ${ticket.id}<br>`;
	if (ticket.status && flow.ticketStatus[ticket.status]) msg += `Estado: ${flow.ticketStatus[ticket.status].name}<br>`;
	if (ticket.data && ticket.data.titularNome) msg += `Nome do Titular: ${ticket.data.titularNome}<br>`;
	if (ticket.created_at) msg += `Data de criação: ${moment(ticket.created_at).format('DD/MM/YY')}<br>`;
	if (ticket.closed_at) msg += `Data de encerramento: ${moment(ticket.closed_at).format('DD/MM/YY')}<br>`;

	return msg;
}

export default {
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
	errorDetail,
	resumoTicket,
	expectText,
	maskEmail,
	viewTicket,
};
