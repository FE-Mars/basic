<!--
 * @Author: Wang Jun
 * @Date: 2023-08-23 17:56:30
 * @LastEditTime: 2023-08-24 15:21:13
 * @LastEditors: Wang Jun
 * @Description: 报告
-->
<template>
    <div class="page-result">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="文件名称">
                    <el-input
                        v-model="filters.fileName"
                        placeholder="文件名称"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="载荷标识">
                    <el-select v-model="filters.payload" clearable placeholder="载荷标识">
                        <el-option v-for="item in $custom_data.payload_options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="产品级别">
                    <el-select v-model="filters.level" clearable placeholder="产品级别">
                        <el-option v-for="item in $custom_data.level_options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="报告时间">
                    <el-date-picker
                        v-model="filters.reportTime"
                        type="date"
                        value-format="yyyy-MM-dd"
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
                    <h3 class="my-title">检验报告表</h3>
                    <template v-if="selections && selections.length">
                        <el-button type="danger" @click="onDelete(selections)"><delete-five theme="filled" size="12" /> 删除</el-button>
                    </template>
                </div>
                <el-table :data="list" @selection-change="onSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="fileName" label="文件名称" />
                    <el-table-column prop="reportTime" label="对比时间" />
                    <el-table-column label="操作" width="250px">
                        <template slot-scope="scope">
                            <el-link :underline="false" type="primary" :href="`${VUE_APP_API_ROOT}/qualityReport/download/${scope.row.id}`" :download="scope.row.fileName + '.cdf'" target="_blank" rel="下载文件" @click.stop>
                                <download-four theme="filled" size="14" :fill="CssVariables.color_success" /> 下载
                            </el-link>
                            <el-link :underline="false" type="primary" @click="onDelete(scope.row.id)">
                                <delete-five theme="filled" size="14" :fill="CssVariables.color_danger" /> 删除
                            </el-link>
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
import { DownloadFour, DeleteFive } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
import api from '@/api/index'
export default {
    name: "Distribution",
    components: {
        DownloadFour, DeleteFive
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
            filters: this.getDefaultFilters(),
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            list: [],
            selections: []
        }
    },
    created() {
        this.onSearch()
    },
    methods: {
        getDefaultFilters() {
            return {
                fileName: "",
                payload: "",
                level: "",
                reportTime: null
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
        onDelete(ids) {
            if (Array.isArray(ids) && ids.length > 5) {
                return this.$alert('最多只能同时删除5条数据', '提示', {
                    confirmButtonText: '知道了',
                })
            }
            this.$confirm('此操作将永久删除数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                api.delete('qualityReport/delete', {
                    data: Array.isArray(ids) ? ids.join(',') : ids + ''
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    })
                    this.onSearch()
                }).catch(() => {
                    this.$message({
                        type: 'error',
                        message: '删除失败'
                    })
                })
            })
        },
        onSelectionChange(selections) {
            this.selections = selections.map(item => item.id).filter(Boolean)
        },
        fetchData() {
            this.selections = []   // 置空已选
            api.post('qualityReport/page', {
                data: this.filters,
                pageRequest: {
                    page: this.pageIndex,
                    size: this.pageSize
                }

            }).then(({ res }) => {
                this.list = res.data
                this.total = res.pageInfo.total
            })
        }
    }
}
</script>
<style lang="scss">
    .page-result {
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
