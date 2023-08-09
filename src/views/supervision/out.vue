<!--
 * @Author: Wang Jun
 * @Date: 2023-08-05 14:58:14
 * @LastEditTime: 2023-08-09 20:04:04
 * @LastEditors: Wang Jun
 * @Description: 出库监管
-->
<template>
    <div class="page-supervision">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="全局任务编号">
                    <el-input
                        v-model="filters.taskId"
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
                        v-model="filters.dateTime"
                        type="date"
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
                    <h3 class="my-title">出库任务表</h3>
                    <el-upload action="outWarehouseTaskMonitor/upLoadFile" accept="application/JSON" :limit="1" :show-file-list="false">
                        <el-button type="primary">手动出库<i class="el-icon-upload el-icon--right" /></el-button>
                    </el-upload>
                </div>
                <el-table ref="table" :data="list" row-key="taskId" @expand-change="onExpandChange" @row-click="onClickRow">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <ExpandDetail :type="2" :task-id="props.row.taskId" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="taskId" label="全局任务编号" width="350px" />
                    <el-table-column prop="fileCount" label="文件总数" />
                    <el-table-column prop="succeedCount" label="成功数">
                        <template slot-scope="scope">
                            <span class="is-success">{{ scope.row.succeedCount }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="failedCount" label="失败数">
                        <template slot-scope="scope">
                            <span class="is-fail">{{ scope.row.failedCount }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="任务状态">
                        <template slot-scope="scope">
                            <span :class="`status${scope.row.status}`">{{ scope.row.status | statusFilter }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="startTime" label="开始时间" />
                    <el-table-column prop="endTime" label="结束时间" />
                    <el-table-column>
                        <el-tooltip slot-scope="scope" :open-delay="300" content="下载文件" placement="top">
                            <a :href="`${VUE_APP_API_ROOT}/outWarehouseTaskMonitor/downLoad/${scope.row.taskId}`" download target="_blank" rel="下载任文件" @click.stop>
                                <download-four theme="filled" size="16" :fill="CssVariables.color_success" />
                            </a>
                        </el-tooltip>
                    </el-table-column>
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
import { DownloadFour } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
import ExpandDetail from './components/expand_detail.vue'
const STATUS = [
    { label: "执行中", value: 2 },
    { label: "执行成功", value: 1 },
    { label: "执行异常", value: 3 },
    { label: "执行超时", value: 4 },
]
export default {
    components: { ExpandDetail, DownloadFour },
    filters: {
        statusFilter(status) {
            return STATUS.find(item => item.value === status)?.label || status
        }
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
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
                taskId: "",
                status: null,
                dateTime: null,
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
            return api.post("outWarehouseTaskMonitor/list", {
                ...this.filters,
                pageNum: this.pageIndex,
                rows: this.pageSize
            }).then(({ data }) => {
                this.list = data.list
                this.total = data.total
            })
        },
        onExpandChange(row) {
            if (this.expands.includes(row.taskBelongId)) {
                this.expands = []
            } else {
                this.expands = [row.taskBelongId]
            }
            // this.$set(this.expanded_rows, row.taskBelongId, true) // 记录已经展开的行
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
