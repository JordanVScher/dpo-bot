import { Context } from 'bottender';

class BrowserContext extends Context {
	sendText(content, delay = 0) {
		this.client.sendText({
			content,
			delay,
			type: 'text',
			human: false,
		});
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

	/**
  * Sends a text area to botui
  * @param {String} placeholder - A string that will serve as a placeholder for the text area
  *  @example await context.sendTextFreeText("Need help?");
  */
	sendTextFreeText(placeholder = 'Entre com seu texto aqui') {
		this.client.sendAction({
			type: 'text',
			action: {
				placeholder,
			},
		});
	}

	// sendButtonText() {
	// 	this.client.sendAction({
	// 		type: 'buttontext',
	// 		addMessage: true,
	// 		autoHide: false,
	// 		actionButton: [
	// 			{
	// 				text: '1',
	// 				value: 'Check',
	// 			},
	// 			{
	// 				text: '2',
	// 				value: 'Change',
	// 			},
	// 		],
	// 		actionText: { placeholder: 'Entre seu texto' },
	// 	});
	// }
}

export default BrowserContext;
