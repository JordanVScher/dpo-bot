require('dotenv').config();

const express = require('express');
const cors = require('cors');
const textRequestDF = require('./agent');
const helper = require('./helper');

// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import textRequestDF from './agent';
// import helper from './helper';


const app = express();

app.use(cors());
app.use(express.json());

app.post('/text-request', async (req, res) => {
	const { sessionId, queryText, jwt } = req.body;

	const access = await helper.checkJWT(jwt);
	if (!access || access.error) res.status(400).send({ error: access && access.error ? access.error : 'invalid jwt' });

	if (typeof sessionId !== 'string' || typeof queryText !== 'string') {
		res.status(422).send({ error: 'Missing "sessionId" or "queryText" params.' });
		return;
	}

	const result = await textRequestDF(queryText, sessionId);

	if (!result || !result[0] || !result[0].responseId) {
		res.status(500).send({ error: 'There was an error processing the request.' });
		return;
	}

	res.send({ result });
});

app.post('/request', async (req, res) => {
	const opt = req.body;
	const userJwt = opt && opt.params && opt.params.jwt ? opt.params.jwt : {};
	const access = await helper.checkJWT(userJwt);
	if (!access || access.error) res.status(400).send({ error: access && access.error ? access.error : 'invalid jwt' });

	const tosend = await helper.makeRequest(opt);
	res.send(tosend);
});

app.post('/register', async (req, res) => {
	const { userKey } = req.body;
	const result = await helper.registerJWT(userKey);

	if (!result || !result.token) res.status(500).send({ error: 'There was an error generating the JWT.' });
	res.send(result);
});


const port = process.env.REACT_APP_PROXY_PORT;
app.listen(port, (err) => {
	if (err) throw err;
	console.log(`Dialogflow Server is running on ${port} port...`);
});
