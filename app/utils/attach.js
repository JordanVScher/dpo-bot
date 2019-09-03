const { moment } = require('./helper');

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

async function sendShare(context, cardData) {
	const buttons = [
		{
			type: 'web_url',
			title: 'Ver Chatbot',
			url: `m.me/${process.env.PAGE_ID}`,
		},
	];

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: cardData.title,
					subtitle: (cardData.text && cardData.text !== '') ? cardData.text : cardData.sub,
					image_url: cardData.image_url,
					default_action: {
						type: 'web_url',
						url: `${cardData.item_url}/${process.env.PAGE_ID}`,
						messenger_extensions: 'false',
						webview_height_ratio: 'full',
					},
					buttons,
				},
			],
		},
	});
}
const statusDictionary = {
	pending: 'Pendente',
	closed: 'Fechado',
	progress: 'Em Progresso',
	canceled: 'Cancelado',
};

async function sendTicketCards(context, tickets) {
	const elements = [];

	tickets.forEach((element) => {
		let msg = '';

		// if (element.message) msg += `Detalhes: ${element.message}`;
		if (element.status && statusDictionary[element.status]) msg += `\nEstado: ${statusDictionary[element.status]}`;
		if (element.created_at) msg += `\nData de criação: ${moment(element.created_at).format('DD/MM/YY')}`;
		elements.push({
			title: `Pedido ${element.type.name}`,
			subtitle: msg,
			// buttons: [{
			// 	type: 'postback',
			// 	title: 'Cancelar Ticket',
			// 	payload: `cancelarT${element.id}`,
			// }],
		});
	});


	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements,
		},
	});
}

module.exports = {
	sendShare, getErrorQR, getVoltarQR, getQR, sendSequenceMsgs, sendCardWithLink, cardLinkNoImage, capQR, buildButton, sendTicketCards,
};
