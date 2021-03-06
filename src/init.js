const { prompt, createPromptModule, Separator } = require('inquirer')
const path = require('path')
const chalk = require('chalk')
const { Spinner } = require('cli-spinner')
const {
  cp,
  wt,
  stat,
  getBuffer,
  writeData,
  getFilePaths,
  getLastUpdatedFolder,
  getPathsForSpecificExtensions,
  createSourceFolder
} = require('./fns')

const { convert, checkApi } = require('./convert')

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
  return new Promise(async (resolve, reject) => {
    try {
      const lastUpdatedFolder = getLastUpdatedFolder(baseFolder)
      if (!lastUpdatedFolder) {
        reject(
          new Error(`The working folder, ${baseFolder}, has no subdirectories.`)
        )
      }
      const files = getPathsForSpecificExtensions(
        lastUpdatedFolder,
        msExtensions
      )
      if (files.length === 0) {
        reject(new Error(`The folder, ${lastUpdatedFolder}, has no MS files.`))
      }
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
const setApiKey = async apiKey => {
  var spinner = new Spinner(
    chalk.yellow('%s checking your key, please wait...')
  )
  spinner.setSpinnerString('|/-\\')
  const apiFile = path.join(__dirname, './key.json')
  spinner.start()
  try {
    await checkApi(apiKey)
    await wt(apiFile, JSON.stringify({ apiKey }))
    process.stdout.write('\n ')
    log(
      chalk.blue(`Your API KEY has been saved. Now run

        convert-msdocs
    `)
    )
    process.stdout.write('\n ')
    spinner.stop()
  } catch (error) {
    if (spinner.isSpinning()) {
      spinner.stop()
    }
    process.stdout.write('\n ')
    log(chalk.bold.red(error))
  }
}
const init = async () => {
  var spinner = new Spinner(chalk.yellow('%s converting, please wait...'))
  spinner.setSpinnerString('|/-\\')
  try {
    const apiObject = require(path.join(__dirname, './key.json'))
    if (apiObject.apiKey === '') {
      throw new Error(`Please set up your \`cloudmersive.com\` api key by running 

          convert-msdocs --key <apiKey>`)
    }
    let questions = []
    const pwd = process.cwd() //'D:/Dropbox/KFUPMWork/Teaching/OldSemesters/Sem183/MATH102' //__dirname
    const folders = getFilePaths(pwd, { include_files: false }).map(folder => ({
      name: path.basename(folder),
      value: folder
    }))
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
    if (spinner.isSpinning()) {
      spinner.stop()
    }
    process.stdout.write('\n ')
    log(chalk.bold.red(error))
  }
}

module.exports = { init, setApiKey }
