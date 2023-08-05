<template>
    <div class="page-home">
        <page-header title="分发数据监控" />
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
                                <el-col :span="12"><span class="unit">{{ card.unit }}</span></el-col>
                            </el-row>
                            <el-row type="flex">
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
                            </el-row>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <span>月度分发数据趋势</span>
                        </div>
                        <div ref="chart_container" class="chart-container" />
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover">
                        <div slot="header">
                            <span>异常事件</span>
                        </div>
                        <el-table v-if="show_abnormal_list.length" :data="show_abnormal_list" height="400px">
                            <el-table-column prop="name" label="文件名称" show-overflow-tooltip />
                            <el-table-column prop="fail_type" label="异常类型" show-overflow-tooltip width="150px" />
                            <el-table-column prop="date_time" label="时间" width="150px" />
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
            today: {   // 今日数据
                total: 1120,
                total_rate: 12,
                success: 1089,
                success_rate: -8,
                fail: 91,
                fail_rate: 4,
                total_volume: 120,
                total_volume_rate: 0,
            },
            data_cards: [  // 数据卡片
                { prop: 'total', label: '今日分发总数', unit: '个/天', icon: 'Dashboard', icon_color: CssVariables.color_primary },
                { prop: 'success', label: '成功数', unit: '个/天', icon: 'Success', icon_color: CssVariables.color_success },
                { prop: 'fail', label: '失败数', unit: '个/天', icon: 'worried-face', icon_color: CssVariables.color_danger },
                { prop: 'total_volume', label: '今日分发总体量', unit: 'GB/天', icon: 'Change', icon_color: CssVariables.color_primary },
            ],
            abnormal_list: [],  // 异常事件列表
            show_abnormal_list: [],  // 显示的异常事件列表
            current_scroll_index: 9,  // 当前滚动到的异常事件索引
        }
    },
    mounted() {
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
            const my_chart = echarts.init(this.$refs.chart_container)
            // 初始化2条折线
            my_chart.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    top: '6px',
                    right: '4%',
                    data: ['成功数', '失败数']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '成功数',
                        type: 'line',
                        data: [220, 182, 191, 234, 290, 330, 310, 220, 182, 191, 234, 290],
                        itemStyle: {
                            color: CssVariables.color_success
                        }
                    },
                    {
                        name: '失败数',
                        type: 'line',
                        data: [120, 132, 101, 134, 90, 230, 210, 120, 132, 101, 134, 90],
                        itemStyle: {
                            color: CssVariables.color_danger
                        }
                    }
                ]
            })
            this.my_chart = my_chart
        },
        fetchAbnormalList() {
            return api.get("/dashboard/abnormal_list", {
                params: {}
            }).then(({ data }) => {
                console.log(data)
                this.abnormal_list = data.list
                this.show_abnormal_list = this.abnormal_list.slice(0, Math.min(9, this.abnormal_list.length))
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
        .unit {
            display: block;
            text-align: right;
        }
        .value {
            font-weight: 500;
            font-size: 30px;
        }
        .rate-wrap {
            text-align: right;
            .rate {
                display: inline-block;
                padding: 0 10px;
                margin-right: 4px;
                height: 22px;
                line-height: 22px;
                font-size: 14px;
                color: #fff;
                background-color: $color-danger;
                border-radius: 11px;
                &.is-rise {
                    background-color: $color-success;
                }
            }
        }
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
        height: 400px;
    }
}
</style>
