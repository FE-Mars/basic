<!--
 * @Author: Wang Jun
 * @Date: 2023-07-30 11:36:38
 * @LastEditTime: 2023-08-22 16:09:32
 * @LastEditors: Wang Jun
 * @Description:展开详情
-->
<template>
    <div v-if="!disabled" class="expand-detail">
        <div class="info-wrap" :style="{'margin-right': is_fold ? 0 : '20px'}">
            <h3 class="my-title">校验文件</h3>
            <h3 class="my-title" style="margin-top: 40px;">校验结果</h3>
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
                            <el-tag type="danger">{{ error.eventType }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="异常详细信息">
                            {{ error.eventDetail }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
                <el-empty v-else :image-size="100" description="无异常" />
            </div>
        </transition>
        <el-tooltip v-if="is_fold" :open-delay="300" content="展开异常信息" placement="top">
            <menu-fold class="unfold-abnormal" theme="filled" size="16" style="margin-top: -1px;" @click="is_fold = false" />
        </el-tooltip>
    </div>
</template>
<script>
import api from '@/api'
import {  MenuFold, MenuUnfold } from '@icon-park/vue'
import CssVariables from '@/assets/styles/resources/variables.scss'
export default {
    name: "ExpandDetail",
    components: {
        MenuUnfold, MenuFold
    },
    props: {
        row: Object
    },
    data() {
        return {
            VUE_APP_API_ROOT: process.env.VUE_APP_API_ROOT,
            CssVariables,
            info: null,
            is_fold: false,
            error_events: []  // 异常事件
        }
    },
    created() {
        this.fetchInfo()
        this.fetchErrorEvent()
    },
    methods: {
        isErrorStatus(status) {
            return [3, 4, 6].includes(status)
        },
        fetchInfo() {
            api.get(`qualityCheck/info/${this.row.id}`).then(({ res }) => {
                this.info = res
            })
        },
        fetchErrorEvent() {
            if (!this.isErrorStatus(this.row.taskStatus)) {  // 没有异常 不查询
                this.error_events = []
                return
            }
            api.get(`qualityCheck/errorInfo/${this.row.id}`).then(({ res }) => {
                this.error_events = [res]
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
    .info-wrap {
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
        .el-empty {
            padding: 20px 0;
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
