module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    env: {
        development: {
            plugins: ['dynamic-import-node']
        }
    },
    plugins: [
        [
            "import",
            {
                libraryName: '@icon-park/vue',
                libraryDirectory: 'es/icons',
                camel2DashComponentName: false // default: true,
            }
        ]
    ]
}
