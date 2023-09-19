<!--
 * @Author: Wang Jun
 * @Date: 2023-08-06 00:47:15
 * @LastEditTime: 2023-09-19 10:06:06
 * @LastEditors: Wang Jun
 * @Description: 子任务列表
-->
<template>
    <div v-loading="loading" class="sub-task-list">
        <el-collapse-transition>
            <el-collapse v-if="list.length" v-model="activeName" accordion @change="onChange">
                <el-collapse-item v-for="item in list" :key="item.subTaskCode" title="一致性 Consistency" :name="item.subTaskCode">
                    <div slot="title" class="sub-task-header">
                        <el-descriptions :column="6" size="mini">
                            <el-descriptions-item :label="item.subTaskCode" label-class-name="task-code" />
                            <el-descriptions-item label="总数">{{ item.totalCount }}</el-descriptions-item>
                            <el-descriptions-item label="成功数" content-class-name="is-success">{{ item.succeedCount }}</el-descriptions-item>
                            <el-descriptions-item label="失败数" content-class-name="is-fail">{{ item.failedCount }}</el-descriptions-item>
                            <el-descriptions-item label="开始时间">{{ item.startTime }}</el-descriptions-item>
                            <el-descriptions-item label="结束时间">{{ item.endTime }}</el-descriptions-item>
                        </el-descriptions>
                        <el-tooltip :open-delay="300" content="下载任务文件" placement="top">
                            <a :href="`${VUE_APP_API_ROOT}/taskInfo/download/${item.subTaskCode}`" :download="item.subTaskCode + '.json'" target="_blank" rel="下载任务文件" @click.stop>
                                <download-four theme="filled" size="16" :fill="CssVariables.color_success" />
                            </a>
                        </el-tooltip>
                    </div>
                    <ExpandDetail v-if="activeNames.includes(item.subTaskCode)" :sub-task-code="item.subTaskCode" />
                </el-collapse-item>
            </el-collapse>
        </el-collapse-transition>
    </div>
</template>
<script>
import api from '@/api'
import { DownloadFour } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
import ExpandDetail from './expand_detail.vue'

const STATUS = [
    { label: "执行中", value: 1 },
    { label: "执行完成", value: 2 },
    { label: "执行超时", value: 3 },
    { label: "执行异常", value: 4 },
    { label: "执行成功", value: 5 },
    { label: "执行完成部分异常", value: 6 },
]
export default {
    name: "SubTaskList",
    components: {DownloadFour, ExpandDetail},
    filters: {
        statusFilter(status) {
            return STATUS.find(item => item.value === status)?.label || status
        }
    },
    props: {
        mainTaskCode: String,    // 主任务编号
        disabled: Boolean       // 是否禁用
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
            activeName: '',
            activeNames: [],  // 展开过的子任务
            loading: true,
            list: [],
            is_fetched: false
        }
    },
    watch: {
        disabled: {
            immediate: true,
            handler(value) {
                console.log(value)
                if (!value && this.mainTaskCode) {
                    this.getSubTaskList()
                }
            }
        }
    },
    created() {
        console.log('创建')
    },
    methods: {
        // 获取子任务列表
        getSubTaskList() {
            if (this.is_fetched) return
            this.loading = true
            api.get(`/supervisionTask/task/${this.mainTaskCode}`).then(data => {
                this.list = data.res
                this.is_fetched = true
                this.loading = false
            })
        },
        onChange(activeNames) {
            if (!this.activeNames.includes(activeNames)) {
                this.activeNames.push(activeNames)
            }
        }

    },
}
</script>
<style lang="scss">
    .sub-task-list {
        margin: 8px 24px;
        min-height: 50px;
        transition: height 0.3s;
        .el-collapse-item {
            .el-collapse-item__header {
                // flex-direction: row-reverse;
                padding-left: 2px;
                .sub-task-header {
                    display: flex;
                    align-items: center;
                    padding: 0 18px;
                }
                &.is-active {
                    background-color: #ebf5ff;
                }
            }
        }
        .el-descriptions {
            margin-right: 20px;
            .el-descriptions-item {
                padding-bottom: 0;
                &:first-child {
                    min-width: 300px;
                }
                &:nth-child(2),
                &:nth-child(3),
                &:nth-child(4) {
                    width: 120px;
                }
                .task-code {
                    font-weight: 500;
                    &::after {
                        display: none;
                    }
                }
            }
        }
    }
</style>
