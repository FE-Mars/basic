<!--
 * @Author: Wang Jun
 * @Date: 2023-07-30 11:36:38
 * @LastEditTime: 2023-09-18 18:12:40
 * @LastEditors: Wang Jun
 * @Description:展开详情
-->
<template>
    <div v-if="!disabled" class="expand-detail">
        <div class="targets-wrap">
            <h3 class="my-title">分发用户</h3>
            <div class="target-list">
                <div
                    v-for="user in users"
                    :key="user.distUserId"
                    :class="{ 'target-item': true, 'is-active': user.distUserId === active_item }"
                    @click="onClick(user.distUserId)"
                >
                    <Caution v-if="isErrorStatus(user.status)" class="error-tag" theme="filled" size="12" :fill="CssVariables.color_danger" />
                    <span class="text">{{ user.distUserName }}</span>
                    <el-tooltip :open-delay="300" content="下载清单" placement="top">
                        <a :href="`${VUE_APP_API_ROOT}/distList/download/${user.distUserId}`" :download="user.distUserName + '.json'" target="_blank" rel="下载清单" @click.stop>
                            <download-four theme="filled" size="16" :fill="CssVariables.color_success" />
                        </a>
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="file-list-wrap" :style="{'margin-right': is_fold ? 0 : '20px'}">
            <h3 class="my-title">分发明细</h3>
            <el-table :data="file_list" height="320px" highlight-current-row @current-change="onSelectedFile">
                <el-table-column prop="distFileName">
                    <template slot="header">
                        <span class="padding-left">文件名称</span>
                    </template>
                    <template slot-scope="props">
                        <div class="padding-left">
                            <Caution v-if="isErrorStatus(props.row.status)" class="error-tag" theme="filled" size="12" :fill="CssVariables.color_danger" />
                            <span>{{ props.row.distFileName }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="dataStartTime" label="时间" width="150px" />
            </el-table>
            <el-pagination
                background
                :current-page="pageIndex"
                :page-size="10"
                layout="prev, pager, next"
                :total="total"
                @current-change="onChangePageIndex"
            />
        </div>
        <transition name="el-fade-in-linear">
            <div v-show="!is_fold" class="abnormal-wrap">
                <h3 class="my-title">
                    <span class="text">异常事件</span>
                    <el-tooltip :open-delay="300" content="收起异常信息" placement="top">
                        <menu-unfold theme="filled" size="16" @click="is_fold = true" />
                    </el-tooltip>
                </h3>
                <div v-if="error_events.length" class="error-event-scroll-wrap">
                    <el-descriptions v-for="error in error_events" :key="error.id" :column="1" direction="vertical">
                        <el-descriptions-item label="异常事件类型">
                            <el-tag type="danger">{{ error.type }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="异常详细信息">
                            {{ error.description }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
                <el-empty v-else description="无异常" />
            </div>
        </transition>
        <el-tooltip v-if="is_fold" :open-delay="300" content="展开异常信息" placement="top">
            <menu-fold class="unfold-abnormal" theme="filled" size="16" style="margin-top: -1px;" @click="is_fold = false" />
        </el-tooltip>
    </div>
</template>
<script>
import api from '@/api'
import { Caution, DownloadFour, MenuFold, MenuUnfold } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
export default {
    name: "ExpandDetail",
    components: {
        Caution, DownloadFour, MenuUnfold, MenuFold
    },
    props: {
        subTaskCode: String,
        data: {
            type: Object,
            default: () => ({})
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
            active_item: '',
            users: [],
            pageSize: 10,
            pageIndex: 1,
            total: 0,
            file_list: [],
            is_fold: true,
            current_file: null,
            error_events: []  // 异常事件
        }
    },
    created() {
        this.fetchTaskUsers()
    },
    methods: {
        isErrorStatus(status) {
            return [3, 4, 6].includes(status)
        },
        fetchTaskUsers() {
            api.get(`taskDetails/user/${this.subTaskCode}`).then(data => {
                this.users = data.res
                if (data.res.length > 0) {
                    this.active_item = this.users[0].distUserId
                    this.file_list = []
                    this.fetchTargetFileList(this.active_item)
                }
            })
        },
        fetchTargetFileList(id) {
            api.post("taskDetails/page", {
                data: {
                    subTaskCode: this.subTaskCode,
                    distUserId: id
                },
                pageRequest: {
                    page: this.pageIndex,
                    size: this.pageSize,
                    total: this.total  // 仅用于mock数据
                }
            }).then(({ res }) => {
                if (this.active_item !== id) return
                this.file_list = res.data
                this.total = res.pageInfo.total
                this.current_file = null
                this.is_fold = true
                this.error_events = []
            })
        },
        fetchErrorEvent() {
            if (!this.isErrorStatus(this.current_file.status)) {  // 没有异常 不查询
                this.error_events = []
                this.is_fold = true
                return
            }
            api.post('errorEvent/searchByCondition', {
                taskDetailsId: this.current_file.id,
                limit: 10
            }).then(data => {
                this.error_events = data.res
                this.is_fold = !(data.res.length > 0)
            })
        },
        onChangePageIndex(pageIndex) {
            this.pageIndex = pageIndex
            this.$nextTick(() => {
                this.fetchTargetFileList(this.active_item)
            })
        },
        onClick(id) {
            this.active_item = id
            this.pageIndex = 1
            this.total = 0
            this.$nextTick(() => {
                this.fetchTargetFileList(id)
            })
        },
        onSelectedFile(row) {
            if (this.current_file?.id === row.id) return
            this.current_file = row
            this.$nextTick(() => {
                this.fetchErrorEvent()
            })
        }
    },
}
</script>
<style lang="scss">
.expand-detail {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 20px;
    background-color: #fafafa;
    box-sizing: border-box;
    overflow: hidden;
    .my-title {
        margin-bottom: 16px;
        .text {
            flex: 1;
        }
    }
    .i-icon-caution {
        margin-right: 4px;
    }
    .target-list {
        width: 300px;
        margin-left: 0;
        border: 1px solid rgba(5, 5, 5, 0.06);
        border-radius: 8px;
        .target-item {
            position: relative;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            border-block-end: 1px solid rgba(5, 5, 5, 0.06);
            color: rgba(0, 0, 0, 0.88);
            background-color: #fff;
            font-size: 14px;
            box-sizing: border-box;
            &:last-child {
                border-block-end: none;
            }
            &.is-active {
                background-color: #f5f7fa;
            }
            .text {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .i-icon-download-four {
                cursor: pointer;
            }
            .i-icon-right {
                position: absolute;
                right: 0;
            }
        }
    }
    .file-list-wrap {
        flex: 1;
        margin: 0 20px;
        overflow: hidden;
    }
    .abnormal-wrap {
        width: 280px;
        .el-descriptions {
            margin-right: 0;
            .el-descriptions__body {
                padding: 16px;
                .el-descriptions-item__label {
                    font-size: 14px;
                    font-weight: 600;
                }
            }
        }
        .error-event-scroll-wrap {
            max-height: 368px;
            overflow: auto;
        }
    }
    .unfold-abnormal {
        position: absolute;
        right: 20px;
        top: 23px;
    }
    .padding-left {
        position: relative;
        padding-left: 16px;
        .error-tag {
            left: 0;
        }
    }
    .error-tag {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translate(0, -50%);
    }
}
</style>
