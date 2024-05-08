<!--
 * @Author: Wang Jun
 * @Date: 2024-05-08 17:09:23
 * @LastEditTime: 2024-05-08 19:58:03
 * @LastEditors: Wang Jun
 * @Description: 模式预报数据产品
-->
<template>
    <div class="page-model-forecast">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="数据类型">
                    <el-select v-model="filters.type" placeholder="请选择数据类型">
                        <el-option value="PM" label="磁顶层" />
                        <el-option value="EAR" label="极尖区" />
                    </el-select>
                </el-form-item>
                <el-form-item label="可视化维度">
                    <el-select v-model="filters.second_type">
                        <el-option value="3D" label="3D" />
                        <el-option value="2D" label="2D" />
                    </el-select>
                </el-form-item>
                <el-form-item label="数据时间">
                    <el-date-picker
                        v-model="filters.times"
                        type="datetimerange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :default-time="['00:00:00', '23:59:59']"
                        :picker-options="pickerOptions"
                        @changed="isChangedTime = true"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </page-header>
        <page-main>
            <div v-if="list.length" class="image-group">
                <div class="gif-wrap">
                    <h2 class="title">动图效果</h2>
                    <el-image v-for="(item, index) in list" :key="'gif_' + item.id" :src="item.url" :class="{'active': index === imageIndex}" fit="contain" />
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="image-list-wrap">
                    <h2 class="title">静态效果</h2>
                    <div class="image-list">
                        <el-image v-for="item in list" :key="item.id" :src="item.url" fit="contain" :preview-src-list="urls" />
                    </div>
                    <el-pagination
                        background
                        layout="prev, pager, next"
                        :total="total"
                    />
                </div>
            </div>
            <el-empty v-else description="暂无数据" />
        </page-main>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import api from '@/api/index'
export default {
    name: "ModelForecast",
    data() {
        return {
            pickDate: {},
            filters: this.getDefaultFilters(),
            pickerOptions: {
                disabledDate: this.disabledDate,
                onPick: this.onPickDate
            },
            page: 1,
            limit: 20,
            total: 0,
            list: [],
            imageIndex: 0,
        }
    },
    computed: {
        urls() {
            return this.list.map(item => item.url)
        }
    },
    created() {
        console.log(process.env.NODE_ENV)
        this.onSearch()
    },

    methods: {
        getDefaultFilters() {
            return {
                type: '',
                second_type: '3D',
                times: [
                    dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    dayjs().format('YYYY-MM-DD HH:mm:ss')
                ]
            }
        },
        onPickDate(pick) {
            this.pickDate = pick
        },
        disabledDate(date) {
            const { minDate, maxDate } = this.pickDate
            if (minDate && !maxDate) {
                const diff = Math.abs(dayjs(date).diff(dayjs(minDate), 'day'))   // 时间跨度不能超过7天
                return diff > 7
            }
            return false
        },
        onReset() {
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        onSearch() {
            this.page = 1
            this.filters.page = 1
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        fetchData() {
            const loading = this.$loading({
                lock: true,
                text: '加载中...',
                spinner: 'el-icon-loading',
                background: 'transparent'
            })
            const [ startTime, endTime ] = this.filters.times
            api.get('/search/pm_img/list', {
                params: {
                    type: this.filters.type || null,
                    second_type: this.filters.second_type,
                    startTime,
                    endTime,
                    page: 1,
                    limit: 20
                }
            }).then(({ data: res }) => {
                this.total = res.total
                this.list = res.data.map(item => {
                    return {
                        url: `${process.env.VUE_APP_IMAGE_BASE_URL || ''}${item.PRODUCT_PATH}`,
                        name: item.PRODUCT_NAME,
                        id: item.ID,
                    }
                })
                this.imageIndex = 0
            }).finally(() => {
                loading.close()
            })
        }
    }
}
</script>
<style lang="scss" scoped>
    .page-model-forecast {
        .image-group {
            position: relative;
            display: grid;
            grid-template-columns: 40% max-content auto;
            column-gap: 8px;

            .el-divider {
                height: 100%;
            }
            .title {
                position: relative;
                display: flex;
                align-items: center;
                margin: 0 0 16px;
                z-index: 100;
                &::before {
                    content: '';
                    display: block;
                    width: 4px;
                    height: 20px;
                    margin-right: 8px;
                    background-color: #409EFF;
                    border-radius: 3px;
                }

            }
        }
        .gif-wrap {
            position: relative;
            aspect-ratio: 1;
            .el-image {
                position: absolute;
                top: 33px;
                width: 100%;
                opacity: 0;
                transition: opacity 0.1s ease-in-out;

                &.active {
                    opacity: 1;
                }
            }
        }
        .image-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
    }
</style>
