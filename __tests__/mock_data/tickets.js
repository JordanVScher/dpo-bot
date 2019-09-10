module.exports = {
	UserOneOfEachStatus: {
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
			{
				type: {
					id: 2,
					name: 'Tipo 1',
				},
				id: 2,
				closed_at: null,
				response: [],
				recipient: {
					name: 'Jon',
					id: 1,
				},
				created_at: '2019-09-02T14:59:02',
				status: 'progress',
				assigned_at: null,
				assignor: {
					picture: null,
					id: null,
					name: null,
				},
				message: [],
			},
			{
				response: [],
				closed_at: null,
				id: 3,
				type: {
					id: 1,
					name: 'Tipo 1',
				},
				message: [],
				status: 'closed',
				assigned_at: '2019-09-03T17:46:50',
				created_at: '2019-09-02T14:24:58',
				recipient: {
					name: 'Jon',
					id: 1,
				},
			},
			{
				type: {
					id: 2,
					name: 'Tipo 1',
				},
				id: 4,
				closed_at: null,
				response: [],
				recipient: {
					name: 'Jon',
					id: 1,
				},
				created_at: '2019-09-02T14:59:02',
				status: 'canceled',
				assigned_at: null,
				assignor: {
					picture: null,
					id: null,
					name: null,
				},
				message: [],
			},
		],
		itens_count: 4,
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
				response: [],
				closed_at: null,
				id: 1,
				type: {
					id: 1,
					name: 'Tipo 1',
				},
				message: [],
				status: 'canceled',
				assigned_at: '2019-09-03T17:46:50',
				created_at: '2019-09-02T14:24:58',
				recipient: {
					name: 'Jon',
					id: 1,
				},
			},
			{
				response: [],
				closed_at: null,
				id: 2,
				type: {
					id: 2,
					name: 'Tipo 2',
				},
				message: [],
				status: 'closed',
				assigned_at: '2019-09-03T17:46:50',
				created_at: '2019-09-02T14:24:58',
				recipient: {
					name: 'Jon',
					id: 1,
				},
			},
		],
		itens_count: 2,
	},

	userRepeatedTickets: {
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
			{
				response: [],
				closed_at: null,
				id: 1,
				type: {
					id: 1,
					name: 'Tipo 1',
				},
				message: [],
				status: 'canceled',
				assigned_at: '2019-09-03T17:46:50',
				created_at: '2019-09-02T14:24:58',
				recipient: {
					name: 'Jon',
					id: 1,
				},
			},
			{
				type: {
					id: 2,
					name: 'Tipo 1',
				},
				id: 2,
				closed_at: null,
				response: [],
				recipient: {
					name: 'Jon',
					id: 1,
				},
				created_at: '2019-09-02T14:59:02',
				status: 'canceled',
				assigned_at: null,
				assignor: {
					picture: null,
					id: null,
					name: null,
				},
				message: [],
			},
		],
		itens_count: 4,
	},


};
