const handler = require('./src/BottenderApp');

module.exports = async function App(context) {
	await handler(context);
};
