require('dotenv').config();

const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');

jest.mock('../app/chatbot_api');
jest.mock('../app/utils/labels');

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
	await expect(result.idSolicitation).toBeFalsy(undefined);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBe(undefined);
});


it('handleSolicitacaoRequest - revogar new', async () => {
	const context = cont.quickReplyContext();
	context.state.resultParameters = { solicitacao: 'Revogar' };

	const result = await dialogs.handleSolicitacaoRequest(context);
	await expect(context.setState).toBeCalledWith({ dialog: 'solicitacao1' });
	await expect(result.idSolicitation).toBe(1);
	await expect(result.userHas).toBeFalsy();
	await expect(result.ticket).toBeTruthy();
});
