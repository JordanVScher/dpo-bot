
import { withTyping } from 'bottender';
import { getStarted } from './src/utils/flow';

const messageWaiting = eval(process.env.REACT_APP_WITH_TYPING); // eslint-disable-line no-eval

// const { getPoliticianData } = require('./src/chatbot_api');

// const mapPageToAccessToken = async (pageId) => {
// 	const perfilData = await getPoliticianData(pageId);
// 	return perfilData && perfilData.fb_access_token ? perfilData.fb_access_token : process.env.REACT_APP_MESSENGER_ACCESS_TOKEN;
// };

export default {
	channels: {
		// whatsapp: {
		// 	enabled: true,
		// 	path: '/webhooks/whatsapp',
		// 	accountSid: process.env.REACT_APP_ACCOUNT_SID,
		// 	authToken: process.env.REACT_APP_AUTH_TOKEN,
		// 	phoneNumber: process.env.REACT_APP_PHONE_NUMBER,
		// },
		// telegram: {
		// enabled: true,
		// path: '/webhooks/telegram',
		// accessToken: process.env.REACT_APP_TELEGRAM_ACCESS_TOKEN,
		// },
		messenger: {
			enabled: true,
			path: '/webhooks/messenger',
			pageId: process.env.REACT_APP_MESSENGER_PAGE_ID,
			accessToken: process.env.REACT_APP_MESSENGER_ACCESS_TOKEN,
			appId: process.env.REACT_APP_MESSENGER_APP_ID,
			appSecret: process.env.REACT_APP_MESSENGER_APP_SECRET,
			verifyToken: process.env.REACT_APP_MESSENGER_VERIFY_TOKEN,
			// mapPageToAccessToken,
			profile: {
				getStarted: {
					payload: 'greetings',
				},
				greeting: [
					{
						locale: 'default',
						text: getStarted,
					},
				],
				persistentMenu: [
					{
						locale: 'default',
						composerInputDisabled: false,
						callToActions: [
							{
								type: 'postback',
								title: 'Ir para o início',
								payload: 'greetings',
							},
							{
								type: 'nested',
								title: 'Notificações 🔔',
								call_to_actions: [
									{
										type: 'postback',
										title: 'Ligar Notificações 👌',
										payload: 'notificationOn',
									},
									{
										type: 'postback',
										title: 'Parar Notificações 🛑',
										payload: 'notificationOff',
									},
								],
							},
						],
					},
				],
			},
		},
	},


	session: {
		driver: 'file',
		stores: {
			file: {
				dirname: '.sessions',
			},
		},
	},

	plugins: [withTyping({ delay: messageWaiting || 0 })],
};
