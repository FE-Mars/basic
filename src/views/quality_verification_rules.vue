<!--
 * @Author: Wang Jun
 * @Date: 2023-08-11 11:41:58
 * @LastEditTime: 2023-08-11 14:21:17
 * @LastEditors: Wang Jun
 * @Description: 质量校验规则
-->
<template>
    <div class="page-quality_verification_rules">
        <page-header title="">
            <el-form slot="content" :inline="true">
                <el-form-item label="规则名称">
                    <el-input
                        v-model="keyword"
                        placeholder="规则名称"
                        clearable
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                </el-form-item>
            </el-form>
            <el-button type="primary"><i class="el-icon-plus" /> 新增</el-button>
        </page-header>
    </div>
</template>
<script>
export default {
    name: "QualityVerificationRules",
    data() {
        return {
            keyword: ''
        }
    },
    methods: {
        onSearch() {
        }
    },
}
</script>
