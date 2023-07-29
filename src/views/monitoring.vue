<!--
 * @Author: Wang Jun
 * @Date: 2023-07-28 14:59:18
 * @LastEditTime: 2023-07-28 15:39:43
 * @LastEditors: Wang Jun
 * @Description: 任务监督页面
-->
<template>
    <div>
        <page-main>
            <el-form :inline="true" :model="filters" class="demo-form-inline">
                <el-form-item label="全局任务编号">
                    <el-input
                        v-model="filters.task_name"
                        placeholder="全局任务编号"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="任务执行状态">
                    <el-select
                        v-model="filters.region"
                        placeholder="任务执行状态"
                        clearable
                    >
                        <el-option
                            v-for="option in status_options"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                        v-model="filters.date"
                        type="date"
                        placeholder="选择日期"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                    <el-button @click="onReset">查询</el-button>
                </el-form-item>
            </el-form>
        </page-main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filters: this.getDefaultFilters(),
            status_options: [
                { label: "执行中", value: 0 },
                { label: "执行成功", value: 1 },
                { label: "执行失败", value: 2 },
                { label: "执行超时", value: 3 },
            ],
        };
    },
    methods: {
        getDefaultFilters() {
            return {
                task_name: "",
                status: null,
                date: null,
            };
        },
        onReset() {
            this.filters = this.getDefaultFilters();
        },
        onSearch() {
            // this.$refs.table.reload()
        },
    },
};
</script>
