<!--
 * @Author: Wang Jun
 * @Date: 2023-08-05 14:58:14
 * @LastEditTime: 2023-08-05 16:15:34
 * @LastEditors: Wang Jun
 * @Description: 出库监管
-->
<template>
    <div class="supervision-page">
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
                <el-form-item label="出库时间">
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
    </div>
</template>
<script>
const STATUS = [
    { label: "执行中", value: 'running' },
    { label: "执行成功", value: 'success' },
    { label: "执行失败", value: 'fail' },
    { label: "执行超时", value: 'timeout' },
]
export default {
    name: "SupervisionOut",
    data() {
        return {
            filters: this.getDefaultFilters(),
            status_options: STATUS,
        }
    },
    methods: {
        getDefaultFilters() {
            return {
                name: "",
                status: [],
                date: null,
            }
        },
    },
}
</script>

