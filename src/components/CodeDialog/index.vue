<!--
 * @Author: Wang Jun
 * @Date: 2023-08-23 16:03:45
 * @LastEditTime: 2023-08-23 17:11:57
 * @LastEditors: Wang Jun
 * @Description: 代码弹框
-->
<template>
    <el-dialog class="code-dialog" fullscreen :title="title" :visible="visible" @open="onOpenDialog" @close="onCloseDialog">
        <codemirror ref="myCode" v-model="dCode" :options="options" />
        <span slot="footer" class="dialog-footer">
            <el-button :loading="is_saving" type="primary" @click="onSaveCode">保存</el-button>
            <el-button @click="onCloseDialog">取消</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/groovy/groovy.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

export default {
    name: "CodeDialog",
    components: { codemirror },
    props: {
        code: String,
        title: {
            type: String,
            default: '编辑处理脚本'
        },
        visible: Boolean,
        onSave: Function
    },
    data() {
        return {
            dCode: this.code || '',
            options: {
                tabSize: 4,
                mode: 'text/x-groovy',
                theme: 'material',
                lineNumbers: true,
                line: true,
                fontSize: 14
            },
            is_saving: false
        }
    },
    watch: {
        code(val) {
            this.dCode = val || ''
        }
    },
    methods: {
        onOpenDialog() {
            this.$nextTick(() => {
                this.$refs.myCode.refresh()
            })
        },
        onCloseDialog() {
            this.$emit('update:visible', false)
            this.$emit('close', this.dCode)
        },
        onSaveCode() {
            if (this.onSave) {
                this.is_saving = true
                this.onSave(this.dCode).then(() => {
                    this.onCloseDialog()
                }).finally(() => {
                    this.is_saving = false
                })
            }
        }
    },
}
</script>
<style lang="scss">
    .code-dialog {
        .el-dialog {
            display: flex;
            flex-direction: column;
        }
        .el-dialog__body {
            flex: 1;
            padding: 0;
            height: 0;
            overflow: hidden;
            .vue-codemirror {
                height: 100%;
                .CodeMirror {
                    height: 100%;
                }
            }
        }
        .el-dialog__footer {
            padding: 10px 20px;
        }
    }
</style>
