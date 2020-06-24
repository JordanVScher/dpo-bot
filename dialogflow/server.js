import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import textRequestDF from './agent';

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


const port = process.env.DF_PORT || process.env.REACT_APP_DF_PORT;
app.listen(port, (err) => {
	if (err) throw err;
	console.log(`Dialogflow Server is running on ${port} port...`);
});
