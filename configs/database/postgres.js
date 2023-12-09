const { Client } = require('pg');

const postgresClient = () => {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false }
	});
	return client;
};

module.exports = { postgresClient };