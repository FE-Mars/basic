<!--
 * @Author: Wang Jun
 * @Date: 2023-08-05 15:00:23
 * @LastEditTime: 2023-08-08 10:33:27
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
                    <li class="type-item">全部类型</li>
                    <li v-for="i in 10" :key="i" class="type-item">Lorem, ipsum.</li>
                </ul>
            </el-scrollbar>
        </aside>
        <page-main class="product-list-wrap">
            <page-header title="">
                <el-form slot="content" :inline="true" :model="filters">
                    <el-form-item label="文件名称">
                        <el-input
                            v-model="filters.name"
                            placeholder="文件名称"
                            clearable
                        />
                    </el-form-item>
                    <el-form-item label="载荷类型">
                        <el-select
                            v-model="filters.status"
                            placeholder="载荷类型"
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
                    <el-form-item label="入库时间">
                        <el-date-picker
                            v-model="filters.date"
                            type="datetime"
                            placeholder="入库时间"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">查询</el-button>
                        <el-button @click="onReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </page-header>
            <div class="table-wrap">
                <el-table :data="[]">
                    <el-table-column prop="name" label="文件名称" />
                    <el-table-column prop="load" label="载荷" />
                    <el-table-column prop="type" label="产品类型" />
                    <el-table-column prop="version" label="版本" />
                    <el-table-column prop="createTime" label="入库时间" />
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="text" size="small">下载</el-button>
                            <el-button type="text" size="small" @click="onDelete(scope.row.id)">删除</el-button>
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
                />
            </div>
        </page-main>
    </div>
</template>
<script>
const STATUS = [
    { label: "UVI", value: 0 },
    { label: "LIA", value: 1 },
    { label: "MAG", value: 2 },
]
export default {
    name: "ProductManagement",
    data() {
        return {
            filters: this.getDefaultFilters(),
            status_options: STATUS,
            pageIndex: 1,
            pageSize: 15,
            total: 0,
        }
    },
    methods: {
        getDefaultFilters() {
            return {
                name: "",
                status: '',
                date: null,
            }
        },
        onSearch() {},
        onReset() {},
    }
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
    }
}
</style>
