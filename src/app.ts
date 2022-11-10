import * as dotenv from 'dotenv'
dotenv.config()
import { MySQLPool } from '@fastify/mysql'
import Fastify from 'fastify'
import { downloadImage, formatSortieName } from './utils'
import { IPhotosSorties, ISortie } from './types'
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
}>('/sortie/:id', function (req, reply) {
  const { id } = req.params
  let name: string
  let date: string

  fastify.mysql.query('SELECT * FROM `sorties` WHERE `id` = ?', [id], function (err, result) {
    if (err) {
      reply.send(err)
    }
    const sortie = (result as ISortie[])?.[0]
    if (!sortie) {
      reply.send('Sortie not found')
      return
    }
    name = formatSortieName(sortie.nom)
    date = dayjs(sortie.datedu).format('DD-MM-YYYY')
  })

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
