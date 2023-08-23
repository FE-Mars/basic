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
        redirect: '/task_supervision',
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
                path: '/task_supervision',
                component: Layout,
                redirect: '/task_supervision/index',
                name: 'taskSupervision',
                meta: {
                    title: '质量检验任务监管',
                    icon: 'fenfa'
                },
                children: [
                    {
                        path: 'index',
                        name: 'taskSupervisionIndex',
                        component: () => import(/* webpackChunkName: 'supervision' */ '@/views/supervision'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/task_supervision'
                        }
                    }
                ]
            },
            {
                path: '/verification_rules',
                component: Layout,
                redirect: '/verification_rules/index',
                name: 'QualityVerificationRules',
                meta: {
                    title: '质量检验规则',
                    icon: 'renwujianguan'
                },
                children: [
                    {
                        path: 'index',
                        name: 'QualityVerificationRulesIndex',
                        component: () => import(/* webpackChunkName: 'verification_rules' */ '@/views/rules'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/verification_rules'
                        }
                    }
                ]
            },
            {
                path: '/comparison_rules',
                component: Layout,
                redirect: '/comparison_rules/index',
                name: 'ComparisonRules',
                meta: {
                    title: '数据对比规则',
                    icon: 'equal',
                    active_icon: 'equal-active'
                },
                children: [
                    {
                        path: 'index',
                        name: 'ComparisonRulesIndex',
                        component: () => import(/* webpackChunkName: 'Comparison_rules' */ '@/views/rules'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/comparison_rules'
                        }
                    }
                ]
            },
            {
                path: '/verification_report',
                component: Layout,
                redirect: '/verification_report/index',
                name: 'VerificationReport',
                meta: {
                    title: '数据质量检验报告',
                    icon: 'table-report',
                    active_icon: 'table-report-active',
                },
                children: [
                    {
                        path: 'index',
                        name: 'VerificationReportIndex',
                        component: () => import(/* webpackChunkName: 'verification_report' */ '@/views/report'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/verification_report'
                        }
                    }
                ]
            },
            {
                path: '/comparison_result',
                component: Layout,
                redirect: '/comparison_result/index',
                name: 'ComparisonResult',
                meta: {
                    title: '数据对比结果',
                    icon: 'data-arrival',
                    active_icon: 'data-arrival-active',
                },
                children: [
                    {
                        path: 'index',
                        name: 'ComparisonResultIndex',
                        component: () => import(/* webpackChunkName: 'Comparison_result' */ '@/views/result'),
                        meta: {
                            sidebar: false,
                            breadcrumb: false,
                            activeMenu: '/comparison_result'
                        }
                    }
                ]
            },
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
