'use strict'

import * as vscode from 'vscode'
import {tasks_v1, google} from 'googleapis'
import {OAuth2Client} from 'googleapis-common'

import {GTaskList} from './GTaskList.treeItem'
import {GTask} from './GTask.treeItem'

type GTaskTreeItem = GTask | GTaskList

export default class GTaskTreeProvider implements vscode.TreeDataProvider<GTaskTreeItem> {
  service: tasks_v1.Tasks

  private _onDidChangeTreeData: vscode.EventEmitter<GTask> = new vscode.EventEmitter<GTask>()
  readonly onDidChangeTreeData: vscode.Event<GTask> = this._onDidChangeTreeData.event
  private _showCompleted = false

  constructor(oAuth2Client: OAuth2Client) {
    this.service = google.tasks({version: 'v1', auth: oAuth2Client})
  }

  // Overrides
  getTreeItem(element: GTaskTreeItem): vscode.TreeItem | Promise<vscode.TreeItem> {
    return element
  }

  // Overrides
  async getChildren(element?: GTaskTreeItem): Promise<GTaskTreeItem[]> {
    if (!element) {
      const {data} = await this.service.tasklists.list()
      const list = data.items || []
      return Promise.all(list.map(taskList => GTaskListBuilder.build(taskList, this.service, this._showCompleted)))
    } else if (this._isTask(element)) {
      return element.children.map(childTask => new GTask(childTask))
    } else if (this._isTaskList(element)) return element.childTaskList || []

    vscode.window.showErrorMessage('Unknown element in getChildren')
    console.log('Unknown element in getChildren', element)
    return []
  }

  private _isTaskList(gTaskTreeItem: GTaskTreeItem): gTaskTreeItem is GTaskList {
    return (gTaskTreeItem as GTaskList).taskList !== undefined
  }

  private _isTask(gTaskTreeItem: GTaskTreeItem): gTaskTreeItem is GTask {
    return (gTaskTreeItem as GTask).task !== undefined
  }

  refresh(options?: {showCompleted: boolean}): void {
    this._showCompleted = Boolean(options && options.showCompleted)
    this._onDidChangeTreeData.fire()
  }
}

class GTaskListBuilder {
  private constructor() {}

  static async build(
    taskList: tasks_v1.Schema$TaskList,
    service: tasks_v1.Tasks,
    showCompleted: boolean
  ): Promise<GTaskList> {
    const {data} = await service.tasks.list({tasklist: taskList.id || '', showHidden: showCompleted})
    let list = data.items || []
    let children: {[key: string]: tasks_v1.Schema$Task[]} = {}
    list = list.filter(task => {
      if (!task.parent) return true

      if (children[task.parent || 'error']) children[task.parent || 'error'].push(task)
      else children[task.parent || 'error'] = [task]
      return false
    })
    list.sort((a, b) => {
      if (a.position && b.position) {
        if (a.position > b.position) return 1
        if (a.position < b.position) return -1
      }
      return 0
    })
    return new GTaskList(
      taskList,
      list.map(task => new GTask(task, children[task.id || 'error']))
    )
  }
}