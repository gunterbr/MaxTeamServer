const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require("multer")
const { S3Client } = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

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
//const storage = multer.diskStorage({
//  destination: function (req, file, cb) {
//      cb(null, './uploads')
//  },
//  filename: function (req, file, cb) {
//      const extensaoArquivo = file.originalname.split('.')[1]
//      const novoNomeArquivo = require('crypto')
//          .randomBytes(8)
//          .toString('hex')
//      cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
//  }
//})
//
//const upload = multer({ storage })

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'maxteam',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      const extensao = file.originalname.split('.')[1]
      const novoNome = require('crypto')
          .randomBytes(8)
          .toString('hex')
      cb(null, `${novoNome}.${extensao}`)
  },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
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
  console.log(file)

  if (!file[0].originalname) {
    res.status(400).send('Upload failed!')
  } else {
    const { nomeCandidato, nascimento, contato, evento, camiseta, sexo, categoria, numeroInscricao } = body
    const { fieldname, originalname, encoding, mimetype, bucket, metadata, location, size } = file[0]

    const check = `SELECT COUNT(*) AS equalInscricao FROM inscricao WHERE numeroInscricao = ?`
    const query = `INSERT INTO inscricao (nomeCandidato, nascimento, contato, evento, camiseta, sexo, categoria, numeroInscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    const fileDB = `INSERT INTO comprovante (fieldname, originalname, encoding, mimetype, destination, filename, path, size, fk_numeroInscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    connection.query(check, numeroInscricao, (err, count) => {
      const result = JSON.stringify(count[0].equalInscricao)
      if (err) {
        res.status(500).send(err)
      } else {
        if (result > 0) {
          res.status(400).send({
            status:'warning',
            msg:'Tivemos um problema ao gerar seu número de inscrição :(\n\nTente novamente!'
          })
        } else {
          connection.query(query, [nomeCandidato, nascimento, contato, evento, camiseta, sexo, categoria, numeroInscricao], err => {
            if (err) {
              res.status(500).send(err)
            } else {
              connection.query(fileDB, [fieldname, originalname, encoding, mimetype, bucket, metadata, location, size, numeroInscricao], err => {
                if (err) {
                  res.status(200).send({
                    status:'warning',
                    msg:'O sistema não conseguiu receber o seu comprovante.\n\nTente novamente!' + err
                  })
                } else {
                  res.status(200).send({
                    status:'success',
                    msg: 'Inscrição finalizada com sucesso!'
                  })
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
          id: `${id}`,
          status: `${deferida}`,
          message: 'O registro foi atualizado.'
        })
      }
    }
	})

})

app.get("/getInscritos", (req, res) => {
	const mysql =
    'SELECT *, TIMESTAMPDIFF (YEAR, o8usy5kkwtym7eo6.inscricao.nascimento, CURDATE()) as idade FROM o8usy5kkwtym7eo6.inscricao INNER JOIN comprovante ON o8usy5kkwtym7eo6.inscricao.numeroInscricao = o8usy5kkwtym7eo6.comprovante.fk_numeroInscricao ORDER BY o8usy5kkwtym7eo6.inscricao.idinscricao DESC'
    connection.query(mysql, (err, result) => {
	  if (err) res.send(err)
	  res.send(result)
	})
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))