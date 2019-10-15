require('dotenv').config();

const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');
const checkQR = require('../app/utils/checkQR');

jest.mock('../app/chatbot_api');
jest.mock('../app/utils/labels');
jest.mock('../app/utils/checkQR');

it('handleSolicitacaoRequest - no entites', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = null;

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });
});

it('handleSolicitacaoRequest - empty solicitacao entites', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: '' };

	await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacoes' });
});

it('handleSolicitacaoRequest - error: solicitation not found', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: 'foobar' };

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.sendText).toBeCalledWith(flow.solicitacoes.noSolicitationType);
	await expect(context.sendText).toBeCalledWith(flow.mainMenu.text1, await checkQR.buildMainMenu(context));
	await expect(result.idSolicitation).toBeFalsy(undefined);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBe(undefined);
});


it('handleSolicitacaoRequest - revogar new', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: 'Revogar' };
	context.state.userTicketTypes = [2, 3];

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao1' });
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBeTruthy();
});

it('handleSolicitacaoRequest - revogar new', async () => {
	const context = cont.quickReplyContext();
	context.state.userTicketTypes = [1];

	context.state.resultParameters = { solicitacao: 'Revogar' };
	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.sendText).toBeCalledWith(flow.solicitacoes.userHasOpenTicket.replace('<TIPO_TICKET>', 'Teste 1'));
	await expect(context.sendText).toBeCalledWith(flow.mainMenu.text1, await checkQR.buildMainMenu(context));
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeTruthy();
	await expect(result.ticket).toBeTruthy();
});
