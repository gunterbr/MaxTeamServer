const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
app.get('/login', (req, res) => {



})

//Inscrição
app.post('/inscricao', (req, res) => {

  const { candidato, evento, pagamento } = req.body

  const query = 'INSERT INTO inscricao SET ?',
        values = {
          nomeCandidato: candidato,
          evento: evento,
          pagamento: pagamento
        }
  connection.query(query, values, err => {
    if (err) throw err
    res.send('Inscrição realizada!')
  })

})

//Confirmar Inscrição
app.put('/confirmar', (req, res) => {

  

})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))