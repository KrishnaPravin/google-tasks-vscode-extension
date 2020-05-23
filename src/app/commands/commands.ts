import {commands, window} from 'vscode'

import telemetry from '../../telemetry'
import {removeToken} from '../Token'
import {AuthorizeGoogleTreeDataProvider} from '../TreeDataProviders/AuthorizeGoogle.TreeDataProvider'
import initiateUserAuthorization from '../userAuthorization'
import gTaskTreeProvider from '../TreeDataProviders/GTask/GTask.TreeDataProvider'
import {GTaskList} from '../TreeDataProviders/GTask/GTaskList.treeItem'
import {GTask} from '../TreeDataProviders/GTask/GTask.treeItem'

const commandsList = {
  'googleTasks.logout': () => {
    removeToken()
    commands.executeCommand('setContext', 'GoogleUserTokenExists', false)
    window.registerTreeDataProvider('googleTasks', new AuthorizeGoogleTreeDataProvider())
  },
  'googleTasks.initUserGAuth': initiateUserAuthorization,
  'googleTasks.showCompleted': () => {
    commands.executeCommand('setContext', 'ShowCompleted', true)
    commands.executeCommand('setContext', 'HideCompleted', false)
    gTaskTreeProvider.refresh({showCompleted: true})
  },
  'googleTasks.hideCompleted': () => {
    commands.executeCommand('setContext', 'ShowCompleted', false)
    commands.executeCommand('setContext', 'HideCompleted', true)
    gTaskTreeProvider.refresh({showCompleted: false})
  },
  'googleTasks.refresh': () => {
    gTaskTreeProvider.refresh()
  },
  'googleTasks.addTaskList': async () => {
    const title = await window.showInputBox({
      prompt: 'Please provide a title for the tasklist',
      placeHolder: 'Tasklist title',
      value: undefined,
      ignoreFocusOut: true,
    })
    if (title === undefined || title.length === 0) return undefined

    gTaskTreeProvider.addTaskList({requestBody: {title}})
  },
  'googleTasks.deleteTaskList': async (node: GTaskList) => {
    gTaskTreeProvider.deleteTaskList({tasklist: node.taskList.id || undefined})
  },
  'googleTasks.addTask': async (node: GTaskList) => {
    if (node.taskList.id === null) return

    const title = await window.showInputBox({
      prompt: 'Please provide a title for the task',
      placeHolder: 'Task title',
      value: undefined,
      ignoreFocusOut: true,
    })
    if (title === undefined || title.length === 0) return undefined

    const notes = await window.showInputBox({
      prompt: 'Please provide the notes for the task',
      placeHolder: 'Notes for the task',
      value: undefined,
      ignoreFocusOut: true,
    })

    gTaskTreeProvider.addTask({tasklist: node.taskList.id, requestBody: {title, notes}})
  },
  'googleTasks.deleteTask': async (node: GTask) => {
    if (node.task.id) gTaskTreeProvider.deleteTask({tasklist: node.taskListId, task: node.task.id})
  },
  'googleTasks.completeTask': async (node: GTask) => {
    if (node.task.id)
      gTaskTreeProvider.completeTask({
        tasklist: node.taskListId,
        task: node.task.id,
        requestBody: {
          status: 'completed',
          hidden: true,
        },
      })
  },
}

export function registerCommands(): void {
  Object.entries(commandsList).forEach(([command, handler]) =>
    commands.registerCommand(command, sendTelemetry(command, handler))
  )
}

function sendTelemetry(command: string, handler: Function) {
  return function () {
    telemetry.sendTelemetryEvent(command.replace('googleTasks.', ''))
    return handler(arguments)
  }
}
