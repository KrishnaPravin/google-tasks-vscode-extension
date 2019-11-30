'use strict'

import * as fs from 'fs'
import * as path from 'path'
import {Credentials} from 'google-auth-library'
import {RootPath} from '../RootPath'

function getTokenPath(): string {
  return path.join(RootPath.path, 'resources', 'token.json')
}

export function storeToken(token: Credentials) {
  try {
    fs.writeFileSync(getTokenPath(), JSON.stringify(token))
  } catch (err) {
    console.error(err)
    throw new Error('Error storing access token')
  }
}

export function getStoredToken(): Credentials {
  try {
    return JSON.parse(fs.readFileSync(getTokenPath()).toString())
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('Token not found')
    throw new Error('Error getting stored Google token')
  }
}
