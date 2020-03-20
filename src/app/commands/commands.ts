import {commands, window} from 'vscode'

import {removeToken} from '../Token'
import {AuthorizeGoogleTreeDataProvider} from '../TreeDataProviders/AuthorizeGoogle'
import initiateUserAuthorization from '../userAuthorization'

const commandsList = {
  'googleTasks.logout': () => {
    removeToken()
    commands.executeCommand('setContext', 'GoogleUserTokenExists', false)
    window.registerTreeDataProvider('googleTasks', new AuthorizeGoogleTreeDataProvider())
  },
  'extension.initUserGAuth': initiateUserAuthorization
}

export function registerCommands(): void {
  Object.entries<() => void>(commandsList).forEach(([key, value]) => commands.registerCommand(key, value))
}
