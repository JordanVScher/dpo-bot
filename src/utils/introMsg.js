import flow from './flow';

const introMsg = {
	messages: [
		{
			type: 'html',
			content: `<img class="botui-image"  src="${flow.avatarImage}">`,
		},
		{
			content: flow.getStarted,
		},
	],
	action: {
		type: 'button',
		action: [
			{
				text: 'Conversar',
				value: 'greetings',
			},
		],
	},
};

export default introMsg;
