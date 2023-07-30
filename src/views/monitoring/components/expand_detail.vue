<!--
 * @Author: Wang Jun
 * @Date: 2023-07-30 11:36:38
 * @LastEditTime: 2023-07-30 16:06:04
 * @LastEditors: Wang Jun
 * @Description:展开详情
-->
<template>
    <div v-if="!disabled" class="expand-detail">
        <div class="targets-wrap">
            <h3 class="my-title">分发用户</h3>
            <div class="target-list">
                <div
                    v-for="target in data.targets"
                    :key="target.id"
                    :class="{ 'target-item': true, 'is-active': target.id === active_item }"
                    @click="onClick(target.id)"
                >
                    <Caution v-if="target.status == 'abnormal'" theme="filled" size="14" :fill="CssVariables.color_danger" />
                    <span class="text">{{ target.name }}</span>
                    <el-tooltip :open-delay="300" content="下载分发文件" placement="top">
                        <download-four theme="filled" size="16" :fill="CssVariables.color_success" />
                    </el-tooltip>
                </div>
            </div>
        </div>
        <div class="file-list-wrap" :style="{'margin-right': is_fold ? 0 : '20px'}">
            <h3 class="my-title">分发明细</h3>
            <el-table :data="file_list" height="320px" highlight-current-row @current-change="onSelectedFile">
                <el-table-column prop="name" label="文件名称">
                    <template slot-scope="props">
                        <Caution v-if="props.row.status == 'abnormal'" theme="filled" size="14" :fill="CssVariables.color_danger" />
                        <span>{{ props.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="date_time" label="时间" width="150px" />
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
                <el-descriptions v-if="abnormal" :column="1" direction="vertical">
                    <el-descriptions-item label="异常事件类型">
                        <el-tag type="danger">{{ abnormal.fail_type }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="异常详细信息">
                        {{ abnormal.fail_info }}
                    </el-descriptions-item>
                </el-descriptions>
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
            CssVariables,
            active_item: this.data.targets[0].id,
            caches: {},
            pageSize: 10,
            pageIndex: 1,
            total: 0,
            file_list: [],
            is_fold: false,
            current_file: null
        }
    },
    computed: {
        abnormal() {
            if (this.current_file?.status !== 'abnormal') return null
            return this.current_file
        }
    },
    created() {
        this.fetchTargetFileList(this.active_item)
    },
    methods: {
        fetchTargetFileList(id) {
            api.get("/mock/monitoring/getTargetFileList", {
                params: {
                    id,
                    pageIndex: this.pageIndex,
                    pageSize: this.pageSize,
                    total: this.total  // 仅用于mock数据
                }
            }).then(({ data }) => {
                if (this.active_item !== id) return
                this.file_list = data.list
                this.total = data.total
                this.current_file = null
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
        .el-descriptions .el-descriptions__body {
            padding: 16px;
            .el-descriptions-item__label {
                font-size: 14px;
                font-weight: 600;
            }
        }
    }
    .unfold-abnormal {
        position: absolute;
        right: 20px;
        top: 23px;
    }
}
</style>
