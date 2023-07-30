/*
 * @Author: Wang Jun
 * @Date: 2023-07-30 20:39:25
 * @LastEditTime: 2023-07-30 20:57:55
 * @LastEditors: Wang Jun
 * @Description: 首页
 */
const Mock = require('mockjs')

module.exports = [
    {
        url: 'dashboard/abnormal_list',
        type: 'get',
        result: () => {
            return {
                error: '',
                status: 1,
                data: Mock.mock({
                    [`list|0-30`]: [{
                        "id|+1": "@uuid",
                        "name|": '@guid',
                        "date_time|": '@date("yyyy-MM-dd HH:mm:ss")',
                        "fail_type|1": ['FTP访问异常', '数据库访问异常', '系统超时', '元数据解析异常'],   // 异常类型
                    }]
                })
            }
        }
    }
]
