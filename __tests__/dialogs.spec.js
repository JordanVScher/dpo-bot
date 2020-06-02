require('dotenv').config();

const cont = require('./mock_data/context');
const flow = require('../src/utils/flow');
const dialogs = require('../src/utils/dialogs');
const checkQR = require('../src/utils/checkQR');

jest.mock('../src/chatbot_api');
jest.mock('../src/utils/labels');
jest.mock('../src/utils/checkQR');

it('handleSolicitacaoRequest - with apiaiTextAnswer', async () => {
	const context = cont.quickReplyContext();
	context.state.apiaiTextAnswer = 'foobar';
	context.state.apiaiResp = { result: { actionIncomplete: true } };

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: '' });
	await expect(context.sendText).toBeCalledWith(context.state.apiaiTextAnswer);
});

it('handleSolicitacaoRequest - with apiaiTextAnswer - cancelado', async () => {
	const context = cont.quickReplyContext();
	context.state.apiaiResp = { result: { actionIncomplete: false } };
	context.state.apiaiTextAnswer = 'ok, está Cancelado.';

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: '' });
	await expect(context.sendText).toBeCalledWith(context.state.apiaiTextAnswer);
	await expect(context.sendText).toBeCalledWith(flow.mainMenu.text1, await checkQR.buildMainMenu(context));
});

it('handleSolicitacaoRequest - no entites', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = null;

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });
});

it('handleSolicitacaoRequest - empty solicitacao entity', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: [] };

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });
});

it('handleSolicitacaoRequest - no solicitacao entity', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { foo: 'bar' };

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });
});

it('handleSolicitacaoRequest - error: solicitation not found', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: ['foobar'] };

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.sendText).toBeCalledWith(flow.solicitacoes.noSolicitationType);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });

	// await expect(context.sendText).toBeCalledWith(flow.mainMenu.text1, await checkQR.buildMainMenu(context));
	await expect(result.idSolicitation).toBeFalsy(undefined);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBe(undefined);
});


it('handleSolicitacaoRequest - Revogar new', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: ['Revogar'] };
	context.state.userTicketTypes = [2, 3];

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao1', onSolicitacoes: false });
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBeTruthy();
});

it('handleSolicitacaoRequest - Revogar cant be repeated ', async () => {
	const context = cont.quickReplyContext();
	context.state.userTicketTypes = [1];

	context.state.resultParameters = { solicitacao: ['Revogar'] };
	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.sendText).toBeCalledWith(flow.solicitacoes.userHasOpenTicket.replace('<TIPO_TICKET>', 'Teste 1'));
	await expect(context.sendText).toBeCalledWith(flow.mainMenu.text1, await checkQR.buildMainMenu(context));
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeTruthy();
	await expect(result.ticket).toBeTruthy();
});

it('handleSolicitacaoRequest - Incidente new', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: ['Incidente'] };
	context.state.userTicketTypes = [2, 3];

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao7', onSolicitacoes: false });
	await expect(result.idSolicitation).toBe(7);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBeTruthy();
});

it('handleSolicitacaoRequest - Incidente can be repeated', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: ['Incidente'] };
	context.state.userTicketTypes = [2, 7];

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao7', onSolicitacoes: false });
	await expect(result.idSolicitation).toBe(7);
	await expect(result.userHas).toBeTruthy(); // !
	await expect(result.ticket).toBeTruthy();
});


it('handleSolicitacaoRequest - two entities, uses the first one', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: ['Revogar', 'Consulta'] };
	context.state.userTicketTypes = [2, 3];

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao1', onSolicitacoes: false });
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBeTruthy();
});
