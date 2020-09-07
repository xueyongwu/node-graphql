const createHTTP = require('./http')

module.exports = (req, res, gqlParams) => {
  const http = createHTTP({
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Token': req.headers['access-token']
    }
  })

  // 获取报警日志
  const fetchAlertLogs = (projectId, params) => 
    http.post(`realty-master-data/projects/${projectId}/alert/rules`, params)

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
      } = await getAlertRuleList(projectId, params)
      
      return list
    } catch (e) {
      return e
    }
  }

  return {
    exceptionLogData: async ({ params }) => {
      const { offset, limit, projectId } = params
      const { data: { data: { list: alertList, count } } } = await fetchAlertLogs({
        offset, limit
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
      productIds.forEach(async id => {
        if (!dataPointMap[id]) {
          const { data: datapointList } = await fetchDataPoints(id)
          dataPointMap[id] = datapointList
        }
      })

      // 获取规则中的设备引用，用于获取设备单独设置的异常条件
      const referenceDevices = await fetchRuleDeviceReference(ruleIds, deviceIds)
      // 获取日志中的告警规则列表
      const alertRules = await fetchAlertRules(projectId, ruleIds)

      alertList.forEach(item => {
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
      })

      return {
        list: alertList, 
        count
      }
    }
  }
}