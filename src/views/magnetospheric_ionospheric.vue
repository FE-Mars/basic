<!--
 * @Author: Wang Jun
 * @Date: 2024-05-09 10:56:11
 * @LastEditTime: 2024-05-09 20:00:57
 * @LastEditors: Wang Jun
 * @Description: 磁层电离层数据产品
-->
<template>
    <div class="page-magnetospheric-ionospheric">
        <page-header title="">
            <el-form slot="content" :inline="true" :model="filters">
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
            <template v-if="data">
                <div class="image-group-wrap">
                    <div v-for="group in groups" :key="group.type" class="image-group">
                        <h2 class="title">{{ `${group.name}（${group.type}）` }}</h2>
                        <div class="images">
                            <template v-if="data[group.type]">
                                <MultiImageSwitch :images="data[group.type]" trigger="click" />
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
            ]
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
        onSearch(page) {
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
            }
        }
    }
</style>
