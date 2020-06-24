import handler from './src/BottenderApp';

export default async function App(context) {
	await handler(context);
}
