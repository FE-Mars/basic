const Mock = require('mockjs')
const qs = require('qs')

export function param2Obj(url) {
    const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
    if (!search) {
        return {}
    }
    return qs.parse(search)
}

function XHR2ExpressReqWrap(respond) {
    return function(options) {
        let result = null
        if (respond instanceof Function) {
            const { body, type, url } = options
            console.log(url)
            // https://expressjs.com/en/4x/api.html#req
            result = respond({
                method: type,
                body: JSON.parse(body),
                query: param2Obj(url),
                url
            })
        } else {
            result = respond
        }
        console.log(result)
        return Mock.mock(result)
    }
}

if (process.env.VUE_APP_API_MOCK == 'ON') {
    const mocksContext = require.context('./modules/', true, /.js$/)
    mocksContext.keys().forEach(file_name => {
        // 获取文件中的 default 模块
        const mocks = mocksContext(file_name)
        for (const mock of mocks) {
            console.log(mock.url)
            Mock.mock(
                new RegExp(`${process.env.VUE_APP_API_ROOT}${process.env.VUE_APP_API_MOCK_PREFIX}/${mock.url}`),
                mock.type || 'get',
                XHR2ExpressReqWrap(mock.result)
            )
        }
    })
}
