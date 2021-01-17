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
      children.length
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    )
    if (task.parent) this.contextValue += 'SubItem'
  }

  // Overrides
  // @ts-ignore
  get tooltip(): string {
    return this.task.notes || this.task.title || 'No Title Provided'
  }

  // Overrides
  // @ts-ignore
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
  // @ts-ignore
  get iconPath() {
    const icon = `icon-task-${this.task.completed ? 'completed.svg' : 'incomplete.svg'}`
    return {
      light: path.join(RootPath.path, 'resources', `light-${icon}`),
      dark: path.join(RootPath.path, 'resources', `dark-${icon}`),
    }
  }
}
