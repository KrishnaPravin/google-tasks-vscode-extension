import * as vscode from 'vscode'

import loadGoogleTasks from './app/TreeDataLoader'
import {registerRootPath} from './RootPath'

export function activate(context: vscode.ExtensionContext) {
  registerRootPath(context)

  console.log('"google-tasks" Extension is now active!')
  // context.subscriptions.push()

  loadGoogleTasks()
}

export function deactivate() {}
