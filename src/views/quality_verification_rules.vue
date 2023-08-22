<!--
 * @Author: Wang Jun
 * @Date: 2023-08-11 11:41:58
 * @LastEditTime: 2023-08-22 20:09:11
 * @LastEditors: Wang Jun
 * @Description: 质量校验规则
-->
<template>
    <div class="page-quality_verification_rules">
        <page-header title="">
            <el-form slot="content" :inline="true">
                <el-form-item label="规则名称">
                    <el-input
                        v-model="ruleName"
                        placeholder="规则名称"
                        clearable
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                </el-form-item>
            </el-form>
            <el-button type="primary" @click="dialog_visible = true; edit_id = ''; "><i class="el-icon-plus" /> 新增</el-button>
        </page-header>
        <page-main>
            <el-card v-for="rule in rules" :key="rule.id" shadow="hover">
                <div slot="header" class="card-header">{{ rule.ruleName }}</div>
                <el-descriptions :column="2">
                    <el-descriptions-item label-class-name="my-label" label="载荷">{{ rule.payload }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="my-label" label="级别">{{ rule.level }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="my-label" label="规则描述">{{ rule.ruleDesc }}</el-descriptions-item>
                </el-descriptions>
                <div class="card-footer">
                    <el-link type="primary" @click="dialog_visible = true; edit_id = rule.id;"><edit theme="outline" size="12" :fill="CssVariables.color_primary" />编辑</el-link>
                    <el-link type="primary"><code-one theme="outline" size="12" :fill="CssVariables.color_primary" />代码</el-link>
                    <el-link type="danger" @click="onDelete(rule.id)"><delete theme="outline" size="12" :fill="CssVariables.color_danger" />删除</el-link>
                </div>
            </el-card>
        </page-main>
        <el-dialog
            :title="`${edit_id ? '编辑' : '新增'}质量校验规则`"
            :visible.sync="dialog_visible"
            :before-close="onCloseDialog"
        >
            <span>这是一段信息</span>
            <span slot="footer" class="dialog-footer">
                <el-button v-loading="is_saving" type="primary" @click="onSave">保存</el-button>
                <el-button @click="dialog_visible = false">取消</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { CodeOne, Edit, Delete } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'

const STATUS = [
    { label: "执行中", value: 2 },
    { label: "执行成功", value: 1 },
    { label: "执行异常", value: 3 },
    { label: "执行超时", value: 4 },
]

console.log(STATUS)

export default {
    name: "QualityVerificationRules",
    components: { CodeOne, Edit, Delete },
    data() {
        return {
            CssVariables,
            ruleName: '',
            payload_options: ["SXI", "MAG", "UVI", "PLM"].map(item => ({ label: item, value: item })),
            level_options: ["L0", "L1", "L2", "L3", "L4"].map(item => ({ label: item, value: item })),
            rules: [],
            dialog_visible: false,
            form_model: {
                ruleName: '',
                payload: '',
                ruleDesc: '',
                level: ''
            }
        }
    },
    created() {
        this.onSearch()
    },
    methods: {
        onSearch() {
            this.$api.post('quality-check/search', {
                ruleName: this.ruleName
            }).then(({res}) => {
                this.rules = res
            })
        },
        onDelete(id) {
            this.$confirm('此操作将永久删除任务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$api.delete(`quality-check/${id}`).then(() => {
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
        onSave() {
            let id = this.edit_id
            this.is_saving = true
            this.$api[id ? 'put' : 'post'](`quality-check/${id ? 'update' : 'add' }`, {
                ...this.form_model,
                id
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: `${id ? '编辑' : '新增'}成功!`
                })
                this.dialog_visible = false
                this.onSearch()
            }).catch(() => {
                this.$message({
                    type: 'error',
                    message: `${id ? '编辑' : '新增'}失败`
                })
            }).finally(() => {
                this.is_saving = false
            })
        },
        onCloseDialog() {
            for (const key in this.form_model) {  // 清空数据
                this.form_model[key] = ''
            }
        }
    },
}
</script>
<style lang="scss">
    .page-quality_verification_rules {
        .page-main {
            display: flex;
            flex-wrap: wrap;
            background-color: transparent;
            padding: 0;
            .el-card {
                display: flex;
                flex-direction: column;
                width: 380px;
                margin-right: 20px;
                margin-bottom: 20px;
                font-size: 12px;
                .card-header {
                    font-size: 14px;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .el-descriptions__body {
                    color: rgba(0, 0, 0, 0.85);
                }
                .el-card__body {
                    position: relative;
                    flex: 1;
                    padding-bottom: 50px;
                    overflow: hidden;
                    .card-footer {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        display: flex;
                        align-items: center;
                        justify-content: space-around;
                        height: 40px;
                        width: 100%;
                        border-top: 1px solid rgba(0, 0, 0, 0.06);
                        background-color: rgba(0, 0, 0, 0.06);
                        .el-link {
                            flex: 1;
                            height: 100%;
                            margin-right: 1px;
                            background-color: #fff;
                            &:last-child {
                                margin-right: 0;
                            }
                            .i-icon {
                                margin-right: 4px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
