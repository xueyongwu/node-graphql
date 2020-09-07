const { buildSchema } = require('graphql')

module.exports = buildSchema(`
  type ReferenceDevice {
    id: ID
    device_id: ID
    device_mac: String
    exception_enabled: Boolean
    notification_enabled: Boolean
    product_id: ID
    rule_id: ID
  }
  type Rule {
    id: ID
  }
  type Datapoint {

  }
  type Log {
    id: ID
    name: String
    content: String
    param: String
    product_id: String
    reference_device: ReferenceDevice
    rule: Rule
    datapoints: [Datapoint]
  }
  type ExceptionLogData {
    list: [Log]
    count: Int
  }
  input ExceptionLogParams {
    offset: Int
    limit: Int
    projectId: ID
  }
  type Query {
    exceptionLogData(params: ExceptionLogParams): ExceptionLogData
  }
`)