const { getUserTickets } = require('../chatbot_api');
const { getTicketTypes } = require('../chatbot_api');
const { getUserTicketTypes } = require('./helper');
const { checkUserOnLabelName } = require('./labels');
const flow = require('./flow');

async function reloadTicket(context) {
	await context.setState({ ticketTypes: await getTicketTypes() });
	await context.setState({ userTickets: await getUserTickets(context.session.user.id) });
	await context.setState({ userTicketTypes: await getUserTicketTypes(context.state.userTickets.tickets) });
}

async function buildConsumidorMenu(context) {
	const options = [];

	options.push({ content_type: 'text', title: 'Informações', payload: 'informacoes' });
	options.push({ content_type: 'text', title: 'Solicitações', payload: 'solicitacoes' });
	// options.push({ content_type: 'text', title: 'Solicitações Teste', payload: 'testeAtendimento' });
	if (context.state.ticketTypes && context.state.ticketTypes.ticket_types) {
		const getFaleConosco = context.state.ticketTypes.ticket_types.find((x) => x.id === 5);
		if (getFaleConosco) options.push({ content_type: 'text', title: getFaleConosco.name, payload: 'solicitacao5' });

		const getFaleDPO = context.state.ticketTypes.ticket_types.find((x) => x.id === 6) || {};
		getFaleDPO.name = 'Fale com DPO';
		if (getFaleDPO) options.push({ content_type: 'text', title: getFaleDPO.name, payload: 'solicitacao6' });
	}

	return { quick_replies: options };
}

async function buildMainMenu(context) {
	await reloadTicket(context);
	const options = [];

	options.push({ content_type: 'text', title: 'Consumidor', payload: 'consumidor' });
	if (context.state.userTickets && context.state.userTickets.itens_count > 0) options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' });
	if (context.state.quizEnded !== true) {
		await context.setState({ isFuncionario: await checkUserOnLabelName(context.session.user.id, 'admin', context.state.politicianData.fb_access_token) });
		if (context.state.isFuncionario && context.state.isFuncionario.name) options.push({ content_type: 'text', title: 'Quiz Preparatório', payload: 'beginQuiz' });
	}

	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	// if (context.state.sendShare) options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' });

	return { quick_replies: options };
}

async function buildAtendimento(context) {
	await reloadTicket(context);
	const options = [];

	context.state.ticketTypes.ticket_types.forEach((element) => {
		// check which type of ticket the user doesn't have yet so we can show only the respective option
		// also check if that type of ticket is active
		if (!context.state.userTicketTypes.includes(element.id) && flow.solicitacoes.activeSolicitations.includes(element.id)) {
			const aux = {
				content_type: 'text',
				title: element.name,
				payload: `solicitacao${element.id}`,
			};

			options.push(aux);
		}
	});

	options.push({
		content_type: 'text',
		title: 'Reportar Incidente',
		payload: 'solicitaca7',
	});


	if (options.length === 0) return false;
	return { quick_replies: options };
}


module.exports = {
	buildMainMenu, buildAtendimento, buildConsumidorMenu,
};
