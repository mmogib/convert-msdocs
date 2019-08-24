const { Command, flags } = require('@oclif/command')

const { init, setApiKey } = require('./init')

class ConvertMsdocsCommand extends Command {
  async run() {
    const { flags } = this.parse(ConvertMsdocsCommand)
    const key = flags.key || null
    if (key !== null) {
      setApiKey(key)
    } else {
      init()
    }
  }
}

ConvertMsdocsCommand.usage = ' [options]'
ConvertMsdocsCommand.description = `
This simple commands does the following:
  (*) lists the folders found in the current folder.
  (*) finds the last updated folder inside the selected folder
  (*) creates a folder named SOURCE with two subfolders: NATIVE and PDF
      at the same level as the selected working folder.
  (*) copies the (ms files) in the last updated folder to NATIVE and
  (*) converts these files and puts them in PDF

The conversion is done using the service from cloudmersive.com. You need, therefore, to create
an api key and set it with the command

    convert-msdocs --key <APIKEY>

then run

    convert-msdocs

`

ConvertMsdocsCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI versions
  help: flags.help({ char: 'h' }),
  key: flags.string({
    char: 'k',
    description: 'set the cloudmersive.com api key'
  })
}

module.exports = ConvertMsdocsCommand
