<!--
 * @Author: Wang Jun
 * @Date: 2024-05-09 19:40:40
 * @LastEditTime: 2025-04-18 16:55:53
 * @LastEditors: Wang Jun
 * @Description: 图片切换组件
-->
<template>
    <div class="multi-image-switch" @click="onClickImage">
        <el-image
            :src="images[images.length - 1].url"
            fit="contain"
        >
            <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
            </div>
        </el-image>
        <image-viewer v-if="visible" :url-list="previewImages" auto-play :interval="delay" :initial-index="currentIndex" :on-close="onCloseImgViewer" />
    </div>
</template>
<script>
export default {
    name: "MultiImageSwitch",
    components: {
        'image-viewer': () => import('./image-viewer')
    },
    props: {
        images: {   // 需要切换的图片数组
            type: Array,
            default: () => []
        },
        disabled: Boolean,   // 是否禁用图片切换
        delay: {  // 间隔时间
            type: Number,
            default: 1000
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
        images: {
            immediate: true,
            handler() {
                this.currentIndex = 0
            }
        },
    },
    unmounted() {
        this.clear()
    },
    methods: {
        onClickImage(event) {
            console.log('预览')
            this.visible = true
            document.body.style.overflow = 'hidden'
            event.stopPropagation()
        },
        onCloseImgViewer() {
            this.visible = false
            document.body.style.overflow = 'auto'
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
