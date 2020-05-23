import TelemetryReporter from 'vscode-extension-telemetry'

const {name, version, aiKey} = require('../package.json') as {
  name: string
  version: string
  aiKey: string
}

export default new TelemetryReporter(name, version, aiKey)
