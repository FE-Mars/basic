<template>
    <div id="app">
        <RouterView />
    </div>
</template>

<script>
export default {
    data() {
        return {}
    },
    watch: {
        '$store.state.keepAlive.list'(val) {
            process.env.NODE_ENV == 'development' && console.log(`[ keepAliveList ] ${val}`)
        },
        '$store.state.settings.mode': {
            handler() {
                if (this.$store.state.settings.mode == 'pc') {
                    this.$store.commit('settings/updateThemeSetting', {
                        'sidebarCollapse': this.$store.state.settings.sidebarCollapseLastStatus
                    })
                } else if (this.$store.state.settings.mode == 'mobile') {
                    this.$store.commit('settings/updateThemeSetting', {
                        'sidebarCollapse': true
                    })
                }
                document.body.setAttribute('data-mode', this.$store.state.settings.mode)
            },
            immediate: true
        }
    },
    mounted() {
        window.onresize = () => {
            this.$store.commit('settings/setMode', document.body.clientWidth)
        }
        window.onresize()
    },
    methods: {},
    metaInfo() {
        return {
            title: this.$store.state.settings.enableDynamicTitle && this.$store.state.settings.title,
            titleTemplate: title => {
                return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
            }
        }
    }
}
</script>

<style scoped>
#app {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial, noto sans, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji;
    font-feature-settings: normal;
    font-variation-settings: normal;
    -webkit-font-smoothing: antialiased;
}
</style>
