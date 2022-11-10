import fs = require('fs')
import Axios from 'axios'

export async function downloadImage(url: string, filepath: string, filename: string) {
  try {
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    return new Promise((resolve, reject) => {
      fs.mkdirSync(filepath, { recursive: true })
      response.data
        .pipe(fs.createWriteStream(`${filepath}/${filename}`))
        .on('error', reject)
        .once('close', () => resolve(filepath))
    })
  } catch (error) {
    console.error(error)
  }
}

export const formatSortieName = (name: string) => name.trim().replace(/\\/gi, '').replace(/ /gi, '_')
