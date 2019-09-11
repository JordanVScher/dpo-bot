require('dotenv').config();

const tickets = require('./mock_data/tickets');
const helper = require('../app/utils/helper');

it('getUserTicketTypes - two open tickets of each kind', async () => {
	const userTickets = tickets.UserOneOfEachStatus;

	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 2).toBeTruthy();
	await expect(result[0] === 1).toBeTruthy();
	await expect(result[1] === 2).toBeTruthy();
});

it('getUserTicketTypes - repeated', async () => {
	const userTickets = tickets.userRepeatedTickets;

	const result = await helper.getUserTicketTypes(userTickets.tickets);
	await expect(result.length === 1).toBeTruthy();
	await expect(result[0] === 1).toBeTruthy();
});
