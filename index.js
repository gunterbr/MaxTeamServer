const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())

const PORT = process.env.PORT || 3001;

// Adicionar os cabeçalhos Access-Control-Allow-Origin
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "https://maxteam-client.herokuapp.com");
	res.header(
	  "Access-Control-Allow-Headers",
	  "Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
  });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))

const dbName = 'heroku_5bf70bc97fafbd9';
const db = mysql.createConnection({
	host: "us-cdbr-east-06.cleardb.net",
	user: "bd29fef3837f6f",
	password: "b3ac7abf",
});

const sqlDB = `CREATE DATABASE IF NOT EXISTS ${dbName}`;
const sqlUsers = `CREATE TABLE IF NOT EXISTS ${dbName}.login(
  id int NOT NULL AUTO_INCREMENT UNIQUE,
  user varchar(150) NOT NULL,
  username varchar(150) NOT NULL UNIQUE,
  password varchar(200) NOT NULL,
  PRIMARY KEY (ID)
);`;
const sqlEvents = `CREATE TABLE IF NOT EXISTS ${dbName}.events(
  id int NOT NULL AUTO_INCREMENT UNIQUE,
  username varchar(150) NOT NULL,
  backgroundColor varchar(20) NOT NULL UNIQUE,
  title varchar(150) NOT NULL UNIQUE,
  start varchar(150) NOT NULL,
  end varchar(150) NOT NULL,
  PRIMARY KEY (ID)
);`;

db.query(sqlDB, (error) => {
  if(error) return console.log(error);
  console.log('DB: OK!');

	db.query(sqlUsers, (error) => {
		if(error) return console.log(error);
		console.log('Table user: OK!');
	});
		
	db.query(sqlEvents, (error) => {
		if(error) return console.log(error);
		console.log('Table event: OK!');
	});

});

//USUÁRIOS
app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	
	let mysql = `SELECT * FROM ${dbName}.login WHERE username = ? AND password = ?`;
	db.query(mysql, [username, password], (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			if (result.length > 0) {
				res.status(200).send({
					"id": result[0].id,
					"user": result[0].user,
					"username": result[0].username
				})
			} else {
				res.status(400).send('Usuário ou senha incorretos');
			}
		}
	});
});

app.post('/api/newuser', (req, res) => {
	const { user, username, password } = req.body;

	if(!user && !username && !password) {
		res.status(400).send('Preencha todos os campos')
	} else {
	
	let mysql = `INSERT INTO ${dbName}.login (user, username, password) VALUES (?, ?, ?)`;
	db.query(mysql, [user, username, password], (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			if (result.affectedRows > 0) {
				res.status(200).send({
					"user": result.user,
					"username": result.username,
					"password": result.password
				})
			} else {
				res.status(400).send('Tente um username diferente')
			}
		}
	});
	}
});

//EVENTOS
app.post("/register", (req, res) => {
	const { username, title, start, end, backgroundColor } = req.body;
  
	let mysql = `INSERT INTO ${dbName}.events (username,backgroundColor, title, start, end) VALUES (?, ?, ?, ?, ?)`;
	db.query(mysql, [username, backgroundColor, title, start, end], (err, result) => {
		if(err) return console.log("Verifique as informações e tente novamente!")
		res.send(result);
	});
});
  
app.get("/search", (req, res) => {
	const { title, username } = req.body;

	let mysql =
	  `SELECT * FROM ${dbName}.events WHERE title = ? AND username = ?`;
	db.query(mysql, [title, username], (err, result) => {
	  if (err) res.send(err);
	  res.send(result);
	});
});
  
app.get("/getCards/:username", (req, res) => {
	const { username } = req.params;

	let mysql =
	  `SELECT * FROM ${dbName}.events WHERE username = ?`;
	db.query(mysql, username, (err, result) => {
	  if (err) res.send(err);
	  res.send(result);
	});
});
  
app.put("/edit", (req, res) => {
	const { id, title, start, end } = req.body;
	
	let mysql = `UPDATE ${dbName}.events SET title = ?, start = ?, end = ? WHERE id = ?`;
	db.query(mysql, [title, start, end, id], (err, result) => {
	  if (err) {
		res.send(err);
	  } else {
		res.send(result);
	  }
	});
});
  
app.delete("/delete/:id", (req, res) => {
	const { id } = req.params;
	
	let mysql = `DELETE FROM ${dbName}.events WHERE id = ?`;
	db.query(mysql, id, (err, result) => {
	  if (err) {
		console.log(err);
	  } else {
		res.send(result);
	  }
	});
});

app.listen(PORT, () => {
	console.log(`Server on port ${PORT}`);
});