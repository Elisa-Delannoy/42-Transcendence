const { v4:uuidv4 } = require('uuid')
let items = require('../Items')

const getItems = (request, reply) => {
	reply.send(items)
}

const getItem = (request, reply) => {
	// const { id } = request.params
	//fastify capture the dynamic part of url (:id) and puts into `params`
	const id = request.params.id

	const item = items.find((item) => item.id === id)
	
	reply.send(item)
}

const addItem = (request, reply) => {
	const { name } = request.body
	// const name = request.body.name
	const item = {
		id: uuidv4(), // to create new unique id with uuid
		name	// from body
	}

	items = [...items, item] // add new item into list of items

	reply.code(201).send(item)
}

const deleteItem = (request, reply) => {
	const { id } = request.params

	items = items.filter(item => item.id !== id)

	reply.send({message: `Item ${id} has been removed`})
}

const updateItem = (request, reply) => {
	const {id} = request.params
	const {name} = request.body

	items = items.map(item => (item.id === id ? {id, name} : item))

	item = items.find((item) => item.id === id)

	reply.send(item)
}

module.exports = {
	getItems,
	getItem,
	addItem,
	deleteItem,
	updateItem,
}