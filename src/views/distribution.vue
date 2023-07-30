<!--
 * @Author: Wang Jun
 * @Date: 2023-07-30 16:16:15
 * @LastEditTime: 2023-07-30 17:18:07
 * @LastEditors: Wang Jun
 * @Description: 任务分发
-->
<template>
    <div class="page-distribution">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="全局任务编号">
                    <el-input
                        v-model="filters.name"
                        placeholder="全局任务编号"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="任务时间">
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
            <div class="list-wrap">
                <div class="list-header">
                    <h3 class="my-title">任务分发表</h3>
                    <template v-if="selections && selections.length">
                        <el-button type="primary"><refresh-one theme="filled" size="12" /> 重新分发</el-button>
                        <el-button type="danger"><delete-five theme="filled" size="12" /> 删除</el-button>
                    </template>
                </div>
                <el-table :data="list" @selection-change="onSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="name" label="全局任务编号" />
                    <el-table-column prop="date_time" label="任务时间" />
                    <el-table-column label="操作" width="250px">
                        <template slot-scope="scope">
                            <el-button type="text" @click="onDownload(scope.$index, scope.row)">
                                <download-four theme="filled" size="14" :fill="CssVariables.color_success" /> 下载
                            </el-button>
                            <el-button type="text" @click="onRedistribution(scope.$index, scope.row)">
                                <refresh-one theme="filled" size="14" :fill="CssVariables.color_primary" /> 重分
                            </el-button>
                            <el-button type="text" @click="onDelete(scope.$index, scope.row)">
                                <delete-five theme="filled" size="14" :fill="CssVariables.color_danger" /> 删除
                            </el-button>
                        </template>
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
            <!-- <el-empty v-else description="暂无数据" /> -->
        </page-main>
    </div>
</template>
<script>
import { DownloadFour, DeleteFive, RefreshOne } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
export default {
    name: "Distribution",
    components: {
        DownloadFour, DeleteFive, RefreshOne
    },
    data() {
        return {
            CssVariables,
            filters: this.getDefaultFilters(),
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            list: [{ name: 'hello.sdfs', date_time: '2023-07-30 18:49:56' }, { name: 'hello.sdfs', date_time: '2023-07-30 18:49:56' }],
            selections: []
        }
    },
    methods: {
        getDefaultFilters() {
            return {
                name: "",
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
        onDownload() {
            this.$message({
                type: 'success',
                message: '已开始下载!'
            })
        },
        onRedistribution() {
            this.$confirm('此操作将重新分发该任务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: '重新分发成功!'
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消重新分发'
                })
            })
        },
        onDelete() {
            this.$confirm('此操作将永久删除该任务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        },
        onSelectionChange(selections) {
            this.selections = selections
        },
        fetchData() {

        }
    }
}
</script>
<style lang="scss">
    .page-distribution {
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
    }
</style>
