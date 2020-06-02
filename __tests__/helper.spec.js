require('dotenv').config();

const tickets = require('./mock_data/tickets');
const helper = require('../src/utils/helper');
// const flow = require('../src/utils/flow');

// const activeTicketTypes = flow.solicitacoes.activeSolicitations;

it('getUserTicketTypes - user has no tickets open', async () => {
	const userTickets = { tickets: [] };
	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 0).toBeTruthy();
});

it('getUserTicketTypes - user has all tickets closed', async () => {
	const userTickets = tickets.userAllClosed;
	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 0).toBeTruthy();
});

it('getUserTicketTypes - count repeated ticket once and ignore canceled ticket', async () => {
	const userTickets = tickets.ticketRepeated;

	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 1).toBeTruthy();
	await expect(result[0] === 1).toBeTruthy();
});
