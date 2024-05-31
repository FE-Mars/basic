import axios from 'axios'
// import Qs from 'qs'
// import router from '@/router/index
import { Message } from 'element-ui'

// const toLogin = () => {
//     router.push({
//         path: '/login',
//         query: {
//             redirect: router.currentRoute.fullPath
//         }
//     })
// }

let baseURL = process.env.VUE_APP_API_ROOT
if (process.env.VUE_APP_API_PROXY) {
    baseURL = '/proxy' + baseURL
} else if (process.env.VUE_APP_API_MOCK == 'ON') {
    baseURL += process.env.VUE_APP_API_MOCK_PREFIX
}
console.log(baseURL)

const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    responseType: 'json'
    // withCredentials: true
})

api.interceptors.request.use(
    request => {
        if (request.method == 'post') {
            if (request.data == undefined) {
                request.data = {}
            }
        } else {
            // 带上 token
            if (request.params == undefined) {
                request.params = {}
            }
        }
        return request
    }
)

api.interceptors.response.use(
    response => {
        if (response.data.code != 200) {
            Message.error(response.data.message || response.data.msg || '请求失败')
            return Promise.reject(response.data)
        }
        return Promise.resolve(response.data)
    },
    error => {
        return Promise.reject(error)
    }
)

export default api
