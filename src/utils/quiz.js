const assistenteApi = require('../chatbot_api');
const aux = require('./quiz_aux');
const flow = require('./flow');

// loads next question and shows it to the user
async function answerQuiz(context) {
	await context.typingOn();
	// if the user never started the quiz (or if the user already ended the quiz once === '') the type is 'preparatory'
	if (!context.state.typeQuiz || context.state.typeQuiz === '') { await context.setState({ typeQuiz: 'preparatory' }); }

	await context.setState({ currentQuestion: await assistenteApi.getPendinQuestion(context.session.user.id, context.state.typeQuiz) });
	console.log('\nA nova pergunta do get', context.state.currentQuestion, '\n');
	console.log('typeQuiz', context.state.typeQuiz);

	// user already answered the quiz (user shouldn't be here)
	if (!context.state.currentQuestion || !context.state.currentQuestion.question || context.state.currentQuestion.question.code === null) {
		await aux.endQuiz(context);
	} else { // user is still answering the quiz
		// showing question and answer options
		if (context.state.currentQuestion.question.type === 'multiple_choice') {
			await context.sendText(context.state.currentQuestion.question.text, await aux.buildMultipleChoice(context.state.currentQuestion.question, 'quiz'));
		} else if (context.state.currentQuestion.question.type === 'open_text') {
			await context.setState({ onTextQuiz: true });
			await context.sendText(context.state.currentQuestion.question.text);
		}
		await context.typingOff();
	}
}

async function handleAnswer(context, quizOpt) {
	// context.state.currentQuestion.code -> the code for the current question
	// quizOpt -> the quiz option the user clicked/wrote
	await context.setState({ sentAnswer: await assistenteApi.postQuizAnswer(context.session.user.id, context.state.typeQuiz, context.state.currentQuestion.question.code, quizOpt) });
	console.log(`\nResultado do post da pergunta ${context.state.currentQuestion.question.code} - ${quizOpt}:`, context.state.sentAnswer, '\n');
	await context.setState({ onTextQuiz: false });

	if (context.state.sentAnswer.error || !context.state.sentAnswer) { // internal error
		await context.sendText(flow.quiz.form_error);
		await context.setState({ dialog: 'startQuiz' }); // re-asks same question
	} else if (context.state.sentAnswer.form_error || (context.state.sentAnswer.form_error && context.state.sentAnswer.form_error.answer_value && context.state.sentAnswer.form_error.answer_value === 'invalid')) {
		await context.sendText(flow.quiz.invalid); // Date is: YYYY-MM-DD, // input format is wrong
		await context.setState({ dialog: 'startQuiz' }); // re-asks same question
	} else {
		if (context.state.sentAnswer.followup_messages) {
			for (let i = 0; i < context.state.sentAnswer.followup_messages.length; i++) { // eslint-disable-line no-plusplus
				await context.sendText(context.state.sentAnswer.followup_messages[i]);
			}
		}

		// check if the quiz is over, if we have more questions then it's not
		if (context.state.currentQuestion && context.state.currentQuestion.question && context.state.currentQuestion.has_more === 1) {
			await context.setState({ dialog: 'startQuiz' }); // not over, sends user to next question
		} else {
			await aux.endQuiz(context);
		}
	}
}


// extra questions -> explanation of obscure terms
// sends the answer to the question and sends user back to the question
async function answerExtraQuestion(context) {
	const index = context.state.lastQRpayload.replace('extraQuestion', '');
	const answer = context.state.currentQuestion.extra_quick_replies[index].text;
	await context.sendText(answer);
	await context.setState({ dialog: 'startQuiz' }); // re-asks same question
	return answer;
}

module.exports = {
	answerQuiz,
	handleAnswer,
	answerExtraQuestion,
};
