const { buildSchema } = require('graphql')

module.exports = buildSchema(`
  type DeviceCondition {
    compare: Int
    param: String
    value: String
  }
  type DeviceException {
    conditions: [DeviceCondition]
  }
  type ReferenceDevice {
    id: ID
    device_id: ID
    device_mac: String
    exception_enabled: Boolean
    exception: DeviceException
    notification_enabled: Boolean
    product_id: ID
    rule_id: ID
  }
  type RuleException {
    tag_id: String
    suggestions: String
  }
  type Rule {
    id: ID
    compare: Int
    content: String
    exception: RuleException
    interval: Int
    name: String
    notification_content: String
    param: String
    product_id: String
    type: Int
    value: String
  }
  type Datapoint {
    id: ID
    field_name: String
    en_field_name: String
    index: Int
    is_collect: Boolean
    is_read: Boolean
    is_system: Boolean
    is_write: Boolean
    max: Int
    min: Int
    name: String
    symbol: String
    type: Int
  }
  type Log {
    id: ID
    status: Int
    product_id: String
    device_name: String
    device_id: Int
    count: Int
    content: String
    new_time: String
    recover_time: String
    start_time: String
    reference_device: ReferenceDevice
    rule: Rule
    datapoints: [Datapoint]
  }
  type ExceptionLogData {
    list: [Log]
    count: Int
  }
  input Order {
    new_time: String
  }
  input ExceptionLogParams {
    offset: Int
    limit: Int
    order: Order
    projectId: ID
  }
  type Query {
    exceptionLogData(params: ExceptionLogParams): ExceptionLogData
  }
`)