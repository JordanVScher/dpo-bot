const { existsSync } = require('fs');
const { google } = require('googleapis');
const jsonfile = require('jsonfile');


const sessionStorage = './.sessions_hangouts';

async function buildHangoutBtns(qr) {
	const result = [];
	qr.forEach((e) => {
		result.push({
			textButton: {
				text: e.title,
				onClick: {
					action: {
						actionMethodName: 'quickreply',
						parameters: [
							{
								key: 'payload',
								value: e.payload,
							},
							// {
							// 	key: 'id',
							// 	value: '123456',
							// },
						],
					},
				},
			},
		});
	});

	return result;
}

function buildEvent(chatMessage) {
	const event = {
		rawEvent: {
			recipient: {
				id: process.env.REACT_APP_PAGE_ID,
			},
		},
	};

	const { type } = chatMessage;
	if (type === 'MESSAGE') {
		event.isText = true;
		event.message = { text: chatMessage.message.argumentText };
	} else if (type === 'CARD_CLICKED') {
		const { action } = chatMessage;
		if (action && action.actionMethodName === 'quickreply') {
			event.isQuickReply = true;
			event.quickReply = { payload: action.parameters[0].value };
		}
	} else if (type === 'ADDED_TO_SPACE') {
		event.isPostback = true;
		event.postback = { payload: 'greetings' };
	} else if (type === 'ADDED_TO_SPACE') {
		event.isPostback = true;
		event.postback = { payload: 'end' };
	}


	return event;
}

class HangoutContext {
	constructor(chatMessage) {
		this.scopes = 'https://www.googleapis.com/auth/chat.bot';
		this.message = chatMessage;
		this.parent = chatMessage.space.name;
		this.event = buildEvent(chatMessage);
		this.platform = 'hangouts';
		this.session = { user: { id: this.message.user.name.replace('users/', '') } };
		this.state = {};
		this.pathToState = `${sessionStorage}/${this.session.user.id}.json`;
	}

	async build() {
		try {
			this.auth = await google.auth.getClient({ scopes: this.scopes });
			this.chat = google.chat({ version: 'v1', auth: this.auth });

			const { pathToState } = this;

			if (await existsSync(pathToState)) { // read from the state file if it exists
				const file = await jsonfile.readFileSync(pathToState);
				this.state = file;
			} else { // create default state file if it doesn't exist
				jsonfile.writeFileSync(pathToState, this.state);
			}
		} catch (err) {
			console.error(err);
		}
	}

	async setState(newState) {
		this.state = { ...this.state, ...newState };
		await jsonfile.writeFileSync(this.pathToState, this.state); // update state file
	}


	async sendText(text, qr) {
		if (!text || typeof text !== 'string') return false;
		await this.chat.spaces.messages.create({
			parent: this.parent,
			requestBody: {
				text: `${text}\n\n`,
			},
		});

		if (qr && qr.quick_replies) {
			const buttons = await buildHangoutBtns(qr.quick_replies);
			await this.chat.spaces.messages.create({
				parent: this.parent,
				requestBody: {
					cards: [{ sections: [{ widgets: [{ buttons }] }] },
					],
				},
			});
		}
		return true;
	}

	async sendImage(url) { await this.sendText(url); }

	async sendVideo(url) { await this.sendText(url); }

	async sendAudio(url) { await this.sendText(url); }

	async sendFile(url) { await this.sendText(url); }

	async typing() { return null; } // eslint-disable-line class-methods-use-this

	async typingOn() { return null; } // eslint-disable-line class-methods-use-this

	async typingOff() { return null; } // eslint-disable-line class-methods-use-this


	async getUserProfile() {
		const { user } = this.message;
		const profile = {
			name: user.displayName,
			profilePic: user.avatarUrl,
			email: user.email,
			firstName: user.displayName.substr(0, user.displayName.indexOf(' ')),
			lastName: user.displayName.substr(user.displayName.indexOf(' ') + 1),
		};

		return profile;
	}
}

module.exports = HangoutContext;
