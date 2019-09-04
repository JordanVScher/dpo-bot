const { getuserTickets } = require('../chatbot_api');
const { getTicketTypes } = require('../chatbot_api');
const { getUserTicketTypes } = require('./helper');
const { checkUserOnLabelName } = require('./postback');
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
	// options.push({ content_type: 'text', title: 'Atendimento LGPD', payload: 'testeAtendimento' });
	if (context.state.userTicketTypes.length > 0) { options.push({ content_type: 'text', title: 'Meus Tickets', payload: 'meuTicket' }); }
	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	if (context.state.quizEnded !== true && await checkUserOnLabelName(context.session.user.id, 'funcionario')) {	options.push({ content_type: 'text', title: 'Quiz Preparatório', payload: 'beginQuiz' }); }
	if (context.state.sendShare) { options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' }); }

	return { quick_replies: options };
}

async function buildAtendimento(context) {
	await reloadTicket(context);
	const options = [];

	context.state.ticketTypes.ticket_types.forEach((element) => {
		if (!context.state.userTicketTypes.includes(element.id)) { // check which type of ticket the user doesn't have yet so we can show only the respective option
			options.push(flow.atendimentoLGPD.options[element.id]);
		}
	});

	if (options.length === 0) return false;
	return { quick_replies: options };
}


module.exports = {
	buildMainMenu, buildAtendimento,
};
