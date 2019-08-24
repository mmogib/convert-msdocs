// (Buffer, String) => String
const CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client')
const CloudmersiveValidateApiClient = require('cloudmersive-validate-api-client')
const defaultClient = CloudmersiveConvertApiClient.ApiClient.instance

const Apikey = defaultClient.authentications['Apikey']
Apikey.apiKey = require('./key.json').apiKey
const apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi()

const checkApi = async key => {
  const defaultValidateClient = CloudmersiveValidateApiClient.ApiClient.instance
  // Configure API key authorization: Apikey
  const ValidateApikey = defaultValidateClient.authentications['Apikey']
  ValidateApikey.apiKey = key

  const ValidateApi = new CloudmersiveValidateApiClient.DomainApi()
  const domain = 'cloudmersive.com' // {String} Domain name to check, for example \"cloudmersive.com\".  The input is a string so be sure to enclose it in double-quotes.

  return new Promise((resolve, reject) => {
    ValidateApi.domainCheck(domain, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })
  })
}

const convert = async (buffer, ext) => {
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

module.exports = {
  convert,
  checkApi
}
