import sendIssue from './send_issue';
import sendAnswer from './sendAnswer';
import dialogs from './dialogs';
import chatbotAPI from '../chatbot_api';
import help from './helper';

/**
 * Send a text query to the dialogflow server, and return the query result.
 * @param {string} textQuery The text to be queried
 * @param {string} sessionId A unique identifier for the given session
 */
async function textRequestDF(queryText, sessionId, jwt) {
	queryText = await help.formatDialogFlow(queryText);
	if (typeof sessionId === 'number') sessionId = sessionId.toString();
	const res = await chatbotAPI.dialogflowText(queryText, sessionId, jwt);
	return res;
}

async function getExistingRes(apiaiResp) {
	let result = null;
	const res = apiaiResp.result;
	res.forEach((e) => { if (e !== null && result === null) result = e; });
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
		const result = await dialogs.handleSolicitacaoRequest(context);
		await help.sentryError('Nova Solicitação', result, context.session.platform);
	}
		break;
	case 'Fallback': // didn't understand what was typed
		await sendIssue.createIssue(context);
		break;
	default: {
		// default acts for every intent - position on MA
		// getting knowledge base. We send the complete answer from dialogflow
		const knowledge = await chatbotAPI.getknowledgeBase(
			context.state.politicianData.user_id, await getExistingRes(context.state.apiaiResp), context.state.recipientID, context.state.JWT,
		);
		await context.setState({ knowledge });
		// check if there's at least one answer in knowledge_base
		if (knowledge && knowledge.knowledge_base && knowledge.knowledge_base.length >= 1) {
			await sendAnswer(context);
			await dialogs.sendMainMenu(context);
		} else { // no answers in knowledge_base (We know the entity but politician doesn't have a position)
			await sendIssue.createIssue(context);
		}
	}
		break;
	}
}

async function getDFAnswerData(context) {
	const { apiaiResp } = context.state;

	await context.setState({ intentName: '' }); // intent name
	await context.setState({ resultParameters: {} }); // entities
	await context.setState({ apiaiTextAnswer: '' }); // response text

	if (apiaiResp.result) {
		const { result } = apiaiResp;
		await context.setState({ intentName: result[0].queryResult.intent.displayName || '' }); // intent name
		await context.setState({ resultParameters: await getEntity(result) }); // entities
		await context.setState({ apiaiTextAnswer: result[0].queryResult.fulfillmentText || '' }); // response text
	}
}

async function dialogFlow(context) {
	const date = new Date();
	console.log(`\n${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1}:${context.state.sessionUser.name} digitou ${context.state.whatWasTyped} - DF Status: ${context.state.politicianData.use_dialogflow}`);
	if (context.state.politicianData.use_dialogflow === 1) { // check if 'politician' is using dialogFlow
		await context.setState({ apiaiResp: await textRequestDF(context.state.whatWasTyped, context.session.user.id, context.state.JWT) });
		await getDFAnswerData(context);
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

	const browserExtraOption = { content_type: 'text', title: 'Fazer Pergunta', payload: 'duvidas' };

	for (let i = 0; i < intents.length; i++) {
		const e = intents[i];
		const aux = await chatbotAPI.getknowledgeBaseByName(
			context.state.politicianData.user_id, e.intent, context.state.recipientID, context.state.JWT,
		);
		if (aux && aux.knowledge_base && aux.knowledge_base.length > 0) {
			options.push({ content_type: 'text', title: e.btn, payload: `InfoRes${answer.length}` });
			answer.push(aux.knowledge_base[0]);
		}
	}

	await context.setState({ infoRes: answer });

	if (context.session.platform === 'browser') options.push(browserExtraOption);

	return options.length > 0 ? { quick_replies: options } : false;
}

export default {
	checkPosition,
	dialogFlow,
	textRequestDF,
	getExistingRes,
	buildInformacoesMenu,
};
