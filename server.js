const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
// const scheme = require('./schema')
// const createResolver = require('./resolver')
const createSchema = require('./schema')
const app = express()

// 使用cors配置跨域参数，解决跨域问题
app.use(cors())
app.use('/graphql', graphqlHTTP((req, res, gqlParams) => {
  return {
    // schema,
    // rootValue: createResolver(req, res, gqlParams),
    schema: createSchema(req, res, gqlParams),
    graphiql: true
  }
}))
app.listen(8866, () => {
  console.log('http://localhost:8866 服务已启动:D')
})