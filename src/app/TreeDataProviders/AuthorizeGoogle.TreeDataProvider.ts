'use strict'

import * as vscode from 'vscode'

export class AuthorizeGoogleTreeDataProvider implements vscode.TreeDataProvider<AuthorizeGoogleTreeItem> {
  getTreeItem(element: AuthorizeGoogleTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }
  getChildren(element?: AuthorizeGoogleTreeItem | undefined): vscode.ProviderResult<AuthorizeGoogleTreeItem[]> {
    return [new AuthorizeGoogleTreeItem()]
  }
}

class AuthorizeGoogleTreeItem extends vscode.TreeItem {
  constructor() {
    super('Please Authorize Google')
  }
  readonly command = {
    command: 'googleTasks.initUserGAuth',
    title: 'Initiate Google Auth',
  }
  readonly description = '- Click here'
  readonly tooltip = 'Authorize to proceed'
}
