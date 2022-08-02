const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
      'Access-Control-Allow-Header',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
      return res.status(200).send({})
  }
  next()
})

const connection = mysql.createPool({
	host: process.env.MYSQL_HOST,
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
})

app.get('/', (req, res) => {
  res.send('Welcome to my API!')
})

//Novo Usuário. Use o Insomnia e o modelo userAdmin.json
app.post('/newuser', (req, res) => {

  const { user, username, password } = req.body

  const check = `SELECT COUNT(*) AS equalUser FROM login WHERE username = ?`
  const query = `INSERT INTO login (user, username, password) VALUES (?, ?, ?)`

  connection.query(check, username, (err, count) => {
    const result = JSON.stringify(count[0].equalUser)
    if (err) throw err
    if (result > 0) {
      res.send('Username indisponível!')
    } else {
      connection.query(query, [user, username, password], err => {
        if (err) throw err
        res.send('Usuário cadastrado com sucesso!')
      })
    }
  })

})

//Login
app.post('/login', (req, res) => {

  const { username, password } = req.body
	
	const query = `SELECT * FROM login WHERE username = ? AND password = ?`

	connection.query(query, [username, password], (err, result) => {
		if (err) throw err
		if (result.length > 0) {
			res.send({
				"id": result[0].id,
				"user": result[0].user,
				"username": result[0].username
			})
		} else {
			res.status(400).send('Usuário ou senha incorretos!')
		}

	})

})

//Inscrição
app.post('/inscricao', (req, res) => {

  const { nomeCandidato, evento, pagamento, numeroInscricao } = req.body

  const check = `SELECT COUNT(*) AS equalInscricao FROM inscricao WHERE numeroInscricao = ?`
  const query = `INSERT INTO inscricao (nomeCandidato, evento, pagamento, numeroInscricao) VALUES (?, ?, ?, ?)`

  connection.query(check, numeroInscricao, (err, count) => {
    const result = JSON.stringify(count[0].equalInscricao)
    if (err) throw err
    if (result > 0) {
      res.send('Tivemos um problema a gerar seu número de inscrição :(\nPor favor, tente novamente!')
    } else {
      connection.query(query, [nomeCandidato, evento, pagamento, numeroInscricao], err => {
        if (err) throw err
        res.send('Inscrição realizada!')
      })
    }
  })

})

//Confirmar Inscrição
app.put('/confirmar', (req, res) => {

  

})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))