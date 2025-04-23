<template>
    <transition name="viewer-fade">
        <div ref="el-image-viewer__wrapper" tabindex="-1" class="el-image-viewer__wrapper" :style="{ 'z-index': viewerZIndex }">
            <div class="el-image-viewer__mask" @click.self="handleMaskClick" />
            <!-- CLOSE -->
            <span class="el-image-viewer__btn el-image-viewer__close" @click="hide">
                <i class="el-icon-close" />
            </span>
            <!-- ARROW -->
            <template v-if="!isSingle">
                <span
                    class="el-image-viewer__btn el-image-viewer__prev"
                    :class="{ 'is-disabled': !infinite && isFirst }"
                    @click="prev"
                >
                    <i class="el-icon-arrow-left" />
                </span>
                <span
                    class="el-image-viewer__btn el-image-viewer__next"
                    :class="{ 'is-disabled': !infinite && isLast }"
                    @click="next"
                >
                    <i class="el-icon-arrow-right" />
                </span>
            </template>
            <!-- ACTIONS -->
            <div class="el-image-viewer__btn el-image-viewer__actions">
                <div class="el-image-viewer__actions__inner">
                    <i class="el-icon-zoom-out" @click="handleActions('zoomOut')" />
                    <i class="el-icon-zoom-in" @click="handleActions('zoomIn')" />
                    <i class="el-image-viewer__actions__divider" />
                    <i :class="mode.icon" @click="toggleMode" />
                    <i class="el-image-viewer__actions__divider" />
                    <i class="el-icon-refresh-left" @click="handleActions('anticlocelise')" />
                    <i class="el-icon-refresh-right" @click="handleActions('clocelise')" />
                </div>
            </div>
            <!-- CANVAS -->
            <div class="el-image-viewer__canvas">
                <template v-for="(url, i) in urlList">
                    <img
                        v-if="i === index"
                        ref="img"
                        :key="url"
                        class="el-image-viewer__img"
                        :src="currentImg"
                        :style="imgStyle"
                        @load="handleImgLoad"
                        @error="handleImgError"
                        @mousedown="handleMouseDown"
                    >
                </template>
                <!-- 添加预加载图片 -->
                <div style="display: none;">
                    <img v-for="(url, i) in preloadUrls" :key="`preload-${i}`" :src="url">
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { on, off } from 'element-ui/src/utils/dom'
import { rafThrottle, isFirefox } from 'element-ui/src/utils/util'
import { PopupManager } from 'element-ui/src/utils/popup'

const Mode = {
    CONTAIN: {
        name: 'contain',
        icon: 'el-icon-full-screen'
    },
    ORIGINAL: {
        name: 'original',
        icon: 'el-icon-c-scale-to-original'
    }
}

const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel'

