<template>
    <div class="page-home">
        <page-header title="出入库数据监控" />
        <page-main>
            <el-row :gutter="20">
                <el-col v-for="card in data_cards" :key="card.prop" :span="6">
                    <el-card shadow="hover">
                        <div class="data-card">
                            <el-row type="flex" justify="space-between">
                                <el-col :span="12">
                                    <component :is="card.icon" theme="filled" size="32" :fill="card.icon_color" />
                                    <div class="label">{{ card.label }}</div>
                                </el-col>
                                <el-col :span="12" class="value-wrap"><span class="value">{{ today[card.prop] || 0 }}<span class="unit">{{ card.unit }}</span></span></el-col>
                            </el-row>
                            <!-- <el-row type="flex">
                                <el-col :span="12">
                                    <span class="value">{{ today[card.prop] || 0 }}</span>
                                </el-col>
                                <el-col :span="12" class="rate-wrap">
                                    <template v-if="today[`${card.prop}_rate`] >= 0">
                                        <span class="rate is-rise">+{{ today[`${card.prop}_rate`] }}%</span>
                                        <arrow-up theme="filled" size="14" :fill="CssVariables.color_success" />
                                    </template>
                                    <template v-else>
                                        <span class="rate ">{{ today[`${card.prop}_rate`] }}%</span>
                                        <arrow-down theme="filled" size="14" :fill="CssVariables.color_danger" />
                                    </template>
                                </el-col>
                            </el-row> -->
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <h3 class="my-title">近{{ day_count }}天入库统计</h3>
                        </div>
                        <div ref="chart_container" class="chart-container" />
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <h3 class="my-title">异常事件</h3>
                        </div>
                        <el-table v-if="show_abnormal_list.length" :data="show_abnormal_list" height="410px">
                            <el-table-column prop="errorName" label="文件名称" show-overflow-tooltip />
                            <el-table-column prop="errorType" label="异常类型" show-overflow-tooltip width="150px">
                                <template slot-scope="scope">
                                    <el-tooltip effect="light" placement="top">
                                        <div slot="content" style="max-width: 400px;" v-html="scope.row.errorDescription" />
                                        <el-tag type="danger">
                                            {{ scope.row.errorType }}
                                        </el-tag>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createdTime" label="时间" width="150px" />
                        </el-table>
                        <el-empty v-else description="暂无异常事件" style="height: 400px;" />
                    </el-card>
                </el-col>
            </el-row>
        </page-main>
    </div>
</template>

