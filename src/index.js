const { Command, flags } = require('@oclif/command')

const init = require('./init')

class ConvertMsdocsCommand extends Command {
  async run() {
    const { flags } = this.parse(ConvertMsdocsCommand)
    const name = flags.name || 'world'
    init()
  }
}

ConvertMsdocsCommand.description = `Describe the command here
...
Extra documentation goes here
`

ConvertMsdocsCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' }),
  name: flags.string({ char: 'n', description: 'name to print' })
}

module.exports = ConvertMsdocsCommand
