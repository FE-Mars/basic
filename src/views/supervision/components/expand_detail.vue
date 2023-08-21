<!--
 * @Author: Wang Jun
 * @Date: 2023-07-30 11:36:38
 * @LastEditTime: 2023-08-21 16:29:04
 * @LastEditors: Wang Jun
 * @Description:展开详情
-->
<template>
    <div class="expand-detail">
        <div class="file-list-wrap" :style="{'margin-right': is_fold ? 0 : '20px'}">
            <h3 class="my-title">{{ type === 1 ? '入库明细' : '出库明细' }}</h3>
            <el-table :data="detail_list" height="320px" highlight-current-row @current-change="onSelectedFile">
                <el-table-column prop="fileName" label="文件名称" />
                <el-table-column prop="status" label="状态">
                    <template slot-scope="scope">
                        <span :class="`is-${['fail', 'success'][scope.row.status]}`">{{ ['失败', '成功'][scope.row.status] }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createdTime" :label="type == 1 ? '入库时间' : '出库时间'" width="150px" />
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
                            <el-tag type="danger">{{ error.errorType }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="异常详细信息">
                            {{ error.errorDescription }}
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
import { MenuFold, MenuUnfold } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'

// 文件状态  0  失败   1  成功

export default {
    name: "ExpandDetail",
    components: {
        MenuUnfold, MenuFold
    },
    props: {
        taskId: String,
        type: {         // 1 入库 2 出库
            type: Number,
            default: 1
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
            detail_list: [],
            is_fold: false,
            current_file: null,
            error_events: []  // 异常事件
        }
    },
    computed: {
        basePath() {
            return this.type === 1 ? 'warehouseTaskMonitor/warehouse' : 'outWarehouseTaskMonitor/outWarehouse'
        }
    },
    created() {
        this.fetchDetailList()
    },
    methods: {
        fetchDetailList() {   // 查询明细
            api.post(`${this.basePath}Info`, {
                taskId: this.taskId,
                fileStatus: null,
                pageNum: this.pageIndex,
                rows: this.pageSize,
                total: this.total  // 仅用于mock数据

            }).then(({ data }) => {
                this.detail_list = data.list
                this.total = data.total
                this.current_file = null
            })
        },
        fetchErrorEvent(id) {
            if (this.current_file.status) {  // 没有异常 不查询
                this.error_events = []
                return
            }
            api.get(`${this.basePath}Error/${id}`).then(({ data }) => {
                if (id != this.current_file.id) return   // 防止请求过慢时，切换文件，导致数据错乱
                this.error_events = Array.isArray(data) ? data : [data]
            })
        },
        onChangePageIndex(pageIndex) {
            this.pageIndex = pageIndex
            this.$nextTick(() => {
                this.fetchDetailList(this.active_item)
            })
        },
        onClick(id) {
            this.active_item = id
            this.pageIndex = 1
            this.total = 0
            this.$nextTick(() => {
                this.fetchDetailList(id)
            })
        },
        onSelectedFile(row) {
            if (this.current_file?.id === row.id) return
            this.current_file = row
            this.$nextTick(() => {
                this.fetchErrorEvent(this.current_file.id)
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
