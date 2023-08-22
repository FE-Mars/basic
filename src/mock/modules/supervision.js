/*
 * @Author: Wang Jun
 * @Date: 2023-07-29 17:14:05
 * @LastEditTime: 2023-08-22 18:13:18
 * @LastEditors: Wang Jun
 * @Description:
 */
const Mock = require('mockjs')

module.exports = [
    //  质量检验任务监管 - 任务列表
    {
        url: 'qualityCheck/list',
        type: 'post',
        result: ({ body }) => {
            const { data, pageRequest } = body
            const max_size = data.status ? data.status.length * 20 : 100
            const current_page_count = Math.min(max_size - (pageRequest.page - 1) * pageRequest.size, pageRequest.size)
            let index = 1
            const mock = Mock.mock({
                [`list|${current_page_count}`]: [{
                    id: '@uuid',
                    "taskId": function() {
                        return Mock.mock("@datetime(yyyyMMdd)") + `${index++}`.padStart(3, '0') + '_STOR'
                    },
                    "taskStatus|1-6": 1,
                    "startTime": "@datetime('yyyy-MM-dd HH:mm:ss')",
                    "endTime": "@datetime('yyyy-MM-dd HH:mm:ss')"
                }]
            })
            return {
                message: '获取成功',
                code: 200,
                res: {
                    data: mock.list,
                    total: max_size,
                    page: +pageRequest.page,
                    size: +pageRequest.size
                }
            }
        }
    },

    // 质量检验规则 - 列表
    {
        url: 'quality-check/search',
        type: 'post',
        result: () => {
            return {
                message: '获取成功',
                code: 200,
                ...Mock.mock({
                    'res|1-10': [
                        {
                            "id": "@uuid",
                            "ruleName": "@csentence",
                            "ruleType": "",
                            "payload|1": ["SXI", "MAG", "UVI", "PLM"],
                            "level|1": ["L0", "L1", "L2", "L3", "L4"],
                            "ruleDesc": "@cparagraph",
                            "ruleCode": "1",
                            "flag": 0
                        }
                    ]
                })
            }
        }
    }
]
