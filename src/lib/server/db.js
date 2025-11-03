import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

let pool;

function createPool() {
	const get = (name) => {
		const value = env[name];

		if (!value) {
			throw new Error(`Missing required environment variable ${name}`);
		}

		return value;
	};

	return mysql.createPool({
		host: get('MYSQL_HOST'),
		port: env.MYSQL_PORT ? Number(env.MYSQL_PORT) : 3306,
		user: get('MYSQL_USER'),
		password: get('MYSQL_PASSWORD'),
		database: get('MYSQL_DATABASE'),
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
		timezone: 'Z'
	});
}

export function getPool() {
	if (!pool) {
		pool = createPool();
	}

	return pool;
}

export async function query(sql, params = []) {
	const [rows] = await getPool().execute(sql, params);
	return rows;
}
