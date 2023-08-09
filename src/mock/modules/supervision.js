/*
 * @Author: Wang Jun
 * @Date: 2023-07-29 17:14:05
 * @LastEditTime: 2023-08-09 19:46:35
 * @LastEditors: Wang Jun
 * @Description:
 */
const Mock = require('mockjs')

function getList({ body }) {
    const max_size = body.status ? body.status.length * 20 : 100
    const current_page_count = Math.min(max_size - (body.pageNum - 1) * body.rows, body.rows)
    let index = 1
    const mock = Mock.mock({
        [`list|${current_page_count}`]: [{
            "taskId": function() {
                return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0') + '_STOR'
            },
            "taskBelongId": function() {
                return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0') + '_STOR'
            },
            "status|1-4": 1,
            "succeedCount|1-10": 3,
            "failedCount|0-10": 0,
            "fileCount|1-20": 10,
            "startTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
            "endTime": "@datetime('yyyy-MM-dd HH:mm:ss')"
        }]
    })
    return {
        message: '获取成功',
        code: 200,
        data: {
            list: mock.list,
            total: max_size,
            page: +body.pageNum,
            size: +body.rows
        }
    }
}

module.exports = [
    {
        url: 'warehouseTaskMonitor/belongList',
        type: 'post',
        result: getList
    },
    {
        url: 'warehouseTaskMonitor/list',
        type: 'post',
        result: () => {
            let index = 1, index2 = 1
            return {
                message: '获取成功',
                code: 200,
                data: Mock.mock({
                    [`list|1-5`]: [{
                        id: "@uuid",
                        "taskBelongId": function() {
                            return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0')
                        },
                        "taskId": function() {
                            return Mock.mock("@datetime(yyyyMMdd)") + `${index2++}`.padStart(3, '0') + '_STOR'
                        },
                        "status|1-4": 1,
                        "succeedCount|1-10": 3,
                        "failedCount|0-10": 0,
                        "fileCount|1-20": 10,
                        "startTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                        "endTime": "@datetime('yyyy-MM-dd HH:mm:ss')"
                    }]
                })
            }
        }
    },
    {
        url: '(outW|w)arehouseTaskMonitor/(outW|w)arehouseInfo',
        type: 'post',
        result: ({ body }) => {
            const total = (body.total ? body.total - 0 : null) || Mock.mock({ 'total|20-45': 1 }).total
            const current_page_count = Math.min(total - (body.pageNum - 1) * body.rows, body.rows)
            return {
                message: '',
                code: 200,
                data: Mock.mock({
                    [`list|${current_page_count}`]: [{
                        "id|+1": "@uuid",
                        "fileName|": 'SMILE_UVI_L2_PHOTON-LIST_@datetime("yyyyMMddHHmmss")_V01.txt',
                        "status|0-1": 1,
                        "createdTime|": '@date("yyyy-MM-dd HH:mm:ss")',
                    }],
                    total
                })
            }
        }
    },
    {
        url: '(outW|w)arehouseTaskMonitor/(outW|w)arehouseError/.+',
        type: 'get',
        result: () => {
            return {
                message: '',
                code: 200,
                data: Mock.mock({
                    "id": "@uuid",
                    "errorType|1": ["文件分发异常", "文件校验异常", "文件入库异常", "FTP异常", "CEP异常", "数据对比异常"],
                    "errorDescription": "文件上传失败：550-The process cannot access the file because it is being used by another process. \r\n Win32 error:   The process cannot access the file because it is being used by another process. \r\n Error details: File system returned an error.\r\n550 End\r\n",
                })
            }
        }
    },
    {
        url: 'outWarehouseTaskMonitor/list',
        type: 'post',
        result: getList
    },
]
