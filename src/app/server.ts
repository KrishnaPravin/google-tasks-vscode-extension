import * as http from 'http'
import {EventEmitter} from 'events'

export default function getOAuthCode(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const stopServer$ = new EventEmitter()

    const server = http
      .createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html')
        try {
          if (!req.url) throw new Error()
          const code = req.url.split('code=')[1].split('&')[0] // extracting the value present in the query param `code`
          if (!code) throw new Error()
          res.writeHead(200).end('<h1>This tab can be closed now</h1><h2>Please check the VS Code window</h2>')
          resolve(code)
        } catch (err) {
          res.writeHead(400).end('<h1>Unable to get OAuth <i>code</i></h1><h1>Please try again</h2>')
          // TODO: check error message in browser for this scenario
          reject()
        }
        stopServer$.emit('stopped')
      })
      .listen(11223)

    // TODO: handle server port unavailable scenario

    stopServer$.on('stopped', () => {
      console.log('Stopping server...')
      server.close()
      stopServer$.removeAllListeners()
    })
  })
}
