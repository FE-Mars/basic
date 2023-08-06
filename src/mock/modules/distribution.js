/*
 * @Author: Wang Jun
 * @Date: 2023-08-06 15:43:50
 * @LastEditTime: 2023-08-06 16:24:59
 * @LastEditors: Wang Jun
 * @Description:
 */
const Mock = require('mockjs')

module.exports = [
    {
        url: 'taskInfo/page',
        type: 'post',
        result: ({ body }) => {
            const { data, pageRequest } = body
            const max_size = data.status ? data.status.length * 20 : 100
            const current_page_count = Math.min(max_size - (pageRequest.page - 1) * pageRequest.size, pageRequest.size)
            let index = 1
            return {
                message: '获取成功',
                code: 200,
                res: Mock.mock({
                    [`data|${current_page_count}`]: [{
                        "id": "@uuid",
                        "mainTaskCode": `@datetime(yyyyMMddhhmmss)${index++}_STOR`,
                        "subTaskCode": `@datetime(yyyyMMddhhmmss)${index++}_STOR_sub`,
                        "createdTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    }],
                    pageInfo: {
                        total: max_size
                    }
                })
            }
        }
    },
    {
        url: 'distList/page',
        type: 'post',
        result: ({ body }) => {
            const { data, pageRequest } = body
            const max_size = data.status ? data.status.length * 20 : 100
            const current_page_count = Math.min(max_size - (pageRequest.page - 1) * pageRequest.size, pageRequest.size)
            let index = 1
            return {
                message: '获取成功',
                code: 200,
                res: Mock.mock({
                    [`data|${current_page_count}`]: [{
                        "id": "@uuid",
                        "mainTaskCode": `@datetime(yyyyMMddhhmmss)${index++}_STOR`,
                        "subTaskCode": `@datetime(yyyyMMddhhmmss)${index++}_STOR_sub`,
                        "distUserName|1": ["地面支撑系统", "载荷PI", "规划系统", "分发系统", "存储系统", "数据对比系统"],
                        "createdTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    }],
                    pageInfo: {
                        total: max_size
                    }
                })
            }
        }
    }
]
