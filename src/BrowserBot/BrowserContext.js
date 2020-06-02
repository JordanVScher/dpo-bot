import { Context } from 'bottender';

const buildButtons = (btns) => {
	const res = [];
	const buttons = btns.quick_replies;
	buttons.forEach((e) => {
		if (typeof e.title === 'string' && typeof e.payload === 'string') {
			res.push({
				text: e.title,
				value: e.payload,
			});
		}
	});

	return res;
};

class BrowserContext extends Context {
	async getUserProfile() {
		const id = this.session.user.id.toString();

		const profile = {
			name: `browser ${id}`,
			profilePic: '',
			email: '',
			firstName: 'browser',
			lastName: id,
		};

		return profile;
	}

	/**
  * Sends quickreply buttons to botui
  * @param {Array} action - An array of objects containing "text" and "value"
  * @example await context.sendQuickReply([{ text: "What the user sees", value: "What the bot receives"}]);
  */
	sendQuickReply(action) {
		this.client.sendAction({
			type: 'button',
			action,
		});
	}

	sendBotText(content, delay) {
		this.client.sendText({
			content,
			delay,
			type: 'text',
			// photo: true,
			human: false,
		});
	}

	sendText(content, buttons, delay = 0) {
		this.sendBotText(content, delay);

		if (buttons) {
			const action = buildButtons(buttons);
			if (action && action.length > 0) {
				this.sendQuickReply(action);
			}
		}
	}

	sendHumanText(content, delay = 0) {
		this.client.sendText({
			content,
			delay,
			type: 'text',
			human: true,
		});
	}

	/**
  * Sends an attachment to botui
  * @param {String} content - A link to the attachment online (can be audio, video or image)
  * @example await context.sendAttachment('https://www.youtube.com/embed/ZRBH5vHhm4c');
  */
	sendAttachment(content) {
		this.client.sendAttachment({
			type: 'embed',
			content,
		});
	}

	sendImage(content) { this.sendAttachment(content); }

	sendVideo(content) { this.sendAttachment(content); }

	sendAudio(content) { this.sendAttachment(content); }

	typingOn() { return null; } // eslint-disable-line

	typingOff() { return null; } // eslint-disable-line

	typing() { return null; } // eslint-disable-line


	/**
  * Sends a text area to botui
  * @param {String} placeholder - A string that will serve as a placeholder for the text area
  *  @example await context.sendTextFreeText("Need help?");
  */
	sendTextFreeText(content, placeholder = 'Entre com seu texto aqui') {
		this.sendBotText(content);

		this.client.sendAction({
			type: 'text',
			action: {
				placeholder,
			},
		});
	}

	// Erases messages array. In the button "greetings" case, we use it to erase the intro
	resetMessages() {
		this.client.resetMessages();
	}

	// resetAction() {
	// 	this.client.sendAction({
	// 		action: {},
	// 	});
	// }

	// sendButtonText() {
	// 	this.client.sendAction({
	// 		type: 'text',
	// 		action: {
	// 			placeholder: 'escreve',
	// 		},
	// 	});
	// 	this.client.sendAction({
	// 		type: 'button',
	// 		addMessage: true,
	// 		autoHide: false,
	// 		action: [
	// 			{
	// 				text: '1',
	// 				value: 'Check',
	// 			},
	// 			{
	// 				text: '2',
	// 				value: 'Change',
	// 			},
	// 		],
	// 		// actionText: { placeholder: 'Entre seu texto' },
	// 	});
	// }
}

export default BrowserContext;
