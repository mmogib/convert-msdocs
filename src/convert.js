// (Buffer, String) => String
const CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client')
const defaultClient = CloudmersiveConvertApiClient.ApiClient.instance
const Apikey = defaultClient.authentications['Apikey']
Apikey.apiKey = require('./key.json').apiKey
const apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi()
module.exports = async (buffer, ext) => {
  try {
    switch (ext) {
      case '.docx':
        return new Promise((resolve, reject) => {
          apiInstance.convertDocumentDocxToPdf(buffer, (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })

      case '.xlsx':
        return new Promise((resolve, reject) => {
          apiInstance.convertDocumentPptToPdf(buffer, (err, data) => {
            if (err) {
              return reject(err)
            } else {
              return resolve(data)
            }
          })
        })
      case '.pptx':
        return new Promise((resolve, reject) => {
          apiInstance.convertDocumentXlsxToPdf(buffer, (err, data) => {
            if (err) {
              return reject(err)
            } else {
              return resolve(data)
            }
          })
        })
      default:
        return Promise.reject(new Error('File not supported...'))
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