<script>
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { Dashboard, Success, WorriedFace, Change, ArrowUp, ArrowDown } from '@icon-park/vue'
import api from '@/api'
import CssVariables from '@/assets/styles/resources/variables.scss'
export default {
    components: {
        Dashboard, Success, WorriedFace, Change, ArrowUp, ArrowDown
    },
    data() {
        return {
            CssVariables,
            day_count: 7,  // 显示几天的数据
            error_event_limit: 100,  // 异常事件最多显示多少条
            today: {},  // 今日数据
            abnormal_list: [],  // 异常事件列表
            show_abnormal_list: [],  // 显示的异常事件列表
            current_scroll_index: 9,  // 当前滚动到的异常事件索引
            data_cards: [  // 数据卡片
                { prop: 'inTask.succeedCount', label: '入库成功数', unit: '个/天', icon: 'Success', icon_color: CssVariables.color_success },
                { prop: 'inTask.failedCount', label: '入库失败数', unit: '个/天', icon: 'worried-face', icon_color: CssVariables.color_danger },
                { prop: 'outTask.succeedCount', label: '出库成功数', unit: '个/天', icon: 'Success', icon_color: CssVariables.color_success },
                { prop: 'outTask.failedCount', label: '出库失败数', unit: '个/天', icon: 'worried-face', icon_color: CssVariables.color_danger },
            ]
        }
    },
    mounted() {
        this.fetchStatisticsToday()
        this.fetchStatisticsRecentForDays()
        this.fetchAbnormalList()
        this.initChart()
        window.addEventListener('resize', this.resizeChart)
    },
    beforeDestroy() {
        this.timer && clearTimeout(this.timer)
        window.removeEventListener('resize', this.resizeChart)
        this.my_chart?.dispose()
    },
    methods: {
        initChart() {
            const my_chart = echarts.init(this.$refs.chart_container), category = []
            for (let i = 6; i >= 0; i--) {
                category.push(dayjs().subtract(i, 'day').format('MM-DD'))
            }
            // 初始化
            my_chart.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    top: '6px',
                    right: '4%',
                    data: ['成功', '失败']
                },
                grid: {
                    left: '2%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    // boundaryGap: false,
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        id: 'success',
                        name: '成功数',
                        type: 'bar',
                        data: [],
                        itemStyle: {
                            color: CssVariables.color_success
                        }
                    },
                    {
                        id: 'failed',
                        name: '失败数',
                        type: 'bar',
                        data: [],
                        itemStyle: {
                            color: CssVariables.color_danger
                        }
                    }
                ]
            })
            this.my_chart = my_chart
        },
        fetchStatisticsToday() {
            return api.get("/taskInfoStatistics/taskToday").then(({data}) => {
                const { inTask, outTask } = data, result = {}
                for (let key in inTask) {
                    result[`inTask.${key}`] = inTask[key] || 0
                }
                for (let key in outTask) {
                    result[`outTask.${key}`] = outTask[key] || 0
                }
                this.today = result
            })
        },
        fetchStatisticsRecentForDays() {   // 查询最近几天的数据
            return api.get(`taskInfoStatistics/warehouseTaskDays/${this.day_count}`).then(({data}) => {
                const category = [], success = [], failed = []
                data.forEach(item => {
                    category.push(item.date)
                    success.push(item.succeedCount)
                    failed.push(item.failedCount)
                })
                this.my_chart.setOption({
                    xAxis: {
                        data: category
                    },
                    series: [
                        {
                            id: 'success',
                            data: success
                        },
                        {
                            id: 'failed',
                            data: failed
                        }
                    ]
                })
            })
        },
        fetchAbnormalList() {
            this.fetchAbnormalListTimer && clearTimeout(this.fetchAbnormalListTimer)  // 清除定时器
            return api.get("taskInfoStatistics/errorInfo").then(({ data }) => {
                console.log(data)
                this.abnormal_list = data.map(item => {
                    item.errorDescription = item.errorDescription.split('\n').map(line => {
                        return `<p style="margin: 4px 0;">${line}</p>`
                    }).join('')
                    console.log(item.errorDescription)
                    return item
                })
                this.current_scroll_index = 9
                this.show_abnormal_list = this.abnormal_list.slice(0, Math.min(9, this.abnormal_list.length))
                this.fetchAbnormalListTimer = setTimeout(this.fetchAbnormalList, 1000 * 3 * this.error_event_limit)  // 等所有数据轮询完了 再重新请求
                this.$nextTick(() => {
                    this.scrollAbnormalList()
                })
            })
        },
        scrollAbnormalList() {
            if (this.abnormal_list.length <= 9) {
                return
            }
            this.show_abnormal_list.shift()
            this.show_abnormal_list.push(this.abnormal_list[this.current_scroll_index++])
            if (this.current_scroll_index >= this.abnormal_list.length) {
                this.current_scroll_index = 0
            }
            this.timer = setTimeout(() => {
                this.scrollAbnormalList()
            }, 3000)
        },
        resizeChart() {
            if (this.my_chart) {
                this.my_chart.resize()
            }
        }
    },
}
</script>
<style lang="scss">
.page-home {
    .page-main {
        padding: 0;
        background-color: transparent;
    }
    .el-row {
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .data-card {
        .el-row--flex {
            margin-bottom: 12px;
            align-items: center;
            &:last-child {
                margin-bottom: 0;
            }
        }
        .label,
        .unit {
            margin-top: 8px;
            font-size: 14px;
            color: #909399;
        }
        // .unit {
        //     display: block;
        //     text-align: right;
        // }
        .value {
            font-weight: 500;
            font-size: 30px;
        }
        .value-wrap {
            display: flex;
            justify-content: flex-end;
            span {
                line-height: 1;
                vertical-align: middle;
            }
            .unit {
                margin-left: 4px;
            }
        }
        // .rate-wrap {
        //     text-align: right;
        //     .rate {
        //         display: inline-block;
        //         padding: 0 10px;
        //         margin-right: 4px;
        //         height: 22px;
        //         line-height: 22px;
        //         font-size: 14px;
        //         color: #fff;
        //         background-color: $color-danger;
        //         border-radius: 11px;
        //         &.is-rise {
        //             background-color: $color-success;
        //         }
        //     }
        // }
    }
    .el-statistic {
        .title {
            font-size: 16px;
        }
        .con {
            display: flex;
            align-items: baseline;
            margin-top: 20px;
            .number {
                font-size: 28px;
            }
            .suffix {
                .unit {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }
    .chart-container {
        height: 410px;
    }
}
</style>
