const dialogflow = require('dialogflow');
const MaAPI = require('../chatbot_api');
const { createIssue } = require('./send_issue');
const { sendAnswer } = require('./sendAnswer');
const { sendMainMenu } = require('./dialogs');
const help = require('./helper');
const { handleSolicitacaoRequest } = require('./dialogs');

/* Initialize DialogFlow agent */
/* set GOOGLE_APPLICATION_CREDENTIALS on .env */
const sessionClient = new dialogflow.SessionsClient();
const projectId = process.env.GOOGLE_PROJECT_ID;

/**
 * Send a text query to the dialogflow agent, and return the query result.
 * @param {string} text The text to be queried
 * @param {string} sessionId A unique identifier for the given session
 */
async function textRequestDF(text, sessionId) {
	const sessionPath = sessionClient.sessionPath(projectId, sessionId);
	const request = { session: sessionPath, queryInput: { text: { text, languageCode: 'pt-BR' } } };
	const responses = await sessionClient.detectIntent(request);
	return responses;
}

async function getExistingRes(res) {
	let result = null;
	res.forEach((e) => { if (e !== null && result === null) result = e; });
	console.log('getExistingRes', result);
	return result;
}

/**
 * Build object with the entity name and it's values from the dialogflow response
 * @param {string} res result from dialogflow request
 */
async function getEntity(res) {
	const result = {};
	const entities = res[0] && res[0].queryResult && res[0].queryResult.parameters ? res[0].queryResult.parameters.fields : [];
	if (entities) {
		Object.keys(entities).forEach((e) => {
			const aux = [];
			if (entities[e] && entities[e].listValue && entities[e].listValue.values) {
				entities[e].listValue.values.forEach((name) => { aux.push(name.stringValue); });
			}
			result[e] = aux;
		});
	}

	return result || {};
}

async function checkPosition(context) {
	await context.setState({ dialog: 'prompt' });
	// lock user on this intent until he asks out with "sair"
	if (context.state.onSolicitacoes === true) { await context.setState({ intentName: 'Solicitação' }); }
	switch (context.state.intentName) {
	case 'Solicitação': {
		await context.setState({ onSolicitacoes: true });
		const result = await handleSolicitacaoRequest(context);
		await help.sentryError('Nova Solicitação', result, true);
	}
		break;
	case 'Fallback': // didn't understand what was typed
		await createIssue(context);
		break;
	default: // default acts for every intent - position on MA
		// getting knowledge base. We send the complete answer from dialogflow
		await context.setState(
			{ knowledge: await MaAPI.getknowledgeBase(context.state.politicianData.user_id, await getExistingRes(context.state.apiaiResp), context.session.user.id) },
		);
		console.log('knowledge', context.state.knowledge);

		// check if there's at least one answer in knowledge_base
		if (context.state.knowledge && context.state.knowledge.knowledge_base && context.state.knowledge.knowledge_base.length >= 1) {
			await sendAnswer(context);
		} else { // no answers in knowledge_base (We know the entity but politician doesn't have a position)
			await createIssue(context);
		}
		await sendMainMenu(context);
		break;
	}
}

async function dialogFlow(context) {
	const date = new Date();
	console.log(`\n${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1}:${context.state.sessionUser.name} digitou ${context.state.whatWasTyped} - DF Status: ${context.state.politicianData.use_dialogflow}`);
	if (context.state.politicianData.use_dialogflow === 1) { // check if 'politician' is using dialogFlow
		await context.setState({ apiaiResp: await textRequestDF(await help.formatDialogFlow(context.state.whatWasTyped), context.session.user.id) });
		await context.setState({ intentName: context.state.apiaiResp[0].queryResult.intent.displayName || '' }); // intent name
		await context.setState({ resultParameters: await getEntity(context.state.apiaiResp) }); // entities
		await context.setState({ apiaiTextAnswer: context.state.apiaiResp[0].queryResult.fulfillmentText || '' }); // response text
		await checkPosition(context);
	} else {
		await context.setState({ dialog: 'createIssueDirect' });
	}
}

async function buildInformacoesMenu(context) {
	const options = [];
	const answer = [];
	const intents = [
		{ intent: 'Sobre DPO', btn: 'O que é DPO' },
		{ intent: 'Sobre abrangência da lei', btn: ' Abrangência da Lei' },
		{ intent: 'Sobre a vigência da lei', btn: 'Vigência da Lei' },
		// { intent: 'Processo de coleta de dados', btn: 'Coleta de Dados' },
	];

	for (let i = 0; i < intents.length; i++) {
		const e = intents[i];
		const aux = await MaAPI.getknowledgeBaseByName(context.state.politicianData.user_id, e.intent, context.session.user.id);
		if (aux && aux.knowledge_base && aux.knowledge_base.length > 0) {
			options.push({ content_type: 'text', title: e.btn, payload: `InfoRes${answer.length}` });
			answer.push(aux.knowledge_base[0]);
		}
	}

	await context.setState({ infoRes: answer });
	return options.length > 0 ? { quick_replies: options } : false;
}

module.exports = {
	checkPosition, dialogFlow, textRequestDF, getExistingRes, buildInformacoesMenu,
};
