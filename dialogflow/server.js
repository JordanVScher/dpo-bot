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
	const { sessionId, queryText } = req.body;
	if (typeof sessionId !== 'string' || typeof queryText !== 'string') {
		res.status(422).send({ error: 'Missing "sessionId" or "queryText" params.' });
		return;
	}
	console.log('queryText', queryText);
	const result = await textRequestDF(queryText, sessionId);
	console.log(JSON.stringify(result, null, 2));
	if (!result || !result[0] || !result[0].responseId) {
		res.status(500).send({ error: 'There was an error processing the request.' });
		return;
	}

	res.send({ result });
});

app.post('/request', async (req, res) => {
	const opt = req.body;

	const tosend = await helper.makeRequest(opt);
	res.send(tosend);
});


const port = process.env.DF_PORT || process.env.REACT_APP_DF_PORT;
app.listen(port, (err) => {
	if (err) throw err;
	console.log(`Dialogflow Server is running on ${port} port...`);
});
