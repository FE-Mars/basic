<!--
 * @Author: Wang Jun
 * @Date: 2024-05-08 17:09:23
 * @LastEditTime: 2024-06-03 16:14:54
 * @LastEditors: Wang Jun
 * @Description: 模式预报数据产品
-->
<template>
    <div class="page-model-forecast">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="数据类型">
                    <el-select v-model="filters.type" clearable placeholder="请选择数据类型">
                        <el-option value="PM" label="磁层顶" />
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
                    <el-button type="primary" @click="onSearch(1)">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </page-header>
        <page-main>
            <div v-if="list.length" class="image-group">
                <div class="gif-wrap">
                    <h2 class="title">动图效果</h2>
                    <MultiImageSwitch :images="list" />
                </div>
                <el-divider direction="vertical" />
                <div class="image-list-wrap">
                    <h2 class="title">静态效果</h2>
                    <div class="image-list">
                        <div v-for="item in list" :key="item.id" class="image-wrap">
                            <el-image :src="item.url" fit="contain" :preview-src-list="urls" />
                            <div class="date">{{ item.date }}</div>
                        </div>
                    </div>
                    <el-pagination
                        background
                        layout="prev, pager, next"
                        :page-size="limit"
                        :total="total"
                        @current-change="onSearch"
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
import MultiImageSwitch from './components/multi_image_switch.vue'
export default {
    name: "ModelForecast",
    components: { MultiImageSwitch },
    data() {
        return {
            pickDate: {},
            filters: this.getDefaultFilters(),
            pickerOptions: {
                disabledDate: this.disabledDate,
                onPick: this.onPickDate
            },
            page: 1,
            limit: 12,
            total: 0,
            list: []
        }
    },
    computed: {
        urls() {
            return this.list.map(item => item.url)
        }
    },
    created() {
        this.onSearch()
    },

    methods: {
        getDefaultFilters() {
            return {
                type: 'PM',
                second_type: '3D',
                times: [
                    dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
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
        onSearch(page = 1) {
            this.page = page
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
                    page: this.page,
                    limit: this.limit
                }
            }).then(({ data: res }) => {
                this.total = res.total
                this.list = res.data.map(item => {
                    return {
                        url: `${process.env.VUE_APP_IMAGE_BASE_URL || ''}${item.PRODUCT_PATH}`,
                        name: item.PRODUCT_NAME,
                        id: item.ID,
                        date: item.PRODUCT_TIME
                    }
                })
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
            overflow: hidden;

            .el-divider {
                height: 100%;
            }
            .title {
                position: relative;
                display: flex;
                align-items: center;
                margin: 0 0 16px;
                z-index: 100;
                font-size: 16px;
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
            .multi-image-switch {
                aspect-ratio: 1;
                height: auto;
                ::v-deep .el-image {
                    height: 100%;
                }
            }
        }
        .image-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
            .date {
                text-align: center;
            }
        }
    }
</style>
