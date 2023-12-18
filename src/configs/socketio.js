const { Server } = require('socket.io');

module.exports.config = async (server) => {
	const io = new Server(server, {
		cors: {
			origin: '*'
		}
	});
	const { createClient } = require('redis');
	const redisClient = createClient({
		url: process.env.REDIS_SERVER
	});
	const subscriber = redisClient.duplicate();
	await subscriber.connect();
	subscriber.subscribe('notification', message => {
		const { socketId, data } = JSON.parse(message);
		console.log(`${socketId}:${data}`);
		io.to(socketId).emit('notification', data);
	});
	io.on('connection', socket => {
		socket.on('join', async (user) => {
			if (socket.id && user.email) {
				const redisClient = createClient({ url: process.env.REDIS_SERVER });
				await redisClient.connect();
				await Promise.allSettled([
					redisClient.set(socket.id, user.email),
					redisClient.set(user.email, socket.id)
				]);
				await redisClient.disconnect();
			}
			console.log(`User join: ${user.email}: ${socket.id}`);
			io.to(socket.id).emit('notification', `welcome ${user.email}`);
		});
		socket.on('disconnect', async () => {
			const redisClient = createClient({ url: process.env.REDIS_SERVER });
			await redisClient.connect();
			const email = await redisClient.get(`${socket.id}`);
			if (socket.id && email) {
				await Promise.allSettled([
					redisClient.del(socket.id),
					redisClient.del(email)
				]);
			}
			await redisClient.disconnect();
			console.log(`User left: ${email}: ${socket.id}`);
		});
	});
};
