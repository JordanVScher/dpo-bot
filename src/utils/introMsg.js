import flow from './flow';

const introMsg = {
	messages: [
		{
			type: 'embed',
			content: flow.avatarImage,
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
