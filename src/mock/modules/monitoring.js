/*
 * @Author: Wang Jun
 * @Date: 2023-07-29 17:14:05
 * @LastEditTime: 2023-07-30 19:15:35
 * @LastEditors: Wang Jun
 * @Description:
 */
const Mock = require('mockjs')

module.exports = [
    {
        url: 'monitoring/list',
        type: 'get',
        result: ({ query }) => {
            console.log(query)
            const max_size = query.status ? query.status.length * 20 : 100
            const current_page_count = Math.min(max_size - (query.pageIndex - 1) * query.pageSize, query.pageSize)
            const data = Mock.mock({
                [`list|${current_page_count}`]: [{
                    "id|+1": "@uuid",
                    "name|": '@guid',
                    "start_time|": '@date("yyyy-MM-dd HH:mm:ss")',
                    "end_time|": '@date("yyyy-MM-dd HH:mm:ss")',
                    "status|1": query.status ? query.status : ["success", "fail", "running", "timeout"],
                    "total|80-100": 1,
                    "success|1-50": 1,
                    fail: function() {
                        return this.status === 'fail' ? this.total - this.success : 0
                    },
                    "targets|1-6": [{
                        "id|+1": "@uuid",
                        "name|1": ['地面支撑系统', '科学系统', '发布网站', '载荷PI', '规划系统', '数据系统'],
                        "status|1": ["abnormal", "normal"],
                    }]
                }]
            })
            return {
                error: '',
                status: 1,
                data: {
                    list: data.list,
                    total: max_size,
                    pageIndex: +query.pageIndex,
                    pageSize: +query.pageSize
                }
            }
        }
    }, {
        url: 'monitoring/getTargetFileList',
        type: 'get',
        result: ({ query }) => {
            const total = (query.total ? query.total - 0 : null) || Mock.mock({ 'total|20-45': 1 }).total
            const current_page_count = Math.min(total - (query.pageIndex - 1) * query.pageSize, query.pageSize)
            return {
                error: '',
                status: 1,
                data: Mock.mock({
                    [`list|${current_page_count}`]: [{
                        "id|+1": "@uuid",
                        "name|": '@ctitle().cdf',
                        "status|1": ["abnormal", "normal"],
                        "fail_type|1": ['FTP访问异常', '数据库访问异常', '系统超时', '元数据解析异常'],   // 异常类型
                        "fail_info|": "@cparagraph()",   // 异常信息
                        "date_time|": '@date("yyyy-MM-dd HH:mm:ss")',
                    }],
                    total: total - 0
                })
            }
        }
    }
]
