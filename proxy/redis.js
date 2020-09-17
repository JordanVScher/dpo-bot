const redis = require('redis');
const { promisify } = require('util');

const host = `${process.env.REDIS_HOST}-${process.env.PROJECT_NAME}`;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;

console.log(`process.env.REDIS_PASSWORD`, process.env.REDIS_PASSWORD);
console.log(`process.env.REDIS_PORT`, process.env.REDIS_PORT);
console.log(`process.env.REDIS_HOST`, process.env.REDIS_HOST);
console.log(`process.env.PROJECT_NAME`, process.env.PROJECT_NAME);



const redisClient = redis.createClient({ host, port, password });

redisClient.on('error', (error) => {
	console.error('Error on redis client');
	console.error(error);
});

redisClient.on('connect', () => {
	console.log('Redis client connected');
});

module.exports = {
	get: promisify(redisClient.get).bind(redisClient),
	set: promisify(redisClient.set).bind(redisClient),
	rpush: promisify(redisClient.rpush).bind(redisClient),
	lpush: promisify(redisClient.lpush).bind(redisClient),
};
