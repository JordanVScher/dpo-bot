module.exports = {
	UserOneOfEachStatus: {
		tickets: [
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 2, name: '' },
				message: [],
				status: 'progress',
			},
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'closed',
			},
			{
				type: { id: 2, name: '' },
				message: [],
				status: 'canceled',
			},
			{
				type: { id: 3, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 4, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 5, name: '' },
				message: [],
				status: 'pending',
			},
		],
		itens_count: 7,
	},

	userOneOpen: {
		tickets: [
			{
				response: [],
				closed_at: null,
				id: 1,
				type: {
					id: 1,
					name: 'Tipo 1',
				},
				message: [],
				status: 'pending',
				assigned_at: '2019-09-03T17:46:50',
				created_at: '2019-09-02T14:24:58',
				recipient: {
					name: 'Jon',
					id: 1,
				},
			},
		],
		itens_count: 1,
	},
	userAllClosed: {
		tickets: [
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'closed',
			},
			{
				type: { id: 2, name: '' },
				message: [],
				status: 'canceled',
			},
			{
				type: { id: 3, name: '' },
				message: [],
				status: 'closed',
			},
			{
				type: { id: 4, name: '' },
				message: [],
				status: 'canceled',
			},
			{
				type: { id: 5, name: '' },
				message: [],
				status: 'closed',
			},

		],
		itens_count: 5,
	},

	ticketTwoOpen: {
		tickets: [
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 3, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 5, name: 'Tipo 3'	},
				message: [],
				status: 'canceled',
			},

		],
		itens_count: 3,
	},
	ticketRepeated: {
		tickets: [
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 1, name: '' },
				message: [],
				status: 'pending',
			},
			{
				type: { id: 5, name: 'Tipo 3'	},
				message: [],
				status: 'canceled',
			},

		],
		itens_count: 3,
	},
};
