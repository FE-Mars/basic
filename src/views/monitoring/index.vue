<!--
 * @Author: Wang Jun
 * @Date: 2023-07-28 14:59:18
 * @LastEditTime: 2023-07-30 17:18:16
 * @LastEditors: Wang Jun
 * @Description: 任务监督页面
-->
<template>
    <div class="page-monitoring">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="全局任务编号">
                    <el-input
                        v-model="filters.name"
                        placeholder="全局任务编号"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="任务执行状态">
                    <el-select
                        v-model="filters.status"
                        placeholder="任务执行状态"
                        multiple
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
                        v-model="filters.date"
                        type="datetime"
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
            <div v-if="list.length" class="list-wrap">
                <div class="list-header">
                    <h3 class="my-title">任务监督表</h3>
                    <el-upload :limit="1" :show-file-list="false">
                        <el-button type="primary">手动导入<i class="el-icon-upload el-icon--right" /></el-button>
                    </el-upload>
                </div>
                <el-table :data="list" @expand-change="onExpandChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <ExpandDetail :data="props.row" :disabled="!expanded_rows[props.row.id]" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" label="全局任务编号" width="450px" />
                    <el-table-column prop="total" label="文件总数" />
                    <el-table-column prop="success" label="成功数">
                        <template slot-scope="scope">
                            <span class="is-success">{{ scope.row.success }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="fail" label="失败数">
                        <template slot-scope="scope">
                            <span class="is-fail">{{ scope.row.fail }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="任务状态">
                        <template slot-scope="scope">
                            <span :class="`is-${scope.row.status}`">{{ scope.row.status | statusFilter }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="start_time" label="开始时间" />
                    <el-table-column prop="end_time" label="结束时间" />
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
            <el-empty v-else description="暂无数据" />
        </page-main>
    </div>
</template>

<script>
import api from '@/api'
import ExpandDetail from './components/expand_detail.vue'
const STATUS = [
    { label: "执行中", value: 'running' },
    { label: "执行成功", value: 'success' },
    { label: "执行失败", value: 'fail' },
    { label: "执行超时", value: 'timeout' },
]
export default {
    components: {ExpandDetail},
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
                name: "",
                status: [],
                date: null,
            }
        },
        onReset() {
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.fetchData()
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
            return api.get("/mock/monitoring/list", {
                params: {
                    ...this.filters,
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize
                }
            }).then(({ data }) => {
                console.log(data)
                for (const key in data) {
                    if (Object.hasOwnProperty.call(data, key)) {
                        this[key] = data[key]
                    }
                }
            })
        },
        onExpandChange(row) {
            this.$set(this.expanded_rows, row.id, true) // 记录已经展开的行
        },
    },
}
</script>
