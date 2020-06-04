/* eslint class-methods-use-this: 0 */

import BrowserContext from './BrowserContext';
import BrowserEvent from './BrowserEvent';

const { v4: uuidv4 } = require('uuid');

class BrowserConnector {
	constructor(client) {
		this._client = client;
		this._userID = uuidv4();
	}

	get platform() {
		return 'browser';
	}

	getUniqueSessionKey() {
		return this._userID;
	}

	updateSession(session) {
		if (!session.user) {
			session.user = {
				id: 2323142361097483,
				// id: this.getUniqueSessionKey(),
				name: 'you',
				_updatedAt: new Date().toISOString(),
				platform: 'browser',
			};
		}

		Object.freeze(session.user);
		Object.defineProperty(session, 'user', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: session.user,
		});
	}

	mapRequestToEvents(body) {
		return [new BrowserEvent(body)];
	}

	createContext(params) {
		return new BrowserContext({
			...params,
			client: this._client,
		});
	}
}

export default BrowserConnector;
