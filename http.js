const axios = require('axios')

module.exports = (setting) => {
  return axios.create({
    baseURL: 'https://api-release-sit.xlink.cn/v2/',
    ...setting
  })
}
