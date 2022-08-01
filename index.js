const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3050;

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

app.post('/add', (req, res) => {
  const sql = 'INSERT INTO login SET ?';

  const customerObj = {
    user: req.body.user,
    username: req.body.username,
	password: req.body.password
  };

  connection.query(sql, customerObj, error => {
    if (error) throw error;
    res.send('Customer created!');
  });
});

connection.connect(error => {
  if (error) throw error;
  console.log('Database server running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));