import { MessengerClient } from 'messaging-api-messenger';
import helper from './helper';
import config from '../../bottender.config';

const messengerConfig = config.channels.messenger;

const client = MessengerClient.connect({
	accessToken: messengerConfig.accessToken,
	appSecret: messengerConfig.appSecret,
});

async function sendBroadcast(USER_ID, textMsg, buttons) {
	if (!USER_ID) return { error: 'no USER_ID' };
	try {
		const res = await client.sendText(USER_ID, textMsg, buttons).then(() => null).catch((err) => err);
		return res;
	} catch (err) {
		helper.sentryError(`Erro no broadcast para ${USER_ID}!`, err);
		return err;
	}
}

export default sendBroadcast;
