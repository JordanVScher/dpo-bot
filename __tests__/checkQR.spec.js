require('dotenv').config();

const tickets = require('./mock_data/tickets');
const cont = require('./mock_data/context');
const checkQR = require('../src/utils/checkQR');
const { getUserTicketTypes } = require('../src/utils/helper');
// const flow = require('../src/utils/flow');

// const activeTicketTypes = flow.solicitacoes.activeSolicitations;

jest.mock('../src/chatbot_api');
jest.mock('../src/utils/labels');

it('buildMainMenu - mainMenu - no tickets', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'sobreLGPD', 'sobreDipiou', 'faleConosco'];

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

it('buildMainMenu - mainMenu for funcionario ', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'sobreLGPD', 'sobreDipiou', 'beginQuiz', 'faleConosco'];
	context.state.isFuncionario = { name: 'etiqueta', id: '0001' };

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

it('buildMainMenu - mainMenu for funcionario and quizEnded true', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'sobreLGPD', 'sobreDipiou', 'faleConosco'];
	context.state.isFuncionario = { name: 'etiqueta', id: '0001' };
	context.state.quizEnded = true;

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

it('buildMainMenu - mainMenu with all kinds of tickets open', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'meuTicket', 'sobreLGPD', 'sobreDipiou', 'faleConosco'];
	context.state.userTickets = tickets.UserOneOfEachStatus;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

it('buildMainMenu - mainMenu with one kind of ticket open', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'meuTicket', 'sobreLGPD', 'sobreDipiou', 'faleConosco'];
	context.state.userTickets = tickets.userOneOpen;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

it('buildMainMenu - mainMenu with all tickets closed', async () => {
	const context = cont.quickReplyContext();
	const expected = ['informacoes', 'meuTicket', 'sobreLGPD', 'sobreDipiou', 'faleConosco'];
	context.state.userTickets = tickets.userAllClosed;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === expected.length).toBeTruthy();
	result.quick_replies.forEach(async (e, i) => { await expect(e.payload === expected[i]).toBeTruthy(); });
});

// it('buildAtendimento - atendimento with no tickets', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.userTickets = { tickets: [] };

// 	const result = await checkQR.buildAtendimento(context);
// 	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
// 	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
// });

// it('buildAtendimento - atendimento with no tickets and ignore deactivated ticket', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.ticketTypes.ticket_types.push({ id: 777, name: 'Teste' });
// 	context.state.userTickets = { tickets: [] };

// 	const result = await checkQR.buildAtendimento(context);
// 	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
// 	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
// });

// it('buildAtendimento - atendimento with all tickets closed', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.userTickets = tickets.userAllClosed;
// 	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

// 	const result = await checkQR.buildAtendimento(context);
// 	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
// 	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
// });

// it('buildAtendimento - atendimento with two tickets open', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.userTickets = tickets.ticketTwoOpen;
// 	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

// 	const expectedOptions = [2, 4, 5];
// 	const result = await checkQR.buildAtendimento(context);
// 	await expect(result.quick_replies.length === expectedOptions.length).toBeTruthy();
// 	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${expectedOptions[index]}`).toBeTruthy(); });
// });

// it('buildAtendimento - atendimento with all tickets', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.userTickets = tickets.UserOneOfEachStatus;
// 	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

// 	const result = await checkQR.buildAtendimento(context);
// 	await expect(result).toBeFalsy();
// });
