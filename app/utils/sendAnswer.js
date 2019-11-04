const MaAPI = require('../chatbot_api');
const { createIssue } = require('./send_issue');
const help = require('./helper');


async function sendAnswer(context) { // send answer from posicionamento
	// await context.setState({ currentTheme: await context.state.knowledge.knowledge_base.find(x => x.type === 'posicionamento') });
	await context.typingOn();
	await context.setState({ currentTheme: context.state.knowledge.knowledge_base[0] });

	// console.log('currentTheme', currentTheme);
	if (context.state.currentTheme && ((context.state.currentTheme.answer && context.state.currentTheme.answer.length > 0)
	|| (context.state.currentTheme.saved_attachment_type !== null && context.state.currentTheme.saved_attachment_id !== null))) {
		try {
			await MaAPI.setIntentStatus(context.state.politicianData.user_id, context.session.user.id, context.state.currentIntent, 1);
			await MaAPI.logAskedEntity(context.session.user.id, context.state.politicianData.user_id, context.state.currentTheme.entities[0].id);

			await help.sendTextAnswer(context, context.state.currentTheme);
			await help.sendAttachment(context, context.state.currentTheme);
		} catch (error) {
			await help.Sentry.configureScope(async (scope) => { // sending to sentry
				scope.setUser({ username: `${context.session.user.first_name} ${context.session.user.last_name}` });
				scope.setExtra('state', context.state);
				throw error;
			});
		}
		await context.typingOff();
	} else { // in case there's an error
		await createIssue(context);
	}
}

module.exports = { sendAnswer };
