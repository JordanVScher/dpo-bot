const { getUserTickets } = require('../chatbot_api');
const { getTicketTypes } = require('../chatbot_api');
const { getUserTicketTypes } = require('./helper');
const { getCustomText } = require('./helper');
const { checkUserOnLabelName } = require('./labels');
const flow = require('./flow');

async function reloadTicket(context) {
	await context.setState({ ticketTypes: await getTicketTypes(context.state.politicianData.organization_chatbot_id) });
	await context.setState({ userTickets: await getUserTickets(context.session.user.id) });
	await context.setState({ userTicketTypes: await getUserTicketTypes(context.state.userTickets.tickets) });
}

async function buildConsumidorMenu(context) {
	const options = [];

	options.push({ content_type: 'text', title: 'Informações', payload: 'informacoes' });
	options.push({ content_type: 'text', title: 'Solicitações', payload: 'solicitacoes' });
	// options.push({ content_type: 'text', title: 'Solicitações Teste', payload: 'testeAtendimento' });

	const faleConoscoText = await getCustomText(context, 'fale-conosco');
	if (faleConoscoText) options.push({ content_type: 'text', title: 'Fale Conosco', payload: 'faleConosco' });

	// if (context.state.ticketTypes && context.state.ticketTypes.ticket_types) {
	// 	const getFaleConosco = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === 5);
	// 	if (getFaleConosco) options.push({ content_type: 'text', title: getFaleConosco.name, payload: 'solicitacao5' });
	// const getFaleDPO = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === 6) || {};
	// getFaleDPO.name = 'Fale com DPO';
	// if (getFaleDPO) options.push({ content_type: 'text', title: getFaleDPO.name, payload: 'solicitacao6' });
	// }

	return { quick_replies: options };
}

async function buildMainMenu(context) {
	await reloadTicket(context);
	const options = [];

	options.push({ content_type: 'text', title: 'Cliente', payload: 'consumidor' });
	if (context.state.userTickets && context.state.userTickets.itens_count > 0) options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' });
	if (context.state.quizEnded !== true) {
		await context.setState({ isFuncionario: await checkUserOnLabelName(context.session.user.id, 'admin', context.state.politicianData.fb_access_token) });
		if (context.state.isFuncionario && context.state.isFuncionario.name) options.push({ content_type: 'text', title: 'Quiz Preparatório', payload: 'beginQuiz' });
	}
	options.push({ content_type: 'text', title: 'O que é LGPD', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	const atendimentoAvançado = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === 9 || x.ticket_type_id === 10);
	if (atendimentoAvançado) {
		options.push({ content_type: 'text', title: 'Atendimento Avançado', payload: 'atendimentoAvançado' });
	}
	// if (context.state.sendShare) options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' });

	return { quick_replies: options };
}

async function buildAtendimentoAvancado(context) {
	await reloadTicket(context);
	const options = [];

	const solicitacao9 = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === 9);
	if (solicitacao9) { options.push({ content_type: 'text', title: flow.atendimentoAvançado.menuOptions[0], payload: flow.atendimentoAvançado.menuPostback[0] }); }
	const solicitacao10 = context.state.ticketTypes.ticket_types.find((x) => x.ticket_type_id === 10);
	if (solicitacao10) { options.push({ content_type: 'text', title: flow.atendimentoAvançado.menuOptions[1], payload: flow.atendimentoAvançado.menuPostback[1] }); }

	if (options && options.length > 0) {
		options.push({ content_type: 'text', title: flow.atendimentoAvançado.menuOptions[2], payload: flow.atendimentoAvançado.menuPostback[2] });
	}
	return { quick_replies: options };
}

async function buildAtendimento(context) {
	await reloadTicket(context);
	const options = [];

	context.state.ticketTypes.ticket_types.forEach((e) => {
		// check which type of ticket the user doesn't have yet so we can show only the respective option
		// also check if that type of ticket is active
		if (!context.state.userTicketTypes.includes(e.ticket_type_id) && flow.solicitacoes.activeSolicitations.includes(e.ticket_type_id)) {
			const aux = {
				content_type: 'text',
				title: e.name,
				payload: `solicitacao${e.ticket_type_id}`,
			};

			options.push(aux);
		}
	});

	options.push({
		content_type: 'text',
		title: 'Reportar Incidente',
		payload: 'solicitacao7',
	});


	if (options.length === 0) return false;
	return { quick_replies: options };
}


module.exports = {
	buildMainMenu, buildAtendimento, buildConsumidorMenu, reloadTicket, buildAtendimentoAvancado,
};
