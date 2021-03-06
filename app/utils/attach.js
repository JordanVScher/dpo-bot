const { moment } = require('./helper');
const { sentryError } = require('./helper');
const { getCustomText } = require('./helper');
const flow = require('./flow');

function capQR(text) {
	let result = text;
	if (result.length > 20) {
		result = `${result.slice(0, 17)}...`;
	}
	return result;
}

async function buildButton(url, title) { return [{ type: 'web_url', url, title }]; } module.exports.buildButton = buildButton;

// sends one card with an image and link
async function sendCardWithLink(context, cardData, url, text) {
	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: cardData.title,
					subtitle: (text && text !== '') ? text : cardData.sub,
					image_url: cardData.imageLink,
					default_action: {
						type: 'web_url',
						url,
						messenger_extensions: 'false',
						webview_height_ratio: 'full',
					},
				},
			],
		},
	});
}

async function cardLinkNoImage(context, title, url) {
	await context.sendAttachment({
		type: 'template',
		payload: { template_type: 'generic', elements: [{ title, subtitle: ' ', buttons: [{ type: 'web_url', url, title }] }] },
	});
}

async function sendSequenceMsgs(context, msgs, buttonTitle) {
	for (let i = 0; i < msgs.length; i++) {
		if (msgs[i] && msgs[i].text && msgs[i].url) {
			await context.sendButtonTemplate(msgs[i].text, await buildButton(msgs[i].url, buttonTitle));
		}
	}
}

// get quick_replies opject with elements array
// supossed to be used with menuOptions and menuPostback for each dialog on flow.js

async function getQR(opt) {
	const elements = [];
	const firstArray = opt.menuOptions;
	firstArray.forEach(async (element, index) => {
		elements.push({
			content_type: 'text',
			title: await capQR(element),
			payload: opt.menuPostback[index],
		});
	});

	return { quick_replies: elements };
}
async function getQRCPF(opt, firstPayload) {
	const elements = [];
	const firstArray = opt.menuOptions;
	firstArray.forEach(async (element, index) => {
		const aux = {
			content_type: 'text',
			title: await capQR(element),
			payload: opt.menuPostback[index],
		};

		if (index === 0 && firstPayload) { aux.payload = firstPayload; }
		elements.push(aux);
	});


	return { quick_replies: elements };
}

async function getVoltarQR(lastDialog) {
	let lastPostback = '';

	if (lastDialog === 'optDenun') {
		lastPostback = 'goBackMenu';
	} else {
		lastPostback = lastDialog;
	}

	return {
		content_type: 'text',
		title: 'Voltar',
		payload: lastPostback,
	};
}


async function getErrorQR(opt, lastDialog) {
	const elements = [];
	const firstArray = opt.menuOptions;

	firstArray.forEach((element, index) => {
		elements.push({
			content_type: 'text',
			title: element,
			payload: opt.menuPostback[index],
		});
	});

	elements.push(await getVoltarQR(lastDialog));

	console.log('ERRORQR', elements);

	return { quick_replies: elements };
}

// async function sendShare(context, cardData) {
// 	// case 'compartilhar':
// 	// 	await context.sendText(flow.share.txt1);
// 	// 	await attach.sendShare(context, flow.share.cardData);
// 	// 	await dialogs.sendMainMenu(context);
// 	// 	break;

// 	const buttons = [
// 		{
// 			type: 'web_url',
// 			title: 'Ver Chatbot',
// 			url: `m.me/${process.env.MESSENGER_PAGE_ID}`,
// 		},
// 	];

// 	await context.sendAttachment({
// 		type: 'template',
// 		payload: {
// 			template_type: 'generic',
// 			elements: [
// 				{
// 					title: cardData.title,
// 					subtitle: (cardData.text && cardData.text !== '') ? cardData.text : cardData.sub,
// 					image_url: cardData.image_url,
// 					default_action: {
// 						type: 'web_url',
// 						url: `${cardData.item_url}/${process.env.MESSENGER_PAGE_ID}`,
// 						messenger_extensions: 'false',
// 						webview_height_ratio: 'full',
// 					},
// 					buttons,
// 				},
// 			],
// 		},
// 	});
// }


async function sendTicketCards(context, tickets) {
	const cards = [];
	tickets.sort((a, b) => flow.ticketStatus[a.status].position - flow.ticketStatus[b.status].position);
	tickets.forEach((element) => {
		if (cards.length < 10 && element.id) {
			let msg = '';
			msg += `\nNúmero de Protocolo: ${element.id}`;
			if (element.status && flow.ticketStatus[element.status]) msg += `\nEstado: ${flow.ticketStatus[element.status].name}`;
			if (element.created_at) msg += `\nData de criação: ${moment(element.created_at).format('DD/MM/YY')}`;
			if (element.closed_at) msg += `\nData de encerramento: ${moment(element.closed_at).format('DD/MM/YY')}`;

			const buttons = [];
			// if (element.message && element.message.length > 0) {
			// buttons.push({
			// type: 'postback',
			// title: 'Ver Mensagens',
			// payload: `verTMsg${element.id}`,
			// });
			// }

			buttons.push({
				type: 'postback',
				title: 'Deixar Mensagem',
				payload: `leaveTMsg${element.id}`,
			});

			if (element.status !== 'canceled' && element.status !== 'closed') {
				buttons.push({
					type: 'postback',
					title: 'Cancelar Ticket',
					payload: `cancelarT${element.id}`,
				});
			}

			cards.push({
				title: `Pedido ${element.type.name}`,
				subtitle: msg,
				buttons,
			});
		}
	});

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: cards,
		},
	});
}

async function sendMsgFromAssistente(context, code, defaultMsgs) {
	try {
		const msgToSend = await getCustomText(context, code);

		if (msgToSend && typeof msgToSend === 'string' && msgToSend.length > 0) {
			await context.sendText(msgToSend);
		} else if (defaultMsgs && defaultMsgs.length > 0) {
			for (const msg of defaultMsgs) { // eslint-disable-line
				await context.sendText(msg);
			}
		}
	} catch (error) {
		sentryError('Erro em sendMsgFromAssistente', error);
	}
}


module.exports = {
	getErrorQR, getVoltarQR, getQR, getQRCPF, sendSequenceMsgs, sendCardWithLink, cardLinkNoImage, capQR, buildButton, sendTicketCards, sendMsgFromAssistente,
};
