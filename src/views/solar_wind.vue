<!--
 * @Author: Wang Jun
 * @Date: 2024-05-08 10:44:41
 * @LastEditTime: 2024-05-08 17:06:38
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
            111
        </page-main>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import api from '@/api/index'
export default {
    name: "Distribution",
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            filters: this.getDefaultFilters(),
            isAutoRefresh: true,
            isChangedTime: false
        }
    },
    created() {
        this.onSearch()
    },
    unmounted() {
        if (this.timer) clearTimeout(this.timer)
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
            console.log(startTime, endTime)
            api.get('search/sunwind/', {
                params: {
                    startTime,
                    endTime
                },
            }).then(({ res }) => {
                console.log(res)
                if (this.isAutoRefresh) {
                    this.timer = setTimeout(() => this.fetchData(), 5 * 60 * 1000)   // 5分钟刷新一次
                }
            })
        }
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
    }
</style>
