'use strict'

import * as vscode from 'vscode'
import * as path from 'path'
import {tasks_v1, google} from 'googleapis'
import {OAuth2Client} from 'googleapis-common'
import {RootPath} from '../../RootPath'

type GTaskTreeItem = GTask | GTaskList

export default class GTaskTreeProvider implements vscode.TreeDataProvider<GTaskTreeItem> {
  service: tasks_v1.Tasks

  constructor(oAuth2Client: OAuth2Client) {
    this.service = google.tasks({version: 'v1', auth: oAuth2Client})
  }

  getTreeItem(element: GTaskTreeItem): vscode.TreeItem | Promise<vscode.TreeItem> {
    return element
  }

  private _isTaskList(gTaskTreeItem: GTaskTreeItem): gTaskTreeItem is GTaskList {
    return (gTaskTreeItem as GTaskList).taskList !== undefined
  }

  private _isTask(gTaskTreeItem: GTaskTreeItem): gTaskTreeItem is GTask {
    return (gTaskTreeItem as GTask).task !== undefined
  }

  async getChildren(element?: GTaskTreeItem): Promise<GTaskTreeItem[]> {
    if (!element) {
      const {data} = await this.service.tasklists.list()
      const list = data.items || []
      return Promise.all(list.map(taskList => GTaskListBuilder.build(taskList, this.service)))
    } else if (this._isTask(element)) {
      return element.children.map(childTask => new GTask(childTask))
    } else if (this._isTaskList(element)) return element.childTaskList || []

    vscode.window.showErrorMessage('Unknown element in getChildren')
    console.log('Unknown element in getChildren', element)
    return []
  }
}

class GTaskListBuilder {
  private constructor() {}

  static async build(taskList: tasks_v1.Schema$TaskList, service: tasks_v1.Tasks): Promise<GTaskList> {
    const {data} = await service.tasks.list({tasklist: taskList.id || '', showHidden: true})
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

class GTaskList extends vscode.TreeItem {
  constructor(public taskList: tasks_v1.Schema$TaskList, public childTaskList?: GTask[]) {
    super(taskList.title || 'No Title', vscode.TreeItemCollapsibleState.Collapsed)
  }

  get tooltip(): string {
    return this.taskList.title || 'No Title'
  }

  get description(): string {
    return (this.childTaskList || []).length.toString()
  }
}

class GTask extends vscode.TreeItem {
  constructor(public task: tasks_v1.Schema$Task, public children: tasks_v1.Schema$Task[] = []) {
    super(
      task.title || 'No Title Provided',
      children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }

  get tooltip(): string {
    return this.task.notes || this.task.title || 'No Title Provided'
  }

  get description(): string {
    const hasChildren = Boolean(this.children.length)
    const hasNotes = Boolean(this.task.notes)
    return (
      (hasChildren ? this.children.length.toString() : '') +
      (hasChildren && hasNotes ? ' · ' : '') +
      (hasNotes ? this.task.notes : '')
    )
  }

  get iconPath(): string {
    return path.join(RootPath.path, 'resources', this.task.completed ? 'completed.svg' : 'clock.svg')
  }
}
