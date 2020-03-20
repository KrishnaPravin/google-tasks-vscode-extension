import {commands, window} from 'vscode'

import {removeToken} from '../Token'
import {AuthorizeGoogleTreeDataProvider} from '../TreeDataProviders/AuthorizeGoogle.TreeDataProvider'
import initiateUserAuthorization from '../userAuthorization'

const commandsList = {
  'googleTasks.logout': () => {
    removeToken()
    commands.executeCommand('setContext', 'GoogleUserTokenExists', false)
    window.registerTreeDataProvider('googleTasks', new AuthorizeGoogleTreeDataProvider())
  },
  'extension.initUserGAuth': initiateUserAuthorization,
  'googleTasks.showCompleted': () => {
    commands.executeCommand('setContext', 'ShowCompleted', true)
    commands.executeCommand('setContext', 'HideCompleted', false)
    gTaskTreeProvider.refresh({showCompleted: true})
  },
  'googleTasks.hideCompleted': () => {
    commands.executeCommand('setContext', 'ShowCompleted', false)
    commands.executeCommand('setContext', 'HideCompleted', true)
    gTaskTreeProvider.refresh({showCompleted: false})
  }
}

export function registerCommands(): void {
  Object.entries<() => void>(commandsList).forEach(([key, value]) => commands.registerCommand(key, value))
}
