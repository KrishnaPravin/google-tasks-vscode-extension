import * as vscode from 'vscode'
import * as path from 'path'
import {tasks_v1} from 'googleapis'

import {RootPath} from '../../../RootPath'

type NodeType = 'task' | 'taskList' | 'completedTask' | 'completedTaskList'

export class GTask extends vscode.TreeItem {
  contextValue = 'GTask'

  constructor(
    public taskListId: string,
    public task: tasks_v1.Schema$Task,
    public children: tasks_v1.Schema$Task[] = []
  ) {
    super(
      task.title || 'No Title Provided',
      children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    )
  }

  // Overrides
  get tooltip(): string {
    return this.task.notes || this.task.title || 'No Title Provided'
  }

  // Overrides
  get description(): string {
    const hasChildren = Boolean(this.children.length)
    const hasNotes = Boolean(this.task.notes)
    return (
      (hasChildren ? this.children.length.toString() : '') +
      (hasChildren && hasNotes ? ' · ' : '') +
      (hasNotes ? this.task.notes : '')
    )
  }
  // Overrides
  get iconPath(): string {
    return path.join(RootPath.path, 'resources', this.task.completed ? 'completed.svg' : 'clock.svg')
  }
}
