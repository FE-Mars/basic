<!--
 * @Author: Wang Jun
 * @Date: 2023-08-11 11:41:58
 * @LastEditTime: 2023-08-23 17:10:06
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
                    <el-link type="primary" @click="onEdit(rule)"><edit theme="outline" size="12" :fill="CssVariables.color_primary" />编辑</el-link>
                    <el-link type="primary" @click="onEditCode(rule)"><code-one theme="outline" size="12" :fill="CssVariables.color_primary" />代码</el-link>
                    <el-link type="danger" @click="onDelete(rule.id)"><delete theme="outline" size="12" :fill="CssVariables.color_danger" />删除</el-link>
                </div>
            </el-card>
        </page-main>
        <el-dialog
            :title="`${edit_id ? '编辑' : '新增'}质量校验规则`"
            :close-on-click-modal="false"
            :visible.sync="dialog_visible"
            :before-close="onCloseDialog"
        >
            <el-form ref="form" :model="form_model" :rules="form_rules" label-width="80px">
                <el-form-item prop="ruleName" label="规则名称">
                    <el-input v-model="form_model.ruleName" clearable />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item prop="payload" label="载荷标识">
                            <el-select v-model="form_model.payload" clearable placeholder="请选择载荷标识">
                                <el-option v-for="item in payload_options" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="level" label="产品级别">
                            <el-select v-model="form_model.level" clearable placeholder="请选择产品级别">
                                <el-option v-for="item in level_options" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item prop="ruleDesc" label="规则描述">
                    <el-input v-model="form_model.ruleDesc" :rows="4" clearable type="textarea" />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button :loading="is_saving" type="primary" @click="onSaveBasicInfo">保存</el-button>
                <el-button @click="onCloseDialog">取消</el-button>
            </span>
        </el-dialog>
        <CodeDialog :code="code" :visible.sync="code_visible" :on-save="onSaveCode" @close="onCloseCodeDialog" />
    </div>
</template>
<script>
import { CodeOne, Edit, Delete } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
import CodeDialog from '@/components/CodeDialog/index.vue'

const STATUS = [
    { label: "执行中", value: 2 },
    { label: "执行成功", value: 1 },
    { label: "执行异常", value: 3 },
    { label: "执行超时", value: 4 },
]

console.log(STATUS)

export default {
    name: "QualityVerificationRules",
    components: { CodeOne, Edit, Delete, CodeDialog },
    data() {
        return {
            CssVariables,
            ruleName: '',
            payload_options: ["SXI", "MAG", "UVI", "PLM"].map(item => ({ label: item, value: item })),
            level_options: ["L0", "L1", "L2", "L3", "L4"].map(item => ({ label: item, value: item })),
            rules: [],
            dialog_visible: false,
            edit_id: '',
            is_saving: false,
            form_model: {
                ruleName: '',
                payload: '',
                ruleDesc: '',
                level: ''
            },
            form_rules: {
                ruleName: [
                    { required: true, message: '请输入规则名称', trigger: 'blur' },
                    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
                ],
                payload: [
                    { required: true, message: '请选择载荷标识' },
                ]
            },
            code_visible: false,
            code: '',
        }
    },
    created() {
        this.onSearch()
    },
    methods: {
        onSearch() {
            this.$api.post('qualityCheck/search/1', {
                ruleName: this.ruleName
            }).then(({res}) => {
                this.rules = res
            })
        },
        onEdit(rule) {
            this.edit_id = rule.id
            this.dialog_visible = true
            this.form_model = {
                ruleName: rule.ruleName,
                payload: rule.payload,
                ruleDesc: rule.ruleDesc,
                level: rule.level
            }
        },
        onEditCode(rule) {
            this.code_visible = true
            this.edit_id = rule.id
            this.code = rule.ruleCode
        },
        onDelete(id) {
            this.$confirm('此操作将永久删除任务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$api.delete(`qualityCheck/${id}`).then(() => {
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
        onSaveBasicInfo() {
            this.$refs.form.validate().then(() => {
                this.is_saving = true
                this.onSave({
                    ...this.form_model,
                    id: this.edit_id
                }).then(() => {
                    this.onCloseDialog()
                }).finally(() => {
                    this.is_saving = false
                })
            })
        },
        onSaveCode(code) {
            return this.onSave({
                id: this.edit_id,
                ruleCode: code
            })
        },
        onSave(data) {
            return this.$api[data.id ? 'put' : 'post'](`qualityCheck/${data.id ? 'update' : 'add' }`, {
                ...data,
                ruleType: 1,    // 1 质量校验规则
            }).then(() => {
                this.$message({
                    type: 'success',
                    message: `${data.id ? '编辑' : '新增'}成功!`
                })
                this.onSearch()
            })
        },
        onCloseDialog() {
            this.dialog_visible = false
            for (const key in this.form_model) {  // 清空数据
                this.form_model[key] = ''
            }
            this.$refs.form.clearValidate() // 清空验证is_saving
            this.edit_id = ''
        },
        onCloseCodeDialog() {
            this.code_visible = false
            this.edit_id = ''
            this.code = ''
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
        .el-form-item {
            margin-bottom: 24px;
        }
    }
</style>
