const { getuserTickets } = require('../chatbot_api');
const { getTicketTypes } = require('../chatbot_api');
const { getUserTicketTypes } = require('./helper');

async function buildMainMenu(context) {
	const options = [];

	const ticketTypes = await getTicketTypes();
	await context.setState({ userTickets: await getuserTickets(context.session.user.id) });
	const userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	if (userTicketTypes.length < ticketTypes.ticket_types.length) { options.push({ content_type: 'text', title: 'Atendimento LGPD', payload: 'atendimentoLGPD' }); }
	if (userTicketTypes.length > 0) { options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' }); }
	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	// if (context.state.sendShare) { options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' }); }

	return { quick_replies: options };
}


module.exports = {
	buildMainMenu,
};
