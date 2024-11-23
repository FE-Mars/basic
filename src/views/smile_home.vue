<!--
 * @Author: Wang Jun
 * @Date: 2024-11-16 09:59:21
 * @LastEditTime: 2024-11-23 10:45:57
 * @LastEditors: Wang Jun
 * @Description: SMILE首页
-->
<template>
    <div class="smile-home">
        <div class="header">
            <img src="@/assets/images/logo2.png" alt="">
            <h1>SMILE卫星科学应用系统科学数据处理分系统</h1>
            <span>V1.0</span>
        </div>
        <div class="content">
            <div class="smile-home-content">
                <div v-for="system in systems" :key="system.key" :class="`system ${system.position}`">
                    <div class="title">{{ system.title }}</div>
                    <div class="children">
                        <el-card v-for="(item) in system.children" :key="item.label" shadow="hover" :style="item.style" @click.native="onClick(item)">
                            <img :src="require(`@/assets/images/${item.icon}`)" alt="">
                            <div class="labels">
                                <div class="label">{{ item.label }}</div>
                                <div v-if="item.subLabel" class="sub-label">{{ item.subLabel }}</div>
                            </div>
                        </el-card>
                    </div>
                </div>
            </div>
        </div>
        <Copyright v-if="$store.state.settings.showCopyright" />
    </div>
</template>
<script>
export default {
    name: "SMILEHome",
    data() {
        return {
            systems: [
                {
                    key: 'integrated',
                    title: '综合数据处理子系统',
                    position: 'vertical',
                    children: [
                        {
                            icon: 'v2_sk1xpi.png',
                            label: '数据分发',
                            path: ''
                        },
                        {
                            icon: 'v2_sk1xv8.png',
                            label: '数据存储',
                            path: ''
                        },
                    ]
                },
                {
                    key: 'load',
                    title: '载荷数据处理子系统',
                    position: 'horizontal',
                    children: [
                        {
                            icon: 'v2_smx839.png',
                            label: 'UVI',
                            subLabel: '紫外极光',
                            style: '--bg-color: rgba(19,34,122,0.17); --text-color: #13227A;',
                            path: 'uvi:run'
                        },
                        {
                            icon: 'v2_smx6px.png',
                            label: 'MAG',
                            subLabel: '磁強计',
                            style: '--bg-color: rgba(18,150,219,0.16); --text-color: #1296DB;',
                            path: 'mag:run'
                        },
                        {
                            icon: 'v2_smx85m.png',
                            label: 'LIA',
                            subLabel: '低能离子',
                            style: '--bg-color: rgba(212,35,122,0.13); --text-color: #D4237A;',
                            path: 'lia:run'
                        },
                        {
                            icon: 'v2_smx89b.png',
                            label: 'SXI',
                            subLabel: '软X射线',
                            style: '--bg-color: rgba(225,102,50,0.13); --text-color: #E16632;',
                            path: 'sxi:run'
                        }
                    ]
                }
            ]
        }
    },
    methods: {
        onClick(item) {
            console.log(item)
            window.location.href = item.path
        }
    },
}
</script>
<style lang="scss">
.smile-home {
    display: flex;
    flex-direction: column;
    height: 100%;
    .header {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 0 24px;
        background-color: #222b45;
        color: #fff;
        font-size: 24px;
        img {
            width: 50px;
            height: 50px;
        }
        h1 {
            flex: 1;
            font-size: 24px;
        }
    }
    .content {
        display: flex;
        justify-content: center;
        flex: 1;
    }
    .smile-home-content {
        align-self: flex-start;
        display: inline-grid;
        grid-template-columns: repeat(2, auto);
        grid-gap: 80px;
        padding-top: 80px;
    }
    .title {
        font-size: 32px;
        line-height: 28px;
        color: rgba(79, 79, 79, 1);
        font-weight: bold;
        margin-bottom: 56px;
    }
    img {
        width: 60px;
        height: 60px;
    }
    .system {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        .children {
            flex: 1;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            align-items: center;
            .el-card {
                width: 240px;
                padding: 18px 32px;
                background-color: var(--bg-color, #fff);
                color: var(--text-color, #333);
                cursor: pointer;
                .el-card__body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    gap: 24px;
                    .label {
                        font-size: 32px;
                    }
                }
                &:hover {
                    .el-card__body {
                        font-weight: 600;
                    }
                }
            }
        }
        &:first-child {
            .children::after {
                content: '';
                position: absolute;
                width: 4px;
                height: calc(100% - 84px);
                right: -40px;
                bottom: 0;
                background-color: #5d5d5d;
                border-radius: 3px;
            }
        }
        &.vertical {
            .children {
                .el-card {
                    width: 220px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 36px 60px;
                    .el-card__body {
                        flex-direction: column;
                        .label {
                            font-size: 24px;
                        }
                    }
                }
            }
        }
        &.horizontal {
            .children {
                .el-card {
                    width: 260px;
                    .el-card__body {
                        justify-content: space-between;
                        .labels {
                            position: relative;
                            flex: 1;
                            padding-left: 24px;
                            &::before {
                                content: '';
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 2px;
                                height: 100%;
                                transform: translateX(-50%);
                                background-color: var(--bg-color);
                                border-radius: 3px;
                            }
                        }
                    }
                    &:hover {
                        .labels {
                            &::before {
                                width: 3px;
                                background-color: var(--text-color);
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
