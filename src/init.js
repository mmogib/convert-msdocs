const { prompt, createPromptModule, Separator } = require('inquirer')
const path = require('path')
const chalk = require('chalk')
const { Spinner } = require('cli-spinner')
const {
  mkdir,
  rmdir,
  cp,
  wt,
  stat,
  getBuffer,
  writeData,
  getFilePathsRec,
  getFileProps,
  getLastUpdatedFolder,
  getPathsForSpecificExtensions,
  folderExists,
  createSourceFolder,
  goUpOneDirectory
} = require('./fns')

const convert = require('./convert')

const log = console.log

const createPdf = async (filePath, pdfFolder, basename, extenstion) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await getBuffer(filePath)
      const data = await convert(buffer, extenstion)
      await writeData(`${pdfFolder}/${basename}.pdf`, data)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

const startConverting = async (baseFolder, msExtensions) => {
  const lastUpdatedFolder = getLastUpdatedFolder(baseFolder)
  const files = getPathsForSpecificExtensions(lastUpdatedFolder, msExtensions)
  return new Promise(async (resolve, reject) => {
    try {
      const { nativeFolder, pdfFolder } = await createSourceFolder(baseFolder)
      await Promise.all(
        files.map(({ path, basename, ext }) =>
          cp(path, `${nativeFolder}/${basename}${ext}`)
        )
      )
      await Promise.all(
        files.map(({ path, basename, ext }) =>
          createPdf(path, pdfFolder, basename, ext)
        )
      )
      resolve(true)
    } catch (error) {
      reject(chalk.red(error))
    }
  })
}

const init = async () => {
  try {
    const apiFile = path.join(__dirname, './key.json')
    const apiKey = require('./key.json').apiKey
    let questions = []
    if (apiKey === '') {
      const { key } = await createPromptModule()([
        {
          type: 'input',
          name: 'key',
          message: 'Please provide your Cloudmersive API KEY.'
        }
      ])
      await wt(apiFile, JSON.stringify({ apiKey: key }))
      throw new Error(
        'Your API KEY has been saved. Please run the program again.'
      )
    }
    const pwd = __dirname //'D:/Dropbox/KFUPMWork/Teaching/OldSemesters/Sem183/MATH102' //__dirname
    const folders = getFilePathsRec(pwd, { include_files: false }).map(
      folder => ({ name: path.basename(folder), value: folder })
    )
    if (folders.length > 0) {
      questions = [
        ...questions,
        {
          type: 'list',
          name: 'base_folder',
          message: 'Choose your working folder?',
          choices: [...folders],
          validate: function(answer) {
            if (answer.length !== 1) {
              return 'You must choose only one.'
            }

            return true
          }
        },
        {
          type: 'checkbox',
          name: 'extenstions',
          message: 'Choose the types of files you want to convert?',
          choices: [
            { name: 'Word', value: '.docx', checked: true },
            { name: 'Excel', value: '.xlsx', checked: true },
            { name: 'PowerPoint', value: '.pptx', checked: true }
          ],
          validate: function(answer) {
            if (answer.length < 1) {
              return 'You must choose at least one.'
            }

            return true
          }
        }
      ]

      const { base_folder: baseFolder, extenstions } = await prompt(questions)

      var spinner = new Spinner(chalk.yellow('converting ... %s please wait'))
      spinner.setSpinnerString('|/-\\')
      spinner.start()
      const { nativeFolder, pdfFolder } = await createSourceFolder(baseFolder)
      await startConverting(baseFolder, extenstions)
      process.stdout.write('\n ')
      spinner.stop()
      log(
        chalk.magenta(
          `Files were: 
            copied to ${nativeFolder}
            converted into ${pdfFolder}.`
        )
      )
    } else {
      throw new Error('Folder is empty..')
    }
  } catch (error) {
    log(chalk.bold.red(error))
  }
}

module.exports = init
