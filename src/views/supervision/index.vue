<!--
 * @Author: Wang Jun
 * @Date: 2023-07-28 14:59:18
 * @LastEditTime: 2023-08-22 11:33:18
 * @LastEditors: Wang Jun
 * @Description: 任务监督页面
-->
<template>
    <div class="page-supervision">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="全局任务编号">
                    <el-input
                        v-model="filters.subTaskCode"
                        placeholder="全局任务编号"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="任务执行状态">
                    <el-select
                        v-model="filters.status"
                        placeholder="任务执行状态"
                        clearable
                        style="width: 200px;"
                    >
                        <el-option
                            v-for="option in status_options"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="分发时间">
                    <el-date-picker
                        v-model="filters.startTime"
                        type="date"
                        value-format="yyyy-MM-dd 00:00:00"
                        placeholder="选择日期"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </page-header>
        <page-main>
            <div class="list-wrap">
                <div class="list-header">
                    <h3 class="my-title">任务监督表</h3>
                    <el-upload action="supervisionTask/upload" accept="application/JSON" :limit="1" :show-file-list="false">
                        <el-button type="primary">手动导入<i class="el-icon-upload el-icon--right" /></el-button>
                    </el-upload>
                </div>
                <el-table ref="table" :data="list" row-key="mainTaskCode" @expand-change="onExpandChange" @row-click="onClickRow">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <SubTaskList :key="'sub_task_' + props.row.mainTaskCode" :main-task-code="props.row.mainTaskCode" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="mainTaskCode" label="全局任务编号" width="350px" />
                    <el-table-column prop="fileCount" label="文件总数" />
                    <el-table-column prop="succeedDistCount" label="成功数">
                        <template slot-scope="scope">
                            <span class="is-success">{{ scope.row.succeedDistCount }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="failedDistCount" label="失败数">
                        <template slot-scope="scope">
                            <span class="is-fail">{{ scope.row.failedDistCount }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="任务状态">
                        <template slot-scope="scope">
                            <span :class="`status${scope.row.status}`">{{ scope.row.status | statusFilter }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="startTime" label="开始时间" />
                    <el-table-column prop="endTime" label="结束时间" />
                </el-table>
                <el-pagination
                    background
                    :current-page="pageIndex"
                    :page-sizes="[10, 15, 20, 30]"
                    :page-size="pageSize"
                    layout="prev, pager, next, total, sizes, jumper"
                    :total="total"
                    @size-change="onSearch({ pageSize: $event})"
                    @current-change="onSearch({ pageIndex: $event })"
                />
            </div>
        </page-main>
    </div>
</template>

<script>
import api from '@/api'
import SubTaskList from './components/sub_task_list.vue'
const STATUS = [
    { label: "执行中", value: 1 },
    { label: "执行完成", value: 2 },
    { label: "执行超时", value: 3 },
    { label: "执行异常", value: 4 },
    { label: "执行成功", value: 5 },
    { label: "执行完成部分异常", value: 6 },
]
export default {
    components: {SubTaskList},
    filters: {
        statusFilter(status) {
            return STATUS.find(item => item.value === status)?.label || status
        }
    },
    data() {
        return {
            filters: this.getDefaultFilters(),
            status_options: STATUS,
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            list: [],
            expands: [],
            expanded_rows: {},
            active_name: '',
            caches: {}    // 用于缓存已请求过的任务详情数据
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        getDefaultFilters() {
            return {
                subTaskCode: "",
                status: null,
                startTime: null,
            }
        },
        onReset() {
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.onSearch()
            })
        },
        onSearch(options) {
            const { pageSize = this.pageSize, pageIndex = 1 } = options || {}
            this.pageIndex = pageIndex
            this.pageSize = pageSize
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        fetchData() {
            this.expanded_rows = {}  // 清空已展开的行
            return api.post("/supervisionTask/page/mainTask", {
                data: this.filters,
                pageRequest: {
                    page: this.pageIndex,
                    size: this.pageSize
                }
            }).then(({ res }) => {
                this.list = res.data
                this.total = res.total
            })
        },
        onExpandChange(row) {
            if (this.expands.includes(row.mainTaskCode)) {
                this.expands = []
            } else {
                this.expands = [row.mainTaskCode]
            }
            // this.$set(this.expanded_rows, row.mainTaskCode, true) // 记录已经展开的行
        },
        onClickRow(row) {
            this.$refs.table.toggleRowExpansion(row)
        }
    },
}
</script>
<style lang="scss">
    .page-supervision {
        .el-table__row.expanded {
            background: #f5f7fa;
        }
    }
</style>
