import * as dotenv from 'dotenv'
dotenv.config()
import { MySQLPool } from '@fastify/mysql'
import Fastify from 'fastify'
import { downloadImage, formatSortieName } from './utils'
import { IPhotosSorties, ISortieConcatenated } from './types'
import dayjs from 'dayjs'

const host = process.env.HOST
const port = process.env.PORT
const base = process.env.BASE
const user = process.env.USER
const password = process.env.PASSWORD
const webSiteUrl = process.env.WEBSITE_URL

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPool
  }
}

interface IParams {
  id: string
}

const fastify = Fastify({
  logger: {
    level: 'info',
    file: 'logs/app.log',
  },
})

fastify.register(require('@fastify/mysql'), {
  connectionString: `mysql://${user}:${password}@${host}:${port}/${base}`,
})

fastify.get<{
  Params: IParams
}>('/sorties', function (req, reply) {
  fastify.mysql.query(
    `SELECT sorties.*, typessorties.typesortie, difficultes.difficulte,
      (SELECT GROUP_CONCAT(photossorties.nomfichier) 
      FROM photossorties 
      WHERE photossorties.FK_sortie = sorties.id
      GROUP BY photossorties.FK_sortie) AS nomfichiers
    FROM sorties
    JOIN typessorties ON sorties.FK_typesortie = typessorties.id
    JOIN difficultes ON sorties.FK_difficulte = difficultes.id
    JOIN utilisateurs ON sorties.FK_resp = utilisateurs.id`,
    (err, result) => {
      if (err) {
        reply.send(err)
      }
      const sorties = result as ISortieConcatenated[]
      console.log('result', sorties)
      reply.send(sorties)
    }
  )
})

fastify.get<{
  Params: IParams
}>('/sorties/:id', function (req, reply) {
  const { id } = req.params
  let name: string
  let date: string

  fastify.mysql.query(
    `SELECT sorties.*, typessorties.typesortie, difficultes.difficulte
    FROM sorties
    JOIN typessorties ON sorties.FK_typesortie = typessorties.id
    JOIN difficultes ON sorties.FK_difficulte = difficultes.id
    JOIN utilisateurs ON sorties.FK_resp = utilisateurs.id
    WHERE sorties.id = ?`,
    [id],
    function (err, result) {
      if (err) {
        reply.send(err)
      }
      const sortie = (result as ISortieConcatenated[])?.[0]
      if (!sortie) {
        reply.send('Sortie not found')
        return
      }
      name = formatSortieName(sortie.nom)
      date = dayjs(sortie.datedu).format('DD-MM-YYYY')
    }
  )

  fastify.mysql.query('SELECT * FROM `photossorties` WHERE `FK_sortie` = ?', [id], function (err, result) {
    if (err) {
      reply.send(err)
    }
    reply.send(result)
    ;(result as IPhotosSorties[]).map((photo) => {
      const fileName = photo.nomfichier
      downloadImage(`${webSiteUrl}/${fileName}`, `./img/${id}_${name}_${date}/`, `${fileName}`)
    })
  })
})

fastify.get('/ping', async (_request, _reply) => {
  return 'pong\n'
})

fastify.get('/', function (_request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    console.error(err)
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
  console.log(`Server listening at ${address}`)
})
