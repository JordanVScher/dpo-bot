const { getuserTickets } = require('../chatbot_api');
const { getTicketTypes } = require('../chatbot_api');
const { getUserTicketTypes } = require('./helper');
const flow = require('./flow');

async function reloadTicket(context) {
	await context.setState({ ticketTypes: await getTicketTypes() });
	await context.setState({ userTickets: await getuserTickets(context.session.user.id) });
	await context.setState({ userTicketTypes: await getUserTicketTypes(context.state.userTickets.tickets) });
}


async function buildMainMenu(context) {
	await reloadTicket(context);
	const options = [];

	if (context.state.userTicketTypes.length < context.state.ticketTypes.ticket_types.length) { options.push({ content_type: 'text', title: 'Atendimento LGPD', payload: 'atendimentoLGPD' }); }
	if (context.state.userTicketTypes.length > 0) { options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' }); }
	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	if (context.state.sendShare) { options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' }); }

	// options.push({ content_type: 'text', title: 'Teste LGPD', payload: 'testeAtendimento' });

	return { quick_replies: options };
}

async function buildAtendimento(context) {
	await reloadTicket(context);
	const options = [];

	context.state.ticketTypes.ticket_types.forEach((element) => {
		if (!context.state.userTicketTypes.includes(element.id)) { // check which type of ticket the user doesn't have yet so we can show only the respective option
			options.push({ content_type: 'text', title: flow.atendimentoLGPD.menuOptions[element.id - 1], payload: flow.atendimentoLGPD.menuPostback[element.id - 1]	});
		}
	});

	if (options.length === 0) return false;
	return { quick_replies: options };
}


module.exports = {
	buildMainMenu, buildAtendimento,
};
