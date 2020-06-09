import { Context } from 'bottender';

const defaultDelay = 0;

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
	async sendQuickReply(action, delay = defaultDelay) {
		await this.client.sendAction({
			type: 'button',
			action,
			delay,
			// loading: true,
		});
	}

	async sendBotText(content, delay = defaultDelay) {
		await this.client.sendText({
			content,
			delay,
			type: 'text',
			// photo: true,
			human: false,
		});
	}

	async sendText(content, buttons, delay = defaultDelay) {
		await this.sendBotText(content, delay);

		if (buttons) {
			const action = buildButtons(buttons);
			if (action && action.length > 0) {
				await this.sendQuickReply(action, delay);
			}
		}
	}

	async sendHumanText(content, delay = defaultDelay) {
		await this.client.sendText({
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
	async sendAttachment(content) {
		await this.client.sendAttachment({
			type: 'embed',
			content,
		});
	}

	async sendHTML(content) {
		await this.client.sendAttachment({
			type: 'html',
			content,
		});
	}

	async sendImage(content) {
		await this.sendHTML(`<img class="botui-image" src="${content}">`);
	}

	async sendVideo(content) {
		await this.sendHTML(`<video class="botui-video" src="${content}" controls>Seu Navegador não tem suporte a vídeo</video>`);
	}

	async sendAudio(content) {
		await this.sendHTML(`<audio class="botui-audio" src="${content}" controls>Seu Navegador não tem suporte a áudio</audio>`);
	}

	async typingOn() { return null; } // eslint-disable-line

	async typingOff() { return null; } // eslint-disable-line

	async typing() { return null; } // eslint-disable-line


	/**
  * Sends a text area to botui
  * @param {String} placeholder - A string that will serve as a placeholder for the text area
  *  @example await context.sendTextFreeText("Need help?");
  */
	async sendTextArea(content, placeholder = 'Entre com seu texto aqui', delay = defaultDelay) {
		await this.sendBotText(content, delay);

		await this.client.sendAction({
			type: 'text',
			action: { placeholder },
			delay,
		});
	}

	// Erases messages array. In the button "greetings" case, we use it to erase the intro
	async resetMessages() {
		await this.client.resetMessages();
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
