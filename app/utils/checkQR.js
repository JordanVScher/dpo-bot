async function buildMainMenu(flags) {
	const options = [];

	console.log(flags);

	options.push({ content_type: 'text', title: 'Atendimento LGPD', payload: 'atendimentoLGPD' });
	if (flags.ticketOn) { options.push({ content_type: 'text', title: 'Meu Ticket', payload: 'meuTicket' }); }
	options.push({ content_type: 'text', title: 'Sobre LGPD️', payload: 'sobreLGPD' });
	options.push({ content_type: 'text', title: 'Sobre Dipiou', payload: 'sobreDipiou' });
	if (flags.sendShare) { options.push({ content_type: 'text', title: 'Compartilhar', payload: 'compartilhar' }); }

	return { quick_replies: options };
}

module.exports = { buildMainMenu };
