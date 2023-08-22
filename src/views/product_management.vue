<!--
 * @Author: Wang Jun
 * @Date: 2023-08-05 15:00:23
 * @LastEditTime: 2023-08-22 14:51:23
 * @LastEditors: Wang Jun
 * @Description: 产品管理
-->
<template>
    <div class="page-product-management">
        <aside class="product-type-list">
            <header>
                <h3>产品类型</h3>
            </header>
            <el-scrollbar>
                <ul class="type-list">
                    <li v-for="item in types"
                        :key="item.id"
                        :class="{'type-item': true, 'is-active': filters.level == item.value}"
                        @click="onChangeType(item.value)"
                    >
                        {{ item.label }}
                    </li>
                </ul>
            </el-scrollbar>
        </aside>
        <page-main class="product-list-wrap">
            <page-header title="">
                <el-form slot="content" :inline="true" :model="filters">
                    <el-form-item label="文件名称">
                        <el-input
                            v-model="filters.fileName"
                            placeholder="文件名称"
                            clearable
                        />
                    </el-form-item>
                    <el-form-item label="载荷类型">
                        <el-select
                            v-model="filters.payload"
                            placeholder="载荷类型"
                            clearable
                            style="width: 200px;"
                        >
                            <el-option
                                v-for="option in payload_options"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="入库时间">
                        <el-date-picker
                            v-model="filters.dateTime"
                            type="date"
                            value-format="yyyyMMdd"
                            placeholder="入库时间"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">查询</el-button>
                        <el-button @click="onReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </page-header>
            <div class="list-wrap">
                <div class="list-header">
                    <h3 class="my-title">产品列表</h3>
                    <template v-if="selections && selections.length">
                        <el-button type="danger" @click="onDelete(selections)"><delete-five theme="filled" size="12" /> 删除</el-button>
                    </template>
                </div>
                <el-table :data="list" @selection-change="onSelectionChange">
                    <el-table-column prop="fileName" label="文件名称" width="500px" />
                    <el-table-column prop="payload" label="载荷" />
                    <el-table-column prop="level" label="产品类型" />
                    <el-table-column prop="version" label="版本" />
                    <el-table-column prop="createdTime" label="入库时间" />
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-link :underline="false" type="primary" :href="`${VUE_APP_API_ROOT}/productManage/downLoad/${scope.row.id}`" download target="_blank" rel="下载文件" @click.stop>
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
        </page-main>
    </div>
</template>
<script>
import api from '@/api'
import { DownloadFour, DeleteFive } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
export default {
    name: "ProductManagement",
    components: {
        DownloadFour, DeleteFive
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
            filters: this.getDefaultFilters(),
            payload_options: ["SXI", "MAG", "UVI", "PLM"].map(item => ({ label: item, value: item })),
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            selections: [],
            list: [],
            types: []
        }
    },
    created() {
        this.onSearch()
        this.fetchTypes()
    },
    methods: {
        getDefaultFilters() {
            return {
                fileName: "",
                payload: "",
                dateTime: null,
                level: ""
            }
        },
        fetchTypes() {
            api.get("productManage/productType").then(({ data = [] }) => {
                let result = [{ label: '全部类型', value: '' }]
                data.forEach(item => {
                    result.push({
                        label: item.typeName,
                        value: item.typeName
                    })
                })
                this.types = result
            })
        },
        onChangeType(type) {
            this.filters.level = type
            this.onSearch()
        },
        onSearch(options) {
            const { pageSize = this.pageSize, pageIndex = 1 } = options || {}
            this.pageIndex = pageIndex
            this.pageSize = pageSize
            this.selections = []   // 置空已选
            this.$nextTick(() => {
                api.post("productManage/list", {
                    ...this.filters,
                    pageNum: this.pageIndex,
                    rows: this.pageSize,
                }).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                })
            })
        },
        onReset() {
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.onSearch()
            })
        },
        onSelectionChange(selections) {
            this.selections = selections.map(item => item.id).filter(Boolean)
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
                api.delete('productManage/delete', {
                    data: Array.isArray(ids) ? ids : [ids]
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
        }
    },
}
</script>
<style lang="scss">
.page-product-management {
    display: flex;
    .product-type-list {
        display: flex;
        flex-direction: column;
        width: 258px;
        margin: 20px;
        margin-right: 0;
        background-color: #fff;
        max-height: calc(100vh - 160px);
        header {
            padding: 0 20px;
            border-bottom: 1px solid #ebeef5;
            font-size: 16px;
        }
        .el-scrollbar {
            flex: 1;
        }
        .type-list {
            list-style: none;
            padding: 0;
            .type-item {
                padding: 10px 20px;
                cursor: pointer;
                border-right: 4px solid transparent;
                font-size: 14px;
                &:hover {
                    background-color: #f5f7fa;
                }
                &.is-active {
                    border-color: #409eff;
                    background-color: #f5f7fa;
                }
            }
        }
    }
    .product-list-wrap {
        flex: 1;
        overflow: hidden;
        .header {
            padding: 0 0 10px 0;
            .content {
                margin-top: 0;
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
}
</style>
