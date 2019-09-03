const { capQR } = require('./attach');
const flow = require('./flow');
const { sendMainMenu } = require('./dialogs');


module.exports.endQuiz = async (context) => {
	await context.setState({ dialog: 'endQuiz', quizEnded: true });
	await context.sendText(flow.quiz.done);
	await context.typing(1000 * 5);
	await sendMainMenu(context);
};

// builds quick_reply menu from the question answer options
module.exports.buildMultipleChoice = async (question, complement) => {
	// complement -> quiz or triagem to put on the button payload for each type of quiz
	const qrButtons = [];
	Object.keys(question.multiple_choices).forEach(async (element) => {
		qrButtons.push({ content_type: 'text', title: await capQR(question.multiple_choices[element]), payload: `${complement}${element}${question.code}` });
	});

	if (question.extra_quick_replies && question.extra_quick_replies.length > 0) {
		question.extra_quick_replies.forEach(async (element, index) => {
			qrButtons.push({ content_type: 'text', title: await capQR(element.label), payload: `extraQuestion${index}` });
		});
	}
	return { quick_replies: qrButtons };
};
