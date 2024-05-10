<!--
 * @Author: Wang Jun
 * @Date: 2024-05-09 19:40:40
 * @LastEditTime: 2024-05-10 12:00:37
 * @LastEditors: Wang Jun
 * @Description: 图片切换组件
-->
<template>
    <div class="multi-image-switch"
         @click="onHandleClick"
         @mouseenter="trigger === 'hover' ? onHandleSwitch('hover') : {}"
         @mouseleave="trigger === 'hover' ? clear() : {}"
    >
        <el-image
            v-for="(item, index) in images"
            :key="item.id"
            :src="item.url"
            :class="{'active': index === currentIndex}"
            fit="contain"
        >
            <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
            </div>
        </el-image>
        <el-image-viewer v-if="visible" :url-list="previewImages" :initial-index="currentIndex" :on-close="onCloseImgViewer" />
    </div>
</template>
<script>
export default {
    name: "MultiImageSwitch",
    components: {
        'el-image-viewer': () => import('element-ui/packages/image/src/image-viewer')
    },
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
        enablePreview: {    // 是否开启图片预览  仅在 trigger 为 hover 时生效
            type: Boolean,
            default: true
        },
        disabled: Boolean,   // 是否禁用图片切换
        delay: {  // 间隔时间
            type: Number,
            default: 300
        }
    },
    data() {
        return {
            visible: false,   // 是否显示图片预览
            currentIndex: 0,   // 当前显示的图片索引
            timer: null   // 定时器
        }
    },
    computed: {
        previewImages() {
            return this.images.map(item => item.url)
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
        onHandleClick(event) {
            if (this.trigger === 'click') {
                this.onHandleClick('click')
            } else if (this.trigger === 'hover') {
                this.enablePreview && this.onClickImage(event)
            }
        },
        onHandleSwitch(trigger) {
            if (this.trigger === trigger) {
                if (this.timer) {  // 第二次点击取消切换
                    return this.clear()
                }
                !this.disabled && this.switch()
            }
        },
        onClickImage(event) {
            if (this.trigger !== 'hover') return
            console.log('预览')
            this.visible = true
            document.body.style.overflow = 'hidden'
            event.stopPropagation()
        },
        onCloseImgViewer() {
            this.visible = false
            document.body.style.overflow = 'auto'
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
        },
        onPreventDefault(event) {
            event.preventDefault()
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
            .image-slot {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #c0c4cc;
                background-color: #f5f7fa;
            }
        }
    }
</style>
