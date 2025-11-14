# Web: Backend Framework

## Requirement:
Major module: Use a framework to build the backend.
In this major module, you are required to use a specific web framework for backend development: `Fastify` with `Node.js`.

### Fastify

`Fastify` is one of the fastest `Node.js` frameworks with low cost.
- Core concept of `Fastify`: "everything is a plugin"
	- the routes, database connection, authentication logic,... should structure as plugins.
	- this is important because it allowes `Fastify` to encapsulate, load asynchronously, be testable.

- Install `Fastify` with `Node.js` sur MacOs:

```bash
# assume that we have already Node.js
npm install fastify
```
- compile backend:
```bash
npx tsx back/server.ts
```
- start a project:
```bash
npm init
# then it creates a .json
```





#### Reference
- [Fastify Crash Course](https://www.youtube.com/watch?v=Lk-uVEVGxOA)