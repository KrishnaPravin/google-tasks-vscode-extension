import * as vscode from 'vscode'

import loadGoogleTasks from './app/TreeDataLoader'
import {registerRootPath} from './RootPath'
import {removeToken} from './app/Token'
import {AuthorizeGoogleTreeDataProvider} from './app/TreeDataProviders/AuthorizeGoogle'
import {extensionQualifiedId} from './Constants'

export function activate(context: vscode.ExtensionContext) {
  const start = process.hrtime()

  registerRootPath(context)

  loadGoogleTasks()

  vscode.commands.registerCommand('googleTasks.logout', () => {
    removeToken()
    vscode.commands.executeCommand('setContext', 'GoogleUserTokenExists', false)
    vscode.window.registerTreeDataProvider('googleTasks', new AuthorizeGoogleTreeDataProvider())
  })

  const googleTasks = vscode.extensions.getExtension(extensionQualifiedId)!
  const googleTasksVersion = googleTasks.packageJSON.version
  console.log(`GoogleTasks (v${googleTasksVersion}) activated ⏱ ${getDurationMilliseconds(start)} ms`)
}

function getDurationMilliseconds(start: [number, number]) {
  const [secs, nanoseconds] = process.hrtime(start)
  return secs * 1000 + Math.floor(nanoseconds / 1000000)
}

export function deactivate() {}
