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

  const check = `SELECT COUNT(*) AS equalUser FROM login WHERE username = ?`
  connection.query(check, username, (err, count) => {
    const result = JSON.stringify(count[0].equalUser)
    if (err) throw err
    if (result > 0) {
      res.send('Username indisponível!')
      process.exit(1)
    }
  })

  const sql = `INSERT INTO login (user, username, password) VALUES (?, ?, ?)`
  connection.query(sql, [user, username, password], err => {
    if (err) throw err
    res.send('Usuário cadastrado com sucesso!')
    process.exit(1)
  })

})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))