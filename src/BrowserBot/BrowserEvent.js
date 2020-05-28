class BrowserEvent {
	constructor(rawEvent) {
		this._rawEvent = rawEvent;
	}

	get rawEvent() {
		return this._rawEvent;
	}

	static get isMessage() {
		return true;
	}

	get message() {
		return this._rawEvent.message;
	}

	static get isText() {
		return true;
	}

	get text() {
		return this._rawEvent.message.text;
	}
}

export default BrowserEvent;
