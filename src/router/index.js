import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // progress bar style

Vue.use(VueRouter)

import Layout from '@/layout'
// import EmptyLayout from '@/layout/empty'

const constantRoutes = [
    {
        path: '/',
        component: Layout,
        redirect: '/solar_wind',
    }
]

// 当 children 不为空的主导航只有一项时，则隐藏
let asyncRoutes = [
    {
        meta: {
            title: '演示',
            icon: 'sidebar-default'
        },
        children: [
            {
                path: '/solar_wind',
                component: Layout,
                name: 'solarWind',
                meta: {
                    title: '太阳风数据',
                    icon: 'fenfa'
                },
                children: [
                    {
                        path: '',
                        name: 'solarWindIndex',
                        component: () => import(/* webpackChunkName: 'solar_wind' */ '@/views/solar_wind'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/solar_wind'
                        }
                    }
                ]
            },
            {
                path: '/model_forecast',
                component: Layout,
                name: 'modelForecast',
                meta: {
                    title: '模式预报数据产品',
                    icon: 'square'
                },
                children: [
                    {
                        path: '',
                        name: 'modelForecastIndex',
                        component: () => import(/* webpackChunkName: 'model_forecast' */ '@/views/model_forecast'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/model_forecast'
                        }
                    }
                ]
            },
            {
                path: '/magnetospheric_ionospheric',
                component: Layout,
                name: 'magnetosphericIonospheric',
                meta: {
                    title: '磁层电离层数据产品',
                    icon: 'waves'
                },
                children: [
                    {
                        path: '',
                        name: 'magnetosphericIonosphericIndex',
                        component: () => import(/* webpackChunkName: 'magnetospheric_ionospheric' */ '@/views/magnetospheric_ionospheric'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/magnetospheric_ionospheric'
                        }
                    }
                ]
            },
            {
                path: '/advanced_data',
                component: Layout,
                name: 'advancedData',
                meta: {
                    title: '高级数据',
                    icon: 'waveform'
                },
                children: [
                    {
                        path: '',
                        name: 'advancedDataIndex',
                        component: () => import(/* webpackChunkName: 'advanced_data' */ '@/views/advanced_data'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/advanced_data'
                        }
                    }
                ]
            }
        ]
    }
]

const lastRoute = [{
    path: '*',
    component: () => import('@/views/404'),
    meta: {
        title: '404',
        sidebar: false
    }
}]

const router = new VueRouter({
    routes: constantRoutes
})

// 解决路由在 push/replace 了相同地址报错的问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err)
}

router.beforeEach(async(to, from, next) => {
    store.state.settings.enableProgress && NProgress.start()
    // 已经登录，但还没根据权限动态挂载路由
    if (store.getters['user/isLogin'] && !store.state.menu.isGenerate) {
        /**
         * 重置 matcher
         * https://blog.csdn.net/baidu_28647571/article/details/101711682
         */
        router.matcher = new VueRouter({
            routes: constantRoutes
        }).matcher
        const accessRoutes = await store.dispatch('menu/generateRoutes', {
            asyncRoutes,
            currentPath: to.path
        })
        accessRoutes.push(...lastRoute)
        accessRoutes.forEach(route => {
            router.addRoute(route)
        })
        next({ ...to, replace: true })
    }
    if (store.state.menu.isGenerate) {
        store.commit('menu/setHeaderActived', to.path)
    }
    to.meta.title && store.commit('settings/setTitle', to.meta.title)
    if (store.getters['user/isLogin']) {
        if (to.name) {
            if (to.matched.length !== 0) {
                // 如果已登录状态下，进入登录页会强制跳转到控制台页面
                if (to.name == 'login') {
                    next({
                        name: 'dashboard',
                        replace: true
                    })
                } else if (!store.state.settings.enableDashboard && to.name == 'dashboard') {
                    // 如果未开启控制台页面，则默认进入侧边栏导航第一个模块，但如果侧边栏导航没有模块，则还是进入控制台页面
                    if (store.getters['menu/sidebarRoutes'].length > 0) {
                        next({
                            name: store.getters['menu/sidebarRoutes'][0].name,
                            replace: true
                        })
                    }
                }
            } else {
                // 如果是通过 name 跳转，并且 name 对应的路由没有权限时，需要做这步处理，手动指向到 404 页面
                next({
                    path: '/404'
                })
            }
        }
    } else {
        if (to.name != 'login') {
            next({
                name: 'login',
                query: {
                    redirect: to.fullPath
                }
            })
        }
    }
    next()
})

router.afterEach(() => {
    store.state.settings.enableProgress && NProgress.done()
})

export default router
