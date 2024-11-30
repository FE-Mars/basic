<!--
 * @Author: Wang Jun
 * @Date: 2024-11-05 14:41:51
 * @LastEditTime: 2024-11-30 16:43:38
 * @LastEditors: Wang Jun
 * @Description: 高级数据
-->
<template>
    <div class="page-magnetospheric-ionospheric">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="数据时间">
                    <el-date-picker
                        v-model="filters.times"
                        type="daterange"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format="yyyy-MM-dd"
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
            <template v-if="data">
                <div class="image-list-wrap">
                    <el-image
                        v-for="(item) in data"
                        :key="item.id"
                        :src="item.url"
                        fit="contain"
                        :preview-src-list="previewSrcList"
                    >
                        <div slot="placeholder" class="image-slot">
                            加载中<span class="dot">...</span>
                        </div>
                    </el-image>
                </div>
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :page-size="limit"
                    :total="total"
                    @current-change="onSearch"
                />
            </template>
            <el-empty v-else description="暂无数据" />
        </page-main>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import api from '@/api/index'
export default {
    name: "ModelForecast",
    components: { },
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
            data: null,
            imageIndex: 0,
            enableDates: []
        }
    },
    computed: {
        previewSrcList() {
            return this.data.map(item => item.url)
        }
    },
    created() {
        this.fetchEnableDates().then(() => {
            this.onReset()
        })
    },

    methods: {
        findClosestDate(dates = this.enableDates) {
            if (!dates || dates.length === 0) return undefined
            const now = new Date()
            return dates.reduce((closestDate, currentDate) => {
                const currentDiff = Math.abs(new Date(currentDate) - now)
                const closestDiff = Math.abs(new Date(closestDate) - now)
                return currentDiff < closestDiff ? currentDate : closestDate
            })
        },
        getDefaultFilters() {
            const date = dayjs(this.findClosestDate())
            return {
                times: [
                    date.hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
                    date.hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss')
                ]
            }
        },
        onPickDate(pick) {
            this.pickDate = pick
        },
        disabledDate(date) {
            if (!this.enableDates.includes(dayjs(date).format('YYYY-MM-DD'))) return true   // 日期不在可选范围内
            const { minDate, maxDate } = this.pickDate
            if (minDate && !maxDate) {
                const diff = Math.abs(dayjs(date).diff(dayjs(minDate), 'day'))   // 时间跨度不能超过7天
                return diff >= 7
            }
            return false
        },
        onReset() {
            this.filters = this.getDefaultFilters()
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        onSearch(page) {
            this.page = page
            this.$nextTick(() => {
                this.fetchData()
            })
        },
        fetchEnableDates() {
            return api.get('search/avd_img/dates').then(({ data: res }) => {
                this.enableDates = res.data || []
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
            api.get('/search/avd_img/list', {
                params: {
                    startTime,
                    endTime,
                    page: this.page,
                    limit: this.limit
                }
            }).then(({ data: res }) => {
                this.total = res.total
                if (res.data.length) {
                    const result = []
                    res.data.forEach(item => {
                        result.push({
                            url: `${process.env.VUE_APP_IMAGE_BASE_URL || ''}${item.PRODUCT_PATH}`,   // 开发环境补充代理路径
                            name: item.PRODUCT_NAME,
                            id: item.ID,
                        })
                    })
                    this.data = result
                } else {
                    this.data = null
                }
                this.imageIndex = 0
            }).finally(() => {
                loading.close()
            })
        }
    }
}
</script>
<style lang="scss" scoped>
    .page-magnetospheric-ionospheric {
        .page-main {
            padding: 0;
            background-color: transparent;
        }
        .image-list-wrap {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
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
            .images {
                ::v-deep .el-image {
                    height: 100%;
                    .el-image__placeholder {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
    }
</style>
