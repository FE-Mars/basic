<!--
 * @Author: Wang Jun
 * @Date: 2024-05-09 10:56:11
 * @LastEditTime: 2025-12-22 14:36:13
 * @LastEditors: Wang Jun
 * @Description: 磁层电离层数据产品
-->
<template>
    <div class="page-magnetospheric-ionospheric">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
                <el-form-item label="数据时间">
                    <el-select
                        v-model="filters.times"
                        filterable
                        placeholder="请选择日期"
                        style="width: 200px"
                    >
                        <el-option
                            v-for="item in dateOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch(1)">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </page-header>
        <page-main>
            <template v-if="data">
                <div class="image-group-wrap">
                    <div v-for="group in groups" :key="group.type" class="image-group">
                        <h2 class="title">{{ `${group.name}（${group.type}）` }}</h2>
                        <div class="images">
                            <template v-if="data[group.type]">
                                <MultiImageSwitch :images="data[group.type]" />
                            </template>
                        </div>
                    </div>
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
import api from '@/api/index'
import MultiImageSwitch from './components/multi_image_switch.vue'
export default {
    name: "ModelForecast",
    components: { MultiImageSwitch },
    data() {
        return {
            pickDate: {},
            filters: this.getDefaultFilters(),
            page: 1,
            limit: 64,
            total: 0,
            data: null,
            imageIndex: 0,
            groups: [
                { type: 'Rho', name: '密度' },
                { type: 'Vx', name: '速度' },
                { type: 'Vy', name: '速度' },
                { type: 'Vz', name: '速度' },
                { type: 'Bx', name: '磁场' },
                { type: 'By', name: '磁场' },
                { type: 'Bz', name: '磁场' },
                { type: 'P', name: '压强' },
            ],
            enableDates: []
        }
    },
    computed: {
        dateOptions() {
            return this.enableDates
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
            const date = this.findClosestDate()
            return {
                times: date || ''
            }
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
            return api.get('search/ppmlrf_img/dates').then(({ data: res }) => {
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
            const date = this.filters.times
            const startTime = date ? `${date} 00:00:00` : ''
            const endTime = date ? `${date} 23:59:59` : ''
            api.get('/search/ppmlrf_img/list', {
                params: {
                    startTime,
                    endTime,
                    page: this.page,
                    limit: this.limit
                }
            }).then(({ data: res }) => {
                this.total = res.total
                if (res.data.length) {
                    const result = {}
                    res.data.forEach(item => {
                        result[item.TYPE] = result[item.TYPE] || []
                        result[item.TYPE].push({
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
        .image-group-wrap {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
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
            .image-group {
                background-color: #fff;
                padding: 20px;

                .images {
                    aspect-ratio: 1191/316;
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
    }
</style>
