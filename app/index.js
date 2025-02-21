// index.js
const express = require('express');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

console.log("DATABASE_HOST: ", process.env.DATABASE_HOST);
console.log("DATABASE_USER: ", process.env.DATABASE_USER);
console.log("DATABASE_NAME: ", process.env.DATABASE_NAME);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Database Configuration ---
const dbConfig = {
	host: process.env.DATABASE_HOST || 'db',
	user: process.env.DATABASE_USER || 'user',
	password: process.env.DATABASE_PASSWORD || 'pass',
	database: process.env.DATABASE_NAME || 'mydatabase',
	port: 5432,
};

// --- Multer Configuration ---
// Save the file to /usr/src/app/uploads in the container (mapped to ./uploads on host)
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, '/usr/src/app/uploads');
	},
	filename: (req, file, cb) => {
		// Generate a unique name by appending a timestamp + original extension
		const uniqueSuffix = Date.now() + path.extname(file.originalname);
		cb(null, uniqueSuffix);
	},
});

const upload = multer({ storage });

// --- Routes ---
app.get('/', (req, res) => {
	res.send(`
    <h1>Hello Docker Compose Workshop!</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
    <form action="/message" method="POST">
      <input type="text" name="msg" placeholder="Message to store in DB"/>
      <button type="submit">Store</button>
    </form>
  `);
});

// 1) File upload & DB insert
app.post('/upload', upload.single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}

	const client = new Client(dbConfig);

	try {
		// Connect to Postgres
		await client.connect();

		// 1. Ensure our table exists
		//    We'll store: ID, filename, and file_data (binary).
		await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        file_data BYTEA NOT NULL
      );
    `);

		// 2. Read the file from disk
		const filePath = req.file.path;
		const fileBuffer = fs.readFileSync(filePath);

		// 3. Insert into the DB
		//    Insert the filename and the entire file as binary data
		const insertQuery = `
      INSERT INTO files (filename, file_data)
      VALUES ($1, $2)
      RETURNING id;
    `;
		const values = [req.file.filename, fileBuffer];
		const result = await client.query(insertQuery, values);
		const newFileId = result.rows[0].id;

		// 4. Respond to the client
		res.send(`File "${req.file.filename}" uploaded and stored with ID=${newFileId} in the "files" table.`);
	} catch (err) {
		console.error('Error storing file:', err);
		res.status(500).send('An error occurred while storing the file in the database.');
	} finally {
		// Always close the DB connection
		await client.end();
	}
});

// 2) Example: store text in the database
app.post('/message', async (req, res) => {
	const client = new Client(dbConfig);
	try {
		await client.connect();
		const msg = req.body.msg || 'No message provided.';
		await client.query('CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, content TEXT)');
		await client.query('INSERT INTO messages(content) VALUES($1)', [msg]);
		const result = await client.query('SELECT * FROM messages');
		res.json(result.rows);
	} catch (err) {
		console.error('Error inserting or retrieving messages:', err);
		res.status(500).send('An error occurred.');
	} finally {
		await client.end();
	}
});

// --- Start the Server ---
app.listen(8080, () => {
	console.log('Web server running on port 8080');
});
