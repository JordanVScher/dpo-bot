const axios = require('axios');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const randtoken = require('rand-token');
// import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import redis from 'redis';
// import randtoken from 'rand-token';

const securityToken = process.env.SECURITY_TOKEN_MA || process.env.REACT_APP_SECURITY_TOKEN_MA;
const nextDomain = process.env.MANDATOABERTO_API_URL || process.env.REACT_APP_MANDATOABERTO_API_URL;

const rediscl = redis.createClient({ password: process.env.REDIS_PASSWORD });
rediscl.on('connect', () => { console.log('Redis plugged in.'); });

async function handleErrorApi(options, res, statusCode, err) {
	let msg = `Endereço: ${options.url}`;
	msg += `\nMethod: ${options.method}`;
	if (options.params) msg += `\nQuery: ${JSON.stringify(options.params, null, 2)}`;
	if (options.headers) msg += `\nHeaders: ${JSON.stringify(options.headers, null, 2)}`;
	msg += `\nMoment: ${new Date()}`;
	if (statusCode) msg += `\nStatus Code: ${statusCode}`;

	if (res) msg += `\nResposta: ${JSON.stringify(res, null, 2)}`;
	if (err) msg += `\nErro: ${err.stack || err}`;

	// console.log('----------------------------------------------', `\n${msg}`, '\n\n');

	if ((res && (res.error || res.form_error)) || (!res && err)) {
		if (process.env.ENV !== 'local') {
			msg += `\nEnv: ${process.env.ENV}`;
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
	opt.url = opt.url.replace('<NOVA_API>', nextDomain);

	const backResponse = await axios(opt).then((response) => response).catch((err) => err.response);
	return handleRequestAnswer(backResponse);
}

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;
const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION;

async function registerJWT(userKey) {
	// Generate new refresh token and it's expiration
	const refreshToken = randtoken.uid(64);
	const refreshTokenMaxage = new Date() + jwtRefreshExpiration;

	// Generate new access token
	console.log('jwtExpiration', jwtExpiration);
	const token = jwt.sign({ uid: userKey }, jwtSecret, {
		expiresIn: jwtExpiration,
	});

	console.log('token', token);

	rediscl.set(userKey, JSON.stringify({
		refreshToken,
		expires: refreshTokenMaxage,
	}),
	redis.print);

	return { token, refreshToken };
}


module.exports = { handleRequestAnswer, makeRequest, registerJWT };
