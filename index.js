const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

const db = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
});

//USUÁRIOS
app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	
	let mysql = `SELECT * FROM login WHERE username = ? AND password = ?`;
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

const createUser = async (req, res, next) => {

    try {
        // var query = `SELECT * FROM users WHERE email = ?`;
        // var result = await mysql.execute(query, [req.body.email]);

        // if (result.length > 0) {
        //     return res.status(409).send({ message: 'Usuário já cadastrado' })
        // }

        // const hash = await bcrypt.hashSync(req.body.password, 10);

        const users = req.body.users.map(user => [
            user.user,
            user.username,
			user.password
        ])

        query = 'INSERT INTO users (user, username, password) VALUES ?';
        const results = await mysql.execute(query, [ users ]);

        const response = {
            message: 'Usuário criado com sucesso',
            createdUsers: req.body.users.map(user => { return { email: user.email } })
        }
        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

app.post('/api/newuser', createUser);

//EVENTOS
app.post("/register", (req, res) => {
	const { username, title, start, end, backgroundColor } = req.body;
  
	let mysql = `INSERT INTO events (username,backgroundColor, title, start, end) VALUES (?, ?, ?, ?, ?)`;
	db.query(mysql, [username, backgroundColor, title, start, end], (err, result) => {
		if(err) return console.log("Verifique as informações e tente novamente!")
		res.send(result);
	});
});
  
app.get("/search", (req, res) => {
	const { title, username } = req.body;

	let mysql =
	  `SELECT * FROM events WHERE title = ? AND username = ?`;
	db.query(mysql, [title, username], (err, result) => {
	  if (err) res.send(err);
	  res.send(result);
	});
});
  
app.get("/getCards/:username", (req, res) => {
	const { username } = req.params;

	let mysql =
	  `SELECT * FROM events WHERE username = ?`;
	db.query(mysql, username, (err, result) => {
	  if (err) res.send(err);
	  res.send(result);
	});
});
  
app.put("/edit", (req, res) => {
	const { id, title, start, end } = req.body;
	
	let mysql = `UPDATE events SET title = ?, start = ?, end = ? WHERE id = ?`;
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
	
	let mysql = `DELETE FROM events WHERE id = ?`;
	db.query(mysql, id, (err, result) => {
	  if (err) {
		console.log(err);
	  } else {
		res.send(result);
	  }
	});
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});