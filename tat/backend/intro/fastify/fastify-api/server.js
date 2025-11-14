const fastify = require('fastify')({
	logger: true
})

fastify.register(require('@fastify/swagger'), {
	swagger: {
		info: { title: 'fastify-api' },
	}
})
fastify.register(require('@fastify/swagger-ui'), {
	exposeRoute: true,
	routePrefix: '/docs',
})

fastify.register(require('./routes/items'))

const PORT = 3000


const start = async () => {
	try {
		await fastify.listen({ port: PORT})
	} catch (error) {
		fastify.log.error(error)
		process.exit(1)
	}
}

start()
