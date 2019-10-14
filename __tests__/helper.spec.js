require('dotenv').config();

const tickets = require('./mock_data/tickets');
const helper = require('../app/utils/helper');
const flow = require('../app/utils/flow');

const activeTicketTypes = flow.solicitacoes.activeSolicitations;

it('getUserTicketTypes - One open ticket of each kind', async () => {
	const userTickets = tickets.UserOneOfEachStatus;

	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === activeTicketTypes.length).toBeTruthy();
	result.forEach(async (opt, index) => { await expect(opt[index] === activeTicketTypes[index]).toBeTruthy(); });
});

it('getUserTicketTypes - count repeated ticket once and ignore canceled ticket', async () => {
	const userTickets = tickets.ticketRepeated;

	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 1).toBeTruthy();
	await expect(result[0] === 1).toBeTruthy();
});
