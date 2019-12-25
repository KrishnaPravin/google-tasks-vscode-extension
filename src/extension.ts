import * as vscode from 'vscode'

import loadGoogleTasks from './app/TreeDataLoader'
import {registerRootPath} from './RootPath'
import {removeToken} from './app/Token'
import {AuthorizeGoogleTreeDataProvider} from './app/TreeDataProviders/AuthorizeGoogle'

export function activate(context: vscode.ExtensionContext) {
  registerRootPath(context)

  console.log('"google-tasks" Extension is now active!')
  // context.subscriptions.push()

  loadGoogleTasks()

  vscode.commands.registerCommand('googleTasks.logout', () => {
    removeToken()
    vscode.commands.executeCommand('setContext', 'GoogleUserTokenExists', false)
    vscode.window.registerTreeDataProvider('googleTasks', new AuthorizeGoogleTreeDataProvider())
  })
}

export function deactivate() {}
