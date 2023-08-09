/*
 * @Author: Wang Jun
 * @Date: 2023-07-30 20:39:25
 * @LastEditTime: 2023-08-09 15:10:36
 * @LastEditors: Wang Jun
 * @Description: 首页
 */
const Mock = require('mockjs')

module.exports = [
    {
        url: 'taskInfoStatistics/taskToday',
        type: 'get',
        result: () => {
            return {
                data: Mock.mock({
                    inTask: {
                        "failedCount|0-1000": 0,
                        "succeedCount|0-1000": 0
                    },
                    outTask: {
                        "failedCount|0-1000": 0,
                        "succeedCount|0-1000": 0
                    }
                }),
                code: 200,
                message: "操作成功"
            }
        }
    },
    {
        url: 'askInfoStatistics/warehouseTaskDays/\\d',
        type: 'get',
        result: option => {
            let array = option.url.split('/')
            let day = array[array.length - 1]
            return {
                message: '操作成功',
                code: 200,
                ...Mock.mock({
                    [`data|${day}`]: [{
                        "date": '@date("yyyy-MM-dd")',
                        "failedCount|0-10": 0,
                        "succeedCount|1-10": 1
                    }]
                })
            }
        }
    },
    {
        url: 'taskInfoStatistics/errorInfo',
        type: 'get',
        result: () => {
            return {
                message: '',
                code: 200,
                ...Mock.mock({
                    [`data|0-30`]: [{
                        "id|+1": "@uuid",
                        "errorName|": 'SMILE_UVI_L1_PHOTON-LIST_20250101T0000_@date("yyyyMMddHHmmss")_V01.txt',
                        "createdTime|": '@date("yyyy-MM-dd HH:mm:ss")',
                        "errorType|1": ['FTP访问异常', '数据库访问异常', '系统超时', '元数据解析异常'],   // 异常类型
                        "errorDescription|": '文件上传失败：550-The process cannot access the file because it is being used by another process. \r\n Win32 error:   The process cannot access the file because it is being used by another process. \r\n Error details: File system returned an error.\r\n550 End\r\n',
                    }]
                })
            }
        }
    }
]
