import * as dotenv from 'dotenv'
dotenv.config()
import { MySQLPool } from '@fastify/mysql'
import Fastify from 'fastify'
import { downloadImage } from './utils'

const host = process.env.HOST
const port = process.env.PORT
const base = process.env.BASE
const user = process.env.USER
// const password = process.env.PASSWORD;

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPool
  }
}

interface IParams {
  id: string
}

interface IPhotosSorties {
  id: number
  FK_sortie: number
  nomfichier: string
  commentaire: string
}

const server = Fastify({
  logger: false,
})

server.register(require('@fastify/mysql'), {
  connectionString: `mysql://${user}@${host}:${port}/${base}`,
})

server.get<{
  Params: IParams
}>('/sortie/:id', function (req, reply) {
  const { id } = req.params
  console.log('id', id)
  server.mysql.query('SELECT * FROM `photossorties` WHERE `FK_sortie` = ?', [id], function (err, result) {
    if (err) {
      reply.send(err)
    }
    console.log(result)
    reply.send(result)
    ;(result as IPhotosSorties[]).map((photo: IPhotosSorties) => {
      downloadImage(
        `http://archives.caf-bagneres-bigorre.com/photos/${photo.nomfichier}`,
        `./img/${photo.FK_sortie}/`,
        `${photo.nomfichier}`
      )
    })
  })
})

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
server.listen({ port: 8080 }, function (err, address) {
  if (err) {
    console.error(err)
    server.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  console.log(`Server listening at ${address}`)
})
