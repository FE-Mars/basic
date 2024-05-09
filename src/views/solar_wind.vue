<!--
 * @Author: Wang Jun
 * @Date: 2024-05-08 10:44:41
 * @LastEditTime: 2024-05-09 16:41:42
 * @LastEditors: Wang Jun
 * @Description: 太阳风数据
-->
<template>
    <div class="page-solar-wind">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="数据时间">
                    <el-date-picker
                        v-model="filters.times"
                        type="datetimerange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :default-time="['00:00:00', '23:59:59']"
                        @changed="isChangedTime = true"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </page-header>
        <page-main>
            <div ref="myChart" class="chart-wrap" />
        </page-main>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import api from '@/api/index'
import JSONData from '@/assets/太阳风暴.json'
export default {
    name: "Distribution",
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            filters: this.getDefaultFilters(),
            isAutoRefresh: true,
            isChangedTime: false,
            data: JSONData.data
        }
    },
    mounted() {
        this.onSearch()
        this.initChart()
        window.addEventListener('resize', () => {
            this.onResize()
        })
    },
    unmounted() {
        if (this.timer) clearTimeout(this.timer)
        this.myChart && this.myChart.dispose()
        window.removeEventListener('resize')
    },
    methods: {
        getDefaultFilters() {
            return {
                times: [
                    dayjs().startOf('date').format('YYYY-MM-DD HH:mm:ss'),
                    dayjs().format('YYYY-MM-DD HH:mm:ss')
                ]
            }
        },
        onReset() {
            this.isChangedTime = false
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        onSearch() {
            this.isAutoRefresh = !this.isChangedTime   // 手动选择过时间 则不自动刷新了
            this.fetchData()
        },
        fetchData() {
            if (this.timer) clearTimeout(this.timer)   // 取消定时器
            this.selections = []   // 置空已选
            const [ startTime, endTime ] = this.filters.times
            api.get('search/sunwind/', {
                params: {
                    startTime,
                    endTime
                },
            }).then(({ data: res }) => {
                if (this.isAutoRefresh) {
                    this.timer = setTimeout(() => this.fetchData(), 5 * 60 * 1000)   // 5分钟刷新一次
                }
                this.data = res.data
                this.$nextTick(() => {
                    !this.myChart && this.initChart()
                    this.setChatOption()
                })
            })

            // TODO 需要删除测试代码
            !this.myChart && this.initChart()
            this.setChatOption()
        },
        initChart() {
            if (this.myChart) return
            const myChart = echarts.init(this.$refs.myChart)
            this.myChart = myChart
            myChart.setOption({
                animationDuration: 3000,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: false
                    }
                },
                grid: [
                    {
                        left: 60,
                        right: 60,
                        height: 200
                    },
                    {
                        top: 360,
                        left: 60,
                        right: 60,
                        height: 200
                    },
                    {
                        top: 670,
                        left: 60,
                        right: 60,
                        height: 200
                    },
                    {
                        top: 980,
                        left: 60,
                        right: 60,
                        height: 200
                    }
                ],
                dataZoom: [
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100,
                        xAxisIndex: [0, 1]
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 0,
                        end: 100,
                        xAxisIndex: [0, 1]
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 0,
                        end: 100,
                        xAxisIndex: [0, 2]
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 0,
                        end: 100,
                        xAxisIndex: [0, 3]
                    }
                ],
                title: ['Bx By Bz GSM(nT)', 'Density(1/cm³)', 'Speed(km/s)', 'Temperature(°C)'].map((v, i) => {
                    return { left: 'left', text: v, top: [10, 310, 620, 930][i] }
                }),
                xAxis: Array.from({length: 4}).map((v, i) => {
                    console.log(v, i)
                    return {
                        gridIndex: i,
                        type: 'category',
                        boundaryGap: false,
                        axisLine: { onZero: true },
                        data: [],
                    }
                }),
                yAxis: ['Bx By Bz GSM(nT)', 'Density(1/cm³)', 'Speed(km/s)', 'Temperature(°C)'].map((v, i) => {
                    return {
                        gridIndex: i,
                        type: 'value',
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed',
                            }
                        }
                    }
                }),
                series: [
                    {
                        name: 'Bx',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        data: [],
                    },
                    {
                        name: 'By',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        data: [],
                    },
                    {
                        name: 'Bz',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        data: [],
                    },
                    {
                        name: 'Density',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: [],
                    },
                    {
                        name: 'Speed',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        xAxisIndex: 2,
                        yAxisIndex: 2,
                        data: [],
                    },
                    {
                        name: 'Temperature',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        xAxisIndex: 3,
                        yAxisIndex: 3,
                        data: [],
                    }
                ]
            })
        },
        setChatOption() {
            if (!this.myChart) return
            this.myChart.setOption({
                xAxis: [0, 1, 2, 3].map(() => {
                    return { data: this.data.time }
                }),
                series: [
                    { name: 'Bx', data: this.data.bx },
                    { name: 'By', data: this.data.by },
                    { name: 'Bz', data: this.data.bz },
                    { name: 'Density', data: this.data.density },
                    { name: 'Speed', data: this.data.speed },
                    { name: 'Temperature', data: this.data.temp }
                ]
            })
        },
        onResize() {
            this.myChart && this.myChart.resize()
        },
    }
}
</script>
<style lang="scss">
    .page-solar-wind {
        .list-header {
            line-height: 32.5px;
        }
        .el-pagination {
            padding: 0;
            margin-left: -5px;
            margin-top: 20px;
            .el-pagination__jump {
                margin-left: 0;
            }
        }
        .el-table-column--selection {
            .cell {
                text-align: center;
            }
        }
        .el-link {
            margin-right: 12px;
            font-size: 12px;
            &:last-child {
                margin-right: 0;
            }
        }
        .chart-wrap {
            width: 100%;
            height: 1300px;
        }
    }
</style>
