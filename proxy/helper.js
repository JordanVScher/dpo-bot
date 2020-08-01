const axios = require('axios');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const jsonfile = require('jsonfile');
const redis = require('./redis');

// import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import redis from 'redis';
// import randtoken from 'rand-token';

const nextApiPH = '<NOVA_API>';
const securityToken = process.env.REACT_APP_SECURITY_TOKEN_MA;
const nextDomain = process.env.REACT_APP_MANDATOABERTO_API_URL;
const sessionFolder = `${__dirname}/.jwt_sessions`;

async function handleErrorApi(options, res, statusCode, err) {
	let msg = `Endereço: ${options.url}`; // eslint-disable-line
	msg += `\nMethod: ${options.method}`;
	if (options.params) msg += `\nQuery: ${JSON.stringify(options.params, null, 2)}`;
	if (options.headers) msg += `\nHeaders: ${JSON.stringify(options.headers, null, 2)}`;
	msg += `\nMoment: ${new Date()}`;
	if (statusCode) msg += `\nStatus Code: ${statusCode}`;

	if (res) msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;
	if (err) msg += `\nErro: ${err.stack || err}`;

	// console.log('----------------------------------------------', `\n${msg}`, '\n\n');

	if ((res && (res.error || res.form_error)) || (!res && err)) {
		if (process.env.REACT_APP_ENV !== 'local') {
			msg += `\nEnv: ${process.env.REACT_APP_ENV}`;
			// await Sentry.captureMessage(msg);
		}
	}
}

async function handleRequestAnswer(response) {
	try {
		const { status } = response;
		const { data } = await response;
		await handleErrorApi(response.config, data, status, false);
		return data;
	} catch (error) {
		await handleErrorApi(response.config, false, null, error);
		return {};
	}
}

async function makeRequest(opt) {
	opt.params.security_token = securityToken;
	opt.url = opt.url.replace(nextApiPH, nextDomain);

	const backResponse = await axios(opt).then((response) => response).catch((err) => err.response);
	return handleRequestAnswer(backResponse);
}

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;
const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION;

async function filterchatbotData(data) {
	delete data.fb_access_token;
	delete data.answers;
	delete data.name;
}

async function registerJWT({ userKey, pageId, uuid }) {
	console.log('AAAAAAAAAAAA', `${sessionFolder}/${userKey}`);
	// get chatbot profile data
	const chatbotData = await makeRequest({ url: `${nextApiPH}/api/chatbot/politician`, method: 'get', params: { fb_page_id: pageId } });
	chatbotData.pageId = pageId;
	filterchatbotData(chatbotData);

	const { id: userId } = await makeRequest({
		url: `${nextApiPH}/api/chatbot/recipient`,
		method: 'post',
		params: { uuid, politician_id: chatbotData.user_id, name: `browser:${uuid}` },
	});

	// Generate new refresh token and it's expiration
	const refreshToken = randtoken.uid(64);
	const refreshTokenMaxage = new Date() + jwtRefreshExpiration;

	// Generate new access token
	const token = jwt.sign({ uid: userKey, chatbotData, userId },
		jwtSecret, { expiresIn: jwtExpiration });
	console.log(`created ${userId}:${token}`);
	await jsonfile.writeFileSync(`${sessionFolder}/${userKey}.json`,
		{
			token, refreshToken, expires: refreshTokenMaxage,
		},
		{ spaces: 2 });

	return { token, chatbotData, userId };
}


async function checkJWT(token) {
	if (!token) return { error: 'Token missing' };

	const results = await jwt.verify(token, jwtSecret, async (err, decoded) => {
		if (err) {
			if (err.name === 'TokenExpiredError') {
				const newDecoded = await jwt.decode(token);
				const onFile = await jsonfile.readFile(`${sessionFolder}/${newDecoded.uid}.json`);

				const storedToken = onFile.token;
				const { refreshToken } = onFile;

				if (!storedToken || storedToken.refreshToken === refreshToken) {
					return { error: 'invalid refresh token' };
				}

				if (storedToken.expires > new Date()) {
					const newRefreshToken = randtoken.uid(64);
					const refreshTokenMaxage = new Date() + jwtRefreshExpiration;
					jsonfile.writeFile(`${sessionFolder}/${decoded.uid}.json`, {
						refreshToken,
						expires: refreshTokenMaxage,
					}).then(() => { console.log('Write complete'); }).catch((error) => console.error(error));

					const newToken = jwt.sign({ uid: decoded.uid }, jwtSecret, { expiresIn: jwtExpiration });
					return { token: newToken, refreshToken: newRefreshToken };
				}
			}
			// error
			return { error: 'Invalid token' };
		}
		// no error
		return { decoded };
	});
	return results;
}

module.exports = {
	handleRequestAnswer,
	makeRequest,
	registerJWT,
	checkJWT,
};
