const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const connection = mysql.createPool({
	host: process.env.MYSQL_HOST,
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
})

app.get('/', (req, res) => {
  res.send('Welcome to my API!')
})

app.post('/newuser', (req, res) => {

  const { user, username, password } = req.body

  const check = `SELECT count(username) FROM login WHERE username = ?`
  connection.query(check, [user, username, password], (error, count) => {
    if (error) throw error
    if (count > 0) {
      res.send('Username não disponível!')
      return
    }
  })

  const sql = `INSERT INTO login (user, username, password) VALUES (?, ?, ?)`
  connection.query(sql, [user, username, password], error => {
    if (error) throw error
    res.send('Usuário cadastrado com sucesso!')
  })

})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))