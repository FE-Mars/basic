/*
 * @Author: Wang Jun
 * @Date: 2023-07-29 17:14:05
 * @LastEditTime: 2023-08-10 14:45:16
 * @LastEditors: Wang Jun
 * @Description:
 */
const Mock = require('mockjs')

module.exports = [
    {
        url: 'supervisionTask/page/mainTask',
        type: 'post',
        result: ({ body }) => {
            const { data, pageRequest } = body
            const max_size = data.status ? data.status.length * 20 : 100
            const current_page_count = Math.min(max_size - (pageRequest.page - 1) * pageRequest.size, pageRequest.size)
            let index = 1
            const mock = Mock.mock({
                [`list|${current_page_count}`]: [{
                    "mainTaskCode": function() {
                        return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0') + '_STOR'
                    },
                    "status|1-6": 1,
                    "succeedDistCount|1-10": 3,
                    "failedDistCount|0-10": 0,
                    "fileCount|1-20": 10,
                    "startTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    "endTime": "@datetime('yyyy-MM-dd HH:mm:ss')"
                }]
            })
            return {
                message: '获取成功',
                code: 200,
                res: {
                    list: mock.list,
                    total: max_size,
                    page: +pageRequest.page,
                    size: +pageRequest.size
                }
            }
        }
    },
    {
        url: 'supervisionTask/task/.+',
        type: 'get',
        result: () => {
            let index = 1
            return {
                message: '获取成功',
                code: 200,
                ...Mock.mock({
                    [`res|1-5`]: [{
                        id: "@uuid",
                        "subTaskCode": function() {
                            return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0') + '_STOR'
                        },
                        "status|1-6": 1,
                        "succeedCount|1-10": 3,
                        "failedCount|0-10": 0,
                        "totalCount|1-20": 10,
                        "startTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                        "endTime": "@datetime('yyyy-MM-dd HH:mm:ss')"
                    }]
                })
            }
        }
    },
    {
        url: 'taskDetails/user/.*',
        type: 'get',
        result: () => {
            return {
                message: '获取成功',
                code: 200,
                ...Mock.mock({
                    [`res|1-6`]: [{
                        "distUserName|1": ["地面支撑系统", "载荷PI", "规划系统", "分发系统", "存储系统", "数据对比系统"],
                        "distUserId": "@uuid",
                    }]
                })
            }
        }
    },
    {
        url: 'taskDetails/page',
        type: 'post',
        result: ({ body }) => {
            const { pageRequest } = body
            const total = (pageRequest.total ? pageRequest.total - 0 : null) || Mock.mock({ 'total|20-45': 1 }).total
            const current_page_count = Math.min(total - (pageRequest.page - 1) * pageRequest.size, pageRequest.size)
            return {
                message: '',
                code: 200,
                res: Mock.mock({
                    [`data|${current_page_count}`]: [{
                        "id|+1": "@uuid",
                        "distFileName|": 'SMILE_UVI_L2_PHOTON-LIST_@datetime("yyyyMMddHHmmss")_V01.txt',
                        "status|1-6": 1,
                        "dataStartTime|": '@date("yyyy-MM-dd HH:mm:ss")',
                    }],
                    pageInfo: {
                        total
                    }
                })
            }
        }
    },
    {
        url: 'errorEvent/searchByCondition',
        type: 'post',
        result: () => {
            return {
                message: '',
                code: 200,
                ...Mock.mock({
                    "res|1-6": [{
                        "id": "@uuid",
                        "fileName": 'SMILE_UVI_L1_PHOTON-LIST_20250101T0000_@date("yyyyMMddHHmmss")_V01.txt',
                        "createdTime|": '@date("yyyy-MM-dd HH:mm:ss")',
                        "type|1": ["文件分发异常", "文件校验异常", "文件入库异常", "FTP异常", "CEP异常", "数据对比异常"],
                        "description": "文件上传失败：550-The process cannot access the file because it is being used by another process. \r\n Win32 error:   The process cannot access the file because it is being used by another process. \r\n Error details: File system returned an error.\r\n550 End\r\n",
                    }]
                })
            }
        }
    }
]
