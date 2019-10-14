require('dotenv').config();

const tickets = require('./mock_data/tickets');
const cont = require('./mock_data/context');
const checkQR = require('../app/utils/checkQR');
const { getUserTicketTypes } = require('../app/utils/helper');
const flow = require('../app/utils/flow');

const activeTicketTypes = flow.solicitacoes.activeSolicitations;

jest.mock('../app/chatbot_api');
jest.mock('../app/utils/labels');

it('buildMainMenu - mainMenu - no tickets', async () => {
	const context = cont.quickReplyContext();

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === 3).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreDipiou').toBeTruthy();
});

// it('buildMainMenu - mainMenu with sendShare', async () => {
// 	const context = cont.quickReplyContext();
// 	context.state.sendShare = true;

// 	const result = await checkQR.buildMainMenu(context);
// 	await expect(result.quick_replies.length === 4).toBeTruthy();
// 	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
// 	await expect(result.quick_replies[1].payload === 'sobreLGPD').toBeTruthy();
// 	await expect(result.quick_replies[2].payload === 'sobreDipiou').toBeTruthy();
// 	await expect(result.quick_replies[3].payload === 'compartilhar').toBeTruthy();
// });

it('buildMainMenu - mainMenu for funcionario ', async () => {
	const context = cont.quickReplyContext();
	context.state.isFuncionario = { name: 'etiqueta', id: '0001' };
	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === 4).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreDipiou').toBeTruthy();
	await expect(result.quick_replies[3].payload === 'beginQuiz').toBeTruthy();
});

it('buildMainMenu - mainMenu for funcionario and quizEnded true', async () => {
	const context = cont.quickReplyContext();
	context.state.isFuncionario = { name: 'etiqueta', id: '0001' };
	context.state.quizEnded = true;
	context.state.sendShare = true;

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === 3).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreDipiou').toBeTruthy();
});

it('buildMainMenu - mainMenu with all kinds of tickets open', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.UserOneOfEachStatus;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);
	await expect(result.quick_replies.length === 3).toBeTruthy();
	await expect(context.state.userTicketTypes.length < context.state.ticketTypes.ticket_types.length).toBeFalsy();
	await expect(context.state.userTickets && context.state.userTickets.itens_count > 0).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'meuTicket').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreDipiou').toBeTruthy();
});

it('buildMainMenu - mainMenu with one kind of ticket open', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.userOneOpen;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);

	await expect(result.quick_replies.length === 4).toBeTruthy();
	await expect(context.state.userTicketTypes.length < context.state.ticketTypes.ticket_types.length).toBeTruthy();
	await expect(context.state.userTickets && context.state.userTickets.itens_count > 0).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'meuTicket').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[3].payload === 'sobreDipiou').toBeTruthy();
});

it('buildMainMenu - mainMenu with all tickets closed', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.userAllClosed;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildMainMenu(context);

	await expect(result.quick_replies.length === 4).toBeTruthy();
	await expect(context.state.userTicketTypes.length < context.state.ticketTypes.ticket_types.length).toBeTruthy();
	await expect(context.state.userTickets && context.state.userTickets.itens_count > 0).toBeTruthy();
	await expect(result.quick_replies[0].payload === 'solicitacoes').toBeTruthy();
	await expect(result.quick_replies[1].payload === 'meuTicket').toBeTruthy();
	await expect(result.quick_replies[2].payload === 'sobreLGPD').toBeTruthy();
	await expect(result.quick_replies[3].payload === 'sobreDipiou').toBeTruthy();
});

it('buildAtendimento - atendimento with no tickets', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = { tickets: [] };

	const result = await checkQR.buildAtendimento(context);
	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
});

it('buildAtendimento - atendimento with no tickets and ignore deactivated ticket', async () => {
	const context = cont.quickReplyContext();
	context.state.ticketTypes.ticket_types.push({ id: 777, name: 'Teste' });
	context.state.userTickets = { tickets: [] };

	const result = await checkQR.buildAtendimento(context);
	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
});

it('buildAtendimento - atendimento with all tickets closed', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.userAllClosed;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildAtendimento(context);
	await expect(result.quick_replies.length === activeTicketTypes.length).toBeTruthy();
	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${activeTicketTypes[index]}`).toBeTruthy(); });
});

it('buildAtendimento - atendimento with two tickets open', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.ticketTwoOpen;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const expectedOptions = [2, 4, 5];
	const result = await checkQR.buildAtendimento(context);
	await expect(result.quick_replies.length === expectedOptions.length).toBeTruthy();
	result.quick_replies.forEach(async (opt, index) => { await expect(opt.payload === `solicitacao${expectedOptions[index]}`).toBeTruthy(); });
});

it('buildAtendimento - atendimento with all tickets', async () => {
	const context = cont.quickReplyContext();
	context.state.userTickets = tickets.UserOneOfEachStatus;
	context.state.userTicketTypes = await getUserTicketTypes(context.state.userTickets.tickets);

	const result = await checkQR.buildAtendimento(context);
	await expect(result).toBeFalsy();
});
