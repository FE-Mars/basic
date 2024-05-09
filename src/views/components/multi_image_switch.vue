<!--
 * @Author: Wang Jun
 * @Date: 2024-05-09 19:40:40
 * @LastEditTime: 2024-05-09 20:06:13
 * @LastEditors: Wang Jun
 * @Description: 图片切换组件
-->
<template>
    <div class="multi-image-switch" @click="onClick">
        <el-image v-for="(item, index) in images" :key="item.id" :src="item.url" :class="{'active': index === currentIndex}" fit="contain" />
    </div>
</template>
<script>
export default {
    name: "MultiImageSwitch",
    props: {
        images: {   // 需要切换的图片数组
            type: Array,
            default: () => []
        },
        trigger: {  // 触发切换的事件
            default: 'auto',
            validator(value) {
                return ['click', 'hover', 'auto'].includes(value)
            }
        },
        disabled: Boolean,   // 是否禁用图片切换
        delay: {  // 间隔时间
            type: Number,
            default: 300
        }
    },
    data() {
        return {
            currentIndex: 0,   // 当前显示的图片索引
            timer: null   // 定时器
        }
    },
    watch: {
        disabled: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.clear()
                } else if (this.trigger === 'auto') {
                    this.switch()
                }
            }
        }
    },
    unmounted() {
        this.clear()
    },
    methods: {
        onClick() {
            if (this.trigger === 'click') {
                if (this.timer) {  // 第二次点击取消切换
                    return this.clear()
                }
                !this.disabled && this.switch()
            }
        },
        switch() {
            if (this.disabled) return
            this.clear()
            if (this.currentIndex < this.images.length - 1) {
                this.currentIndex++
            } else {
                this.currentIndex = 0
            }
            this.timer = setTimeout(() => {
                this.switch()
            }, 300)
        },
        clear() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .multi-image-switch {
        position: relative;
        height: 100%;
        width: 100%;
        .el-image {
            width: 100%;
            display: none;

            &.active {
                display: block;
            }
        }
    }
</style>
