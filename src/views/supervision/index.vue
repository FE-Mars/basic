<!--
 * @Author: Wang Jun
 * @Date: 2023-07-28 14:59:18
 * @LastEditTime: 2023-09-18 19:01:55
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
            <div v-loading="loading" class="list-wrap">
                <div class="list-header">
                    <h3 class="my-title">任务监督表</h3>
                    <el-upload action="supervisionTask/upload" accept="application/JSON" :limit="1" :show-file-list="false">
                        <el-button type="primary">手动导入<i class="el-icon-upload el-icon--right" /></el-button>
                    </el-upload>
                </div>
                <template v-if="list.length">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item v-for="item in list" :key="item.mainTaskCode" title="一致性 Consistency" :name="item.mainTaskCode">
                            <div slot="title" class="task-table-row">
                                <el-tooltip effect="dark" :content="item.status | statusFilter" placement="top">
                                    <span :class="`status-item bg-status${item.status}`" />
                                </el-tooltip>
                                <el-descriptions :column="6" size="mini">
                                    <el-descriptions-item :label="item.mainTaskCode" label-class-name="task-code" />
                                    <el-descriptions-item label="总数">{{ item.fileCount }}</el-descriptions-item>
                                    <el-descriptions-item label="成功" content-class-name="is-success">{{ item.succeedDistCount }}</el-descriptions-item>
                                    <el-descriptions-item label="失败" content-class-name="is-fail">{{ item.failedDistCount }}</el-descriptions-item>
                                    <el-descriptions-item label="开始时间">{{ item.startTime }}</el-descriptions-item>
                                    <el-descriptions-item label="结束时间">{{ item.endTime }}</el-descriptions-item>
                                </el-descriptions>
                            </div>
                            <SubTaskList v-if="activeNames.includes(item.mainTaskCode)" :key="'sub_task_' + item.mainTaskCode" :main-task-code="item.mainTaskCode" />
                        </el-collapse-item>
                    </el-collapse>
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
                </template>
                <el-empty v-else description="暂无数据" />
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
            loading: false,
            filters: this.getDefaultFilters(),
            status_options: STATUS,
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            list: [],
            activeNames: []
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
            this.loading = true
            this.activeNames = []
            return api.post("/supervisionTask/page/mainTask", {
                data: this.filters,
                pageRequest: {
                    page: this.pageIndex,
                    size: this.pageSize
                }
            }).then(({ res }) => {
                this.list = res.data
                this.total = res.pageInfo.total
            }).finally(() => {
                this.loading = false
            })
        }
    },
}
</script>
<style lang="scss">
    .page-supervision {
        .status-item {
            display: block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 16px;
        }
        .task-table-row {
            display: flex;
            align-items: center;
            .el-descriptions {
                flex: 1;
                .el-descriptions-item {
                    padding-bottom: 0 !important;
                }
            }
            .el-collapse-item {
                .el-collapse-item__header {
                    flex-direction: row-reverse;
                    padding-left: 50px;
                    .sub-task-header {
                        display: flex;
                        align-items: center;
                        padding: 0 24px;
                    }
                }
            }
            .el-descriptions {
                margin-right: 20px;
                .el-descriptions-item {
                    padding-bottom: 0;
                    &:first-child {
                        min-width: 300px;
                    }
                    &:nth-child(2),
                    &:nth-child(3),
                    &:nth-child(4) {
                        width: 120px;
                    }
                    .task-code {
                        font-weight: 500;
                        &::after {
                            display: none;
                        }
                    }
                }
            }
        }
    }
</style>
