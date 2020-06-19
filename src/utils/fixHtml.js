import linkifyjs from 'linkifyjs';

const addLinkTag = (text) => `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`;

const replaceLinks = (text) => {
	try {
		let res = text;
		const links = linkifyjs.find(text);

		links.forEach((e) => {
			const newUrl = addLinkTag(e.href);
			res = res.replace(e.value, newUrl);
		});

		return res;
	} catch (error) {
		return text;
	}
};

export default replaceLinks;
