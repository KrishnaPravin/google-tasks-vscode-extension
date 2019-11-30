import * as vscode from 'vscode'

export class RootPath {
  static path: string
}

export function registerRootPath(extensionContext: vscode.ExtensionContext) {
  RootPath.path = extensionContext.extensionPath
}
