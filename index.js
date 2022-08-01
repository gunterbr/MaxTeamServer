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
    
      res.send(count)
      
  })

  

})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))