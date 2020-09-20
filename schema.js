const { 
  // buildSchema, 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean
} = require('graphql')
const createHTTP = require('./http')

// module.exports = buildSchema(`
//   type DeviceCondition {
//     compare: Int
//     param: String
//     value: String
//   }
//   type DeviceException {
//     conditions: [DeviceCondition]
//   }
//   type ReferenceDevice {
//     id: ID
//     device_id: ID
//     device_mac: String
//     exception_enabled: Boolean
//     exception: DeviceException
//     notification_enabled: Boolean
//     product_id: ID
//     rule_id: ID
//   }
//   type RuleException {
//     tag_id: String
//     suggestions: String
//   }
//   type Rule {
//     id: ID
//     compare: Int
//     content: String
//     exception: RuleException
//     interval: Int
//     name: String
//     notification_content: String
//     param: String
//     product_id: String
//     type: Int
//     value: String
//   }
//   type Datapoint {
//     id: ID
//     field_name: String
//     en_field_name: String
//     index: Int
//     is_collect: Boolean
//     is_read: Boolean
//     is_system: Boolean
//     is_write: Boolean
//     max: Int
//     min: Int
//     name: String
//     symbol: String
//     type: Int
//   }
//   type Log {
//     id: ID
//     status: Int
//     product_id: String
//     device_name: String
//     device_id: Int
//     count: Int
//     content: String
//     new_time: String
//     recover_time: String
//     start_time: String
//     reference_device: ReferenceDevice
//     rule: Rule
//     datapoints: [Datapoint]
//   }
//   type ExceptionLogData {
//     list: [Log]
//     count: Int
//   }
//   input Order {
//     new_time: String
//   }
//   input ExceptionLogParams {
//     offset: Int
//     limit: Int
//     order: Order
//     projectId: ID
//   }
//   type Query {
//     exceptionLogData(params: ExceptionLogParams): ExceptionLogData
//   }
// `)

const DeviceCondition = new GraphQLObjectType({
  name: 'DeviceCondition',
  fields: {
    compare: { type: GraphQLInt },
    param: { type: GraphQLString },
    value: { type: GraphQLString }
  }
})
const DeviceException = new GraphQLObjectType({
  name: 'DeviceException',
  fields: {
    conditions: { type: new GraphQLList(DeviceCondition) }
  }
})
// 规则引用设备数据类型
const ReferenceDevice = new GraphQLObjectType({
  name: 'ReferenceDevice',
  fields: {
    id: { type: GraphQLID },
    device_id: { type: GraphQLID },
    device_mac: { type: GraphQLString },
    exception_enabled: { type: GraphQLBoolean },
    exception: { type: DeviceException },
    notification_enabled: { type: GraphQLBoolean },
    product_id: { type: GraphQLID },
    rule_id: { type: GraphQLID }
  }
})
const RuleException = new GraphQLObjectType({
  name: 'RuleException',
  fields: {
    tag_id: { type: GraphQLString },
    suggestions: { type: GraphQLString }
  }
})
// 报警规则数据类型
const Rule = new GraphQLObjectType({
  name: 'Rule',
  fields: {
    id: { type: GraphQLID },
    compare: { type: GraphQLInt },
    content: { type: GraphQLString },
    exception: { type: RuleException },
    interval: { type: GraphQLInt },
    name: { type: GraphQLString },
    notification_content: { type: GraphQLString },
    param: { type: GraphQLString },
    product_id: { type: GraphQLString },
    type: { type: GraphQLInt },
    value: { type: GraphQLString },
  }
})
// 数据端点数据类型
const Datapoint = new GraphQLObjectType({
  name: 'Datapoint',
  fields: {
    id: { type: GraphQLID },
    field_name: { type: GraphQLString },
    en_field_name: { type: GraphQLString },
    index: { type: GraphQLInt },
    is_collect: { type: GraphQLBoolean },
    is_read: { type: GraphQLBoolean },
    is_system: { type: GraphQLBoolean },
    is_write: { type: GraphQLBoolean },
    max: { type: GraphQLInt },
    min: { type: GraphQLInt },
    name: { type: GraphQLString },
    symbol: { type: GraphQLString },
    type: { type: GraphQLInt },
  }
})
// 日志数据类型
const Log = new GraphQLObjectType({
  name: 'Log',
  fields: {
    id: { type: GraphQLID },
    status: { type: GraphQLInt },
    product_id: { type: GraphQLString },
    device_name: { type: GraphQLString },
    device_id: { type: GraphQLInt },
    count: { type: GraphQLInt },
    content: { type: GraphQLString },
    new_time: { type: GraphQLString },
    recover_time: { type: GraphQLString },
    start_time: { type: GraphQLString },
    reference_device: { type: ReferenceDevice },
    rule: { type: Rule },
    datapoints: { type: new GraphQLList(Datapoint) }
  }
})
// exceptionLogData字段类型
const ExceptionLogData = new GraphQLObjectType({
  name: 'ExceptionLogData',
  fields: {
    list: { type: new GraphQLList(Log) },
    count: { type: GraphQLInt }
  }
})
// exceptionLogData字段传参
const ExceptionLogParams = new GraphQLInputObjectType({
  name: 'ExceptionLogParams',
  fields: {
    offset: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    order: {
      type: new GraphQLInputObjectType({
        name: 'Order',
        fields: {
          new_time: { type: GraphQLString }
        }
      })
    },
    projectId: { type: GraphQLID }
  }
})

module.exports = (req, res, gqlParams) => {
  const commonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Token': req.headers['access-token']
  }
  const http = createHTTP({
    headers: commonHeaders
  })
  const http2 = createHTTP({
    headers: {
      ...commonHeaders,
      'Api-Version': 2
    }
  })

  // 获取报警日志
  const fetchAlertLogs = (projectId, params) =>
    http.post(`realty-master-data/projects/${projectId}/alarm/state-reccords`, params)

  // 获取产品数据端点
  const fetchDataPoints = async productId => {
    try {
      const {
        data: { tml },
      } = await http.get(`things/product/models?product_id=${productId}`)
      let thinkModelMap = {}
      if (tml) {
        tml.attributes.forEach(item => {
          thinkModelMap[item.field] = item.field_name
        })
      }

      const { data } = await http.get(`product/${productId}/datapoints`)
      data.forEach(item => {
        item.field_name = thinkModelMap[item.name] ? thinkModelMap[item.name].cn : item.field_name
      })

      return data
    } catch (error) {
      return error
    }
  }

  // 获取规则引用设备列表
  const fetchRuleDeviceReference = async (ruleIds, deviceIds) => {
    try {
      const {
        data: { list: ruleDeviceList },
      } = await http.post('alert/rules/reference/devices', {
        filter: [
          'device_id',
          'device_name',
          'device_mac',
          'rule_id',
          'exception_enabled',
          'notification_enabled',
          'exception',
          'notification',
        ],
        limit: 999,
        offset: 0,
        query: {
          rule_id: { $in: ruleIds },
          device_id: { $in: deviceIds },
        },
      })

      return ruleDeviceList
    } catch (error) {
      return error
    }
  }

  // 获取告警规则列表
  const fetchAlertRules = async (projectId, ruleIds) => {
    try {
      const params = {
        offset: 0,
        limit: 999,
        filter: ['exception', 'notify_target', 'notification', 'scope'],
        query: {
          id: {
            $in: ruleIds,
          },
        },
      }
      const {
        data: {
          data: { list },
        },
      } = await http2.post(`realty-master-data/projects/${projectId}/alert/rules`, params)

      return list
    } catch (e) {
      return e
    }
  }

  try {
    const scheme = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
          exceptionLogData: {
            type: ExceptionLogData,
            args: {
              params: {
                type: ExceptionLogParams
              }
            },
            resolve: async (source, { params }) => {
              try {
                const { offset, limit, order, projectId } = params
                const { data: { data: { list: alertList, count } } } = await fetchAlertLogs(projectId, {
                  offset, limit, order,
                  filter: [
                    "id",
                    "device_id",
                    "rule_id",
                    "status",
                    "content",
                    "count",
                    "start_time",
                    "new_time",
                    "mac",
                    "notification_content",
                    "content",
                    "tag_id",
                    "notify_type",
                    "alarm_state_id",
                    "product_id",
                    "product_name",
                    "organization_id",
                    "recover_time",
                    "processed_time",
                    "device_name",
                    "processing",
                    "processed"
                  ]
                })
                let productIds = [] // 报警日志里的产品id列表
                let ruleIds = [] // 报警日志的规则id列表
                let deviceIds = [] // 触发生成日志的设备id列表

                alertList.forEach(item => {
                  if (item) {
                    const { product_id, rule_id, device_id } = item
                    if (!productIds.includes(product_id)) {
                      productIds.push(product_id)
                    }
                    if (!ruleIds.includes(rule_id)) {
                      ruleIds.push(rule_id)
                    }
                    if (!deviceIds.includes(device_id)) {
                      deviceIds.push(device_id)
                    }
                  }
                })

                // 产品id与数据端点的映射关系
                let dataPointMap = {}
                const dataPointPromises = productIds.map(id => new Promise(async (resolve, reject) => {
                  try {
                    dataPointMap[id] = await fetchDataPoints(id)
                    resolve()
                  } catch (e) {
                    reject(e)
                  }
                }))
                await Promise.all(dataPointPromises)

                // 获取规则中的设备引用，用于获取设备单独设置的异常条件
                const referenceDevices = await fetchRuleDeviceReference(ruleIds, deviceIds)
                // 获取日志中的告警规则列表
                const alertRules = await fetchAlertRules(projectId, ruleIds)

                alertList.forEach(item => {
                  if (item) {
                    // 获取引用设备，用于获取设备单独设置的异常条件
                    const findReferenceDevice = referenceDevices.find(device => {
                      return device.rule_id === item.rule_id && device.device_id === item.device_id
                    })
                    if (findReferenceDevice) {
                      item['reference_device'] = findReferenceDevice
                    }
                    // 获取告警规则
                    const findRule = alertRules.find(rule => rule.id === item.rule_id)
                    if (findRule) {
                      item['rule'] = findRule
                    }
                    // 获取告警产品数据端点
                    if (dataPointMap[item.product_id]) {
                      item['datapoints'] = dataPointMap[item.product_id]
                    }
                  }
                })

                return {
                  list: alertList,
                  count
                }
              } catch (error) {
                console.log(error)
                return error
              }
            }
          }
        }
      })
    })

    return scheme
  } catch (e) {
    console.log('scheme', e)
    return e
  }
}
