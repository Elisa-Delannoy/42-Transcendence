const {getItems, getItem, addItem, deleteItem, updateItem} = require('../controllers/items')

// item schema
const Item = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
	}
}

// options for get all items
const getItemsOpts = {
	schema: {
		response: {
			200: {
				type: 'array',
				items: Item,
				// items: {
				// 	type: 'object',
				// 	properties: {
				// 		id: { type: 'string' },
				// 		name: { type: 'string' },
				// 	},
				// },
			},
		},
	},
	// handler: function(req, reply) {
	// 	reply.send(items)
	// },
	handler: getItems,
}

// options for single item
const getItemOpts = {
	schema: {
		response: {
			200: Item,
			// 200: {
			// 	type: 'object',
			// 	properties: {
			// 		id: { type: 'string' },
			// 		name: { type: 'string' },
			// 	},
			// },
		},
	},
	// handler: function (request, reply) {
	// 	const {id} = request.params
	// 	const item = items.find(item => item.id === id)
	// 	reply.send(item)
	// }
	handler: getItem,
}

const postItemOpts = {
	schema: {
		body: {
			type: 'object',	// be a JSON object
			required: ['name'],	// top-level key named 'name'
			properties: {
				name: {type: 'string'},	// value of 'name' must be string
			},
		},
		response: {
			201: Item,
		},
	},
	handler: addItem,
}

const deleteItemOpts = {
	schema: {
		response: {
			200: {
				type: 'object',
				properties: {
					message: { type: 'string' }
				}
			},
		},
	},
	handler: deleteItem,
}

const updateItemOpts = {
	schema: {
		response: {
			200: Item,
		},
	},
	handler: updateItem,
}

function itemRoutes (fastify, options, done) {
	//get all items
	// fastify.get('/items', getItemsOpts, (request, reply) => {
	// 	reply.send(items)
	// })
	fastify.get('/items', getItemsOpts)

	// get single item
	// fastify.get('/items/:id', getItemOpts, (request, reply) => {
	// 	const {id} = request.params
	// 	const item = items.find(item => item.id === id)
	// 	reply.send(item)
	// })
	fastify.get('/items/:id', getItemOpts)

	fastify.post('/items', postItemOpts)

	fastify.delete('/items/:id', deleteItemOpts)

	fastify.put('/items/:id', updateItemOpts)

	done()
}

module.exports = itemRoutes