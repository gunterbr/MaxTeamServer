const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require("multer")

const app = express()
app.use(cors())
app.use('/uploads', express.static('./uploads'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))

const PORT = process.env.PORT || 3001

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
      'Access-Control-Allow-Headers',
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

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads')
  },
  filename: function (req, file, cb) {
      // Extração da extensão do arquivo original:
      const extensaoArquivo = file.originalname.split('.')[1];

      // Cria um código randômico que será o nome do arquivo
      const novoNomeArquivo = require('crypto')
          .randomBytes(8)
          .toString('hex');

      // Indica o novo nome do arquivo:
      cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
  }
});

const upload = multer({ storage });

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
    if (err) {
      res.status(500).send(err)
    } else {
      if (result > 0) {
        res.status(400).send('Username indisponível!')
      } else {
        connection.query(query, [user, username, password], err => {
          if (err) throw err
          res.status(200).send('Usuário cadastrado com sucesso!')
        })
      }
    }
  })

})

//Login
app.post('/login', (req, res) => {

  const { username, password } = req.body

	const query = `SELECT * FROM login WHERE username = ? AND password = ?`

	connection.query(query, [username, password], (err, result) => {
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
        res.status(400).send('Usuário ou senha incorretos!')
      }
    }
	})

})

//Inscrição
app.post("/inscricao", upload.array('files', 2), async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body))
  const file = JSON.parse(JSON.stringify(req.files))
  console.log(body)

  if (!file[0].filename) {
    res.status(400).send('Upload failed!')
  } else {
    const { nomeCandidato, contato, evento, numeroInscricao } = body
    const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = file[0]

    const check = `SELECT COUNT(*) AS equalInscricao FROM inscricao WHERE numeroInscricao = ?`
    const query = `INSERT INTO inscricao (nomeCandidato, contato, evento, numeroInscricao) VALUES (?, ?, ?, ?)`
    const fileDB = `INSERT INTO comprovante (fieldname, originalname, encoding, mimetype, destination, filename, path, size, fk_numeroInscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    connection.query(check, numeroInscricao, (err, count) => {
      const result = JSON.stringify(count[0].equalInscricao)
      if (err) {
        res.status(500).send(err)
      } else {
        if (result > 0) {
          res.status(400).send('Tivemos um problema ao gerar seu número de inscrição :(\n\nTente novamente!')
        } else {
          connection.query(query, [nomeCandidato, contato, evento, numeroInscricao], err => {
            if (err) {
              res.status(500).send(err)
            } else {
              connection.query(fileDB, [fieldname, originalname, encoding, mimetype, destination, filename, path, size, numeroInscricao], err => {
                if (err) {
                  res.status(200).send('O sistema não conseguiu receber o seu comprovante.\n\nTente novamente!' + err)
                } else {
                  res.status(200).send('Inscrição finalizada com sucesso!')
                }
              })
            }
          })

        }
      }
    })
  }

})

//Confirmar Inscrição
app.put('/confirmar', (req, res) => {

  const { deferida, responsavel, id, numeroInscricao } = req.body
	
	const query = `UPDATE inscricao SET deferida = ?, responsavel = ? WHERE idinscricao = ? AND numeroInscricao = ?`
  connection.query(query, [deferida, responsavel, id, numeroInscricao], (err, result) => {
	  const count = JSON.stringify(result.affectedRows)
    if (err) {
      res.status(500).send(err)
    } else {
      if (count > 0) {
        res.status(200).send({
          status: `${deferida}`,
          message: 'O registro foi atualizado.'
        })
      }
    }
	})

})

app.get("/getInscritos", (req, res) => {
	const mysql =
    'SELECT * FROM inscricao INNER JOIN comprovante ON inscricao.numeroInscricao = comprovante.fk_numeroInscricao ORDER BY inscricao.idinscricao DESC'
    connection.query(mysql, (err, result) => {
	  if (err) res.send(err)
	  res.send(result)
	})
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))