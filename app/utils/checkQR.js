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


async function buildMainMenu(context) {
	await reloadTicket(context);
	const options = [];

	if (context.state.userTicketTypes.length < context.state.ticketTypes.ticket_types.length) options.push({ content_type: 'text', title: 'Solicitações', payload: 'solicitacoes' });
	// options.push({ content_type: 'text', title: 'Solicitações Teste', payload: 'testeAtendimento' });
	if (context.state.userTickets && context.state.userTickets.itens_count > 0) options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' });
	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });

	if (context.state.quizEnded !== true) {
		await context.setState({ isFuncionario: await checkUserOnLabelName(context.session.user.id, 'admin', context.state.politicianData.fb_access_token) });
		if (context.state.isFuncionario && context.state.isFuncionario.name) options.push({ content_type: 'text', title: 'Quiz Preparatório', payload: 'beginQuiz' });
	}

	// if (context.state.sendShare) options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' });
	options.push({ content_type: 'text', title: 'Fale Conosco', payload: 'faleConosco' });

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

	if (options.length === 0) return false;
	return { quick_replies: options };
}


module.exports = {
	buildMainMenu, buildAtendimento,
};
