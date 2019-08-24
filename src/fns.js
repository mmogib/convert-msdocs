const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const rimraf = require('rimraf')

const mkdir = promisify(fs.mkdir)
const rmdir = promisify(rimraf)
const cp = promisify(fs.copyFile)
const wt = async (filepath, data) => {
  return new Promise(async (resolve, reject) => {
    const writer = fs.createWriteStream(filepath)
    writer.write(data, err => {
      if (err) {
        reject(err)
      } else {
        writer.end()
        resolve(true)
      }
    })
  })
}
const stat = promisify(fs.stat)
const getBuffer = async filePath => {
  try {
    const raw = await promisify(fs.readFile)(filePath)
    return Promise.resolve(Buffer.from(raw))
  } catch (error) {
    return Promise.reject(error)
  }
}

const writeData = async (dist, data) => {
  try {
    const wstream = fs.createWriteStream(dist)
    wstream.write(data)
    wstream.end()
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject('error')
  }
}

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePaths = (
  folderPath,
  {
    include_files = true,
    ignore = ['SOURCE', 'node_modules', '.git', '.gitignore']
  }
) => {
  const entryPaths = fs
    .readdirSync(folderPath)
    .filter(entry => !ignore.includes(entry))
    .map(entry => path.join(folderPath, entry))

  const filesOnly = entryPaths.filter(entryPath =>
    fs.statSync(entryPath).isFile()
  )
  const directoriesOnly = entryPaths.filter(
    entryPath => !filesOnly.includes(entryPath)
  )

  return include_files ? [...filesOnly, ...dirFiles] : directoriesOnly
}

/** Retrieve file paths from a given folder and its subfolders. */
const getFilePathsRec = (
  folderPath,
  {
    include_files = true,
    ignore = ['SOURCE', 'node_modules', '.git', '.gitignore']
  }
) => {
  const entryPaths = fs
    .readdirSync(folderPath)
    .filter(entry => !ignore.includes(entry))
    .map(entry => path.join(folderPath, entry))

  const filesOnly = entryPaths.filter(entryPath =>
    fs.statSync(entryPath).isFile()
  )
  const directoriesOnly = entryPaths.filter(
    entryPath => !filesOnly.includes(entryPath)
  )
  const dirFiles = directoriesOnly.reduce(
    (prev, curr) => prev.concat(getFilePathsRec(curr, { include_files })),
    []
  )

  return include_files ? [...filesOnly, ...dirFiles] : directoriesOnly
}

const getPathsForSpecificExtensions = (folderPath, Extensions) => {
  const entryPaths = fs
    .readdirSync(folderPath)
    .map(entry => path.join(folderPath, entry))
  const filePaths = entryPaths
    .filter(
      entryPath =>
        fs.statSync(entryPath).isFile() &&
        Extensions.includes(path.extname(entryPath))
    )
    .map(flPath => ({
      basename: path.basename(flPath, path.extname(flPath)),
      ext: path.extname(flPath),
      path: flPath,
      parent: folderPath
    }))

  return filePaths
}

const getLastUpdatedFolder = folderPath => {
  const entryPaths = fs
    .readdirSync(folderPath)
    .map(entry => path.join(folderPath, entry))
  const folderPaths = entryPaths
    .filter(entryPath => fs.statSync(entryPath).isDirectory())
    .filter(
      folder =>
        path.basename(folder) !== 'natives' && path.basename(folder) !== 'pdf'
    )
    .map(folder => getFileProps(folder))
    .sort((folderA, folderB) => {
      return folderA.updated > folderB.updated ? -1 : 1
    })
    .map(folder => folder.filePath)
  return folderPaths[0]
}
const getFileProps = filePath => {
  const name = path.basename(filePath)
  const ext = path.extname(filePath)
  const size = formatBytes(fs.statSync(filePath).size)
  const updated = new Date(fs.statSync(filePath).mtime).getTime()
  return {
    id: new String(filePath).replace(/\\/g, '-') + '-' + name,
    filePath,
    name,
    ext,
    size,
    updated,
    data: {
      status: 'Not Converted'
    }
  }
}

const folderExists = async folderPath => {
  return new Promise(async resolve => {
    try {
      await stat(folderPath)
      resolve(true)
    } catch (error) {
      resolve(false)
    }
  })
}
const goUpOneDirectory = baseFolder => {
  const [_, ...rest] =
    new String(baseFolder).search(/\\/) > 1
      ? baseFolder.split('\\').reverse()
      : baseFolder.split('/').reverse()

  return baseFolder === './' ? baseFolder : rest.reverse().join('/')
}

const createSourceFolder = async baseFolder => {
  const upOne = goUpOneDirectory(baseFolder)
  const sourceFolder = `${upOne}/SOURCE`
  const nativeFolder = `${sourceFolder}/NATIVE`
  const pdfFolder = `${sourceFolder}/PDF`

  return new Promise(async (resolve, reject) => {
    try {
      const sourceExists = await folderExists(sourceFolder)
      if (!sourceExists) {
        await mkdir(sourceFolder)
      }
      const nativExists = await folderExists(nativeFolder)
      if (!nativExists) {
        await mkdir(nativeFolder)
      }
      const pdfExists = await folderExists(pdfFolder)
      if (!pdfExists) {
        await mkdir(pdfFolder)
      }
      resolve({ nativeFolder, pdfFolder })
    } catch (error) {
      reject(error)
    }
  })
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

module.exports = {
  mkdir,
  rmdir,
  cp,
  wt,
  getBuffer,
  writeData,
  getFilePaths,
  getFilePathsRec,
  getPathsForSpecificExtensions,
  getLastUpdatedFolder,
  getFileProps,
  folderExists,
  goUpOneDirectory,
  createSourceFolder
}