export default {
    name: 'ElImageViewer',

    props: {
        urlList: {
            type: Array,
            default: () => []
        },
        zIndex: {
            type: Number,
            default: 2000
        },
        onSwitch: {
            type: Function,
            default: () => {}
        },
        onClose: {
            type: Function,
            default: () => {}
        },
        initialIndex: {
            type: Number,
            default: 0
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        maskClosable: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 3000
        }
    },

    data() {
        return {
            index: this.initialIndex,
            isShow: false,
            infinite: true,
            loading: false,
            mode: Mode.CONTAIN,
            transform: {
                scale: 1,
                deg: 0,
                offsetX: 0,
                offsetY: 0,
                enableTransition: false
            },
            autoPlayTimer: null,
            isAutoPlaying: false,
            autoTriggered: false,
            preloadUrls: [] // 用于预加载的URL列表
        }
    },
    computed: {
        isSingle() {
            return this.urlList.length <= 1
        },
        isFirst() {
            return this.index === 0
        },
        isLast() {
            return this.index === this.urlList.length - 1
        },
        currentImg() {
            return this.urlList[this.index]
        },
        imgStyle() {
            const { scale, deg, offsetX, offsetY, enableTransition } = this.transform
            const style = {
                transform: `scale(${scale}) rotate(${deg}deg)`,
                'margin-left': `${offsetX}px`,
                'margin-top': `${offsetY}px`,
                'opacity': this.loading ? 0 : 1, // 添加透明度过渡
                'transition': enableTransition ? 'transform .3s, opacity 0.3s' : 'opacity 0.3s' // 合并transition属性
            }
            if (this.mode === Mode.CONTAIN) {
                style.maxWidth = style.maxHeight = '100%'
            }
            return style
        },
        viewerZIndex() {
            const nextZIndex = PopupManager.nextZIndex()
            return this.zIndex > nextZIndex ? this.zIndex : nextZIndex
        }
    },
    watch: {
        index: {
            handler: function(val) {
                this.reset()
                this.onSwitch(val)
                this.preloadNextImages() // 预加载下一张图片
            }
        },
        currentImg() {
            this.$nextTick(() => {
                const $img = this.$refs.img[0]
                if (!$img.complete) {
                    this.loading = true
                }
            })
        },
        urlList: {
            handler: function() {
                this.preloadNextImages() // URL列表变化时预加载
            },
            immediate: true
        }
    },
    mounted() {
        this.deviceSupportInstall()
        if (this.appendToBody) {
            document.body.appendChild(this.$el)
        }
        // add tabindex then wrapper can be focusable via Javascript
        // focus wrapper so arrow key can't cause inner scroll behavior underneath
        this.$refs['el-image-viewer__wrapper'].focus()

        // 预加载图片
        this.preloadNextImages()

        // 自动开始播放
        this.startAutoPlay()
    },
    destroyed() {
        // if appendToBody is true, remove DOM node after destroy
        if (this.appendToBody && this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el)
        }

        // 清除自动播放定时器
        this.stopAutoPlay()
    },
    methods: {
        hide() {
            this.deviceSupportUninstall()
            this.stopAutoPlay()
            this.onClose()
        },
        deviceSupportInstall() {
            this._keyDownHandler = e => {
                e.stopPropagation()
                const keyCode = e.keyCode
                switch (keyCode) {
                    // ESC
                    case 27:
                        this.hide()
                        break
                    // SPACE
                    case 32:
                        this.toggleMode()
                        break
                    // LEFT_ARROW
                    case 37:
                        this.prev()
                        break
                    // UP_ARROW
                    case 38:
                        this.handleActions('zoomIn')
                        break
                    // RIGHT_ARROW
                    case 39:
                        this.next()
                        break
                    // DOWN_ARROW
                    case 40:
                        this.handleActions('zoomOut')
                        break
                }
            }
            this._mouseWheelHandler = rafThrottle(e => {
                const delta = e.wheelDelta ? e.wheelDelta : -e.detail
                if (delta > 0) {
                    this.handleActions('zoomIn', {
                        zoomRate: 0.015,
                        enableTransition: false
                    })
                } else {
                    this.handleActions('zoomOut', {
                        zoomRate: 0.015,
                        enableTransition: false
                    })
                }
            })
            on(document, 'keydown', this._keyDownHandler)
            on(document, mousewheelEventName, this._mouseWheelHandler)
        },
        deviceSupportUninstall() {
            off(document, 'keydown', this._keyDownHandler)
            off(document, mousewheelEventName, this._mouseWheelHandler)
            this._keyDownHandler = null
            this._mouseWheelHandler = null
        },
        handleImgLoad() {
            this.loading = false
        },
        handleImgError(e) {
            this.loading = false
            e.target.alt = '加载失败'
        },
        handleMouseDown(e) {
            if (this.loading || e.button !== 0) return

            // 用户进行拖拽操作时暂停自动播放
            const isAutoPlayingBeforeDrag = this.isAutoPlaying
            if (isAutoPlayingBeforeDrag) {
                this.stopAutoPlay()
            }

            const { offsetX, offsetY } = this.transform
            const startX = e.pageX
            const startY = e.pageY
            this._dragHandler = rafThrottle(ev => {
                this.transform.offsetX = offsetX + ev.pageX - startX
                this.transform.offsetY = offsetY + ev.pageY - startY
            })
            on(document, 'mousemove', this._dragHandler)
            on(document, 'mouseup', () => {
                off(document, 'mousemove', this._dragHandler)

                // 如果拖拽前是自动播放状态，拖拽后恢复自动播放
                if (isAutoPlayingBeforeDrag) {
                    this.startAutoPlay()
                }
            })

            e.preventDefault()
        },
        handleMaskClick() {
            if (this.maskClosable) {
                this.hide()
            }
        },
        reset() {
            this.transform = {
                scale: 1,
                deg: 0,
                offsetX: 0,
                offsetY: 0,
                enableTransition: false
            }
        },
        toggleMode() {
            if (this.loading) return

            // 切换模式时临时暂停自动播放
            const isAutoPlayingBeforeToggle = this.isAutoPlaying
            if (isAutoPlayingBeforeToggle) {
                this.stopAutoPlay()
            }

            const modeNames = Object.keys(Mode)
            const modeValues = Object.values(Mode)
            const index = modeValues.indexOf(this.mode)
            const nextIndex = (index + 1) % modeNames.length
            this.mode = Mode[modeNames[nextIndex]]
            this.reset()

            // 如果操作前是自动播放状态，操作后恢复自动播放
            if (isAutoPlayingBeforeToggle) {
                this.startAutoPlay()
            }
        },
        prev() {
            if (this.isFirst && !this.infinite) return

            // 手动切换时暂停自动播放，但记录状态以便后续可能恢复
            const isAutoPlayingBeforePrev = this.isAutoPlaying
            if (isAutoPlayingBeforePrev) {
                this.stopAutoPlay()
            }

            const len = this.urlList.length
            this.index = (this.index - 1 + len) % len

            // 如果操作前是自动播放状态，操作后恢复自动播放
            if (isAutoPlayingBeforePrev) {
                this.startAutoPlay()
            }
        },
        next() {
            if (this.isLast && !this.infinite) return

            // 手动切换时暂停自动播放，但记录状态以便后续可能恢复
            const isAutoPlayingBeforeNext = this.isAutoPlaying
            if (isAutoPlayingBeforeNext && !this.autoTriggered) {
                this.stopAutoPlay()
            }

            const len = this.urlList.length
            this.index = (this.index + 1) % len

            // 如果操作前是自动播放状态，操作后恢复自动播放
            if (isAutoPlayingBeforeNext && !this.autoTriggered) {
                this.startAutoPlay()
            }

            // 重置自动触发标记
            this.autoTriggered = false
        },
        handleActions(action, options = {}) {
            if (this.loading) return

            // 执行操作时临时暂停自动播放
            const isAutoPlayingBeforeAction = this.isAutoPlaying
            if (isAutoPlayingBeforeAction) {
                this.stopAutoPlay()
            }

            const { zoomRate, rotateDeg, enableTransition } = {
                zoomRate: 0.2,
                rotateDeg: 90,
                enableTransition: true,
                ...options
            }
            const { transform } = this
            switch (action) {
                case 'zoomOut':
                    if (transform.scale > 0.2) {
                        transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3))
                    }
                    break
                case 'zoomIn':
                    transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3))
                    break
                case 'clocelise':
                    transform.deg += rotateDeg
                    break
                case 'anticlocelise':
                    transform.deg -= rotateDeg
                    break
            }
            transform.enableTransition = enableTransition

            // 如果操作前是自动播放状态，操作后恢复自动播放
            if (isAutoPlayingBeforeAction) {
                this.startAutoPlay()
            }
        },
        // 切换自动播放状态
        toggleAutoPlay() {
            if (this.isSingle) return

            if (this.isAutoPlaying) {
                this.stopAutoPlay()
            } else {
                this.startAutoPlay()
            }
        },

        // 启动自动播放
        startAutoPlay() {
            this.stopAutoPlay()
            if (!this.isSingle) {
                this.isAutoPlaying = true
                this.autoPlayTimer = setInterval(() => {
                    this.autoTriggered = true
                    this.next()
                }, this.interval)
            }
        },

        // 停止自动播放
        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer)
                this.autoPlayTimer = null
                this.isAutoPlaying = false
            }
        },

        // 预加载下一张和上一张图片
        preloadNextImages() {
            if (this.urlList.length <= 1) return

            const preloadUrls = []
            const len = this.urlList.length

            // 预加载下一张图片
            const nextIndex = (this.index + 1) % len
            if (nextIndex !== this.index) {
                preloadUrls.push(this.urlList[nextIndex])
            }

            // 预加载上一张图片
            const prevIndex = (this.index - 1 + len) % len
            if (prevIndex !== this.index) {
                preloadUrls.push(this.urlList[prevIndex])
            }

            this.preloadUrls = preloadUrls
        }
    }
}
</script>
