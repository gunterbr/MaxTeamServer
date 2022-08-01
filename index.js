const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const connection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
});

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

connection.connect(error => {
  if (error) throw error;
  console.log('Database server running!');
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));