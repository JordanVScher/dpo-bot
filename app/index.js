require('dotenv').config();

const { MessengerBot, FileSessionStore, withTyping } = require('bottender');
const { createServer } = require('bottender/restify');
const { associatesLabelToUser } = require('./utils/postback');

const config = require('./bottender.config.js').messenger;
// const { getPoliticianData } = require('./mandatoaberto_api');

// const mapPageToAccessToken = async (pageId) => {
//   const perfilData = await getPoliticianData(pageId);
//   return perfilData.fb_access_token;
// };

const bot = new MessengerBot({
	// mapPageToAccessToken,
	accessToken: config.accessToken,
	appSecret: config.appSecret,
	verifyToken: config.verifyToken,
	sessionStore: new FileSessionStore(),
});

bot.setInitialState({});

const messageWaiting = eval(process.env.WITH_TYPING); // eslint-disable-line no-eval
if (messageWaiting) { bot.use(withTyping({ delay: messageWaiting })); }

const handler = require('./handler');

bot.onEvent(handler);

const server = createServer(bot, { verifyToken: config.verifyToken });

server.post('/add-label', async (req, res) => {
	if (!req.body || !req.body.user_id || !req.body.label_name || !req.body.security_token) {
		res.status(400); res.send('Params user_id, label_name and security_token are required!');
	} else {
		const userID = req.body.user_id;
		const labelName = req.body.label_name;
		const securityToken = req.body.security_token;
		if (securityToken !== process.env.SECURITY_TOKEN_MA) {
			res.status(401); res.send('Unauthorized!');
		} else {
			const response = await associatesLabelToUser(userID, labelName);
			res.status(200); res.send(response);
		}
	}
});

server.listen(process.env.API_PORT, () => {
	console.log(`Server is running on ${process.env.API_PORT} port...`);
	console.log(`App: ${process.env.APP} & Page: ${process.env.PAGE}`);
	console.log(`MA User: ${process.env.MA_USER}`);
});
