import * as path from 'path'
import * as fs from 'fs'
import {google} from 'googleapis'
import {OAuth2Client} from 'googleapis-common'
import {RootPath} from '../RootPath'

export default function getOAuthClient(): OAuth2Client {
  const credentials = getCredentials()
  try {
    const {client_secret, client_id, redirect_uris} = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1])
    return oAuth2Client
  } catch (err) {
    console.error(err)
    throw new Error('Error creating OAuthClient')
  }
}

function getCredentials() {
  try {
    return JSON.parse(fs.readFileSync(path.join(RootPath.path, 'resources', 'credentials.json')).toString())
  } catch (err) {
    console.log(err)
    if (err.code === 'ENOENT') throw new Error('Credentials not found')
    else {
      console.error(err)
      throw new Error('Error in retrieving credentials')
    }
  }
}
