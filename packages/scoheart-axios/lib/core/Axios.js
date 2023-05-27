import dispatchRequest from './dispatchRequest.js';
import mergeConfig from './mergeConfig.js';
import InterceptorManager from './InterceptorManager.js';

export default function Axios(instanceConfig) {
    this.defaults = instanceConfig
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    }
}

Axios.prototype.request = function (config) {

    config = mergeConfig(this.defaults, config)

    let chain = [dispatchRequest, undefined]

    // const promise = new Promise(function (resolve, reject) {
    //     resolve(config)
    // })
    let promise = Promise.resolve(config)

    this.interceptors.request.handlers.forEach(function unshiftRequestInterceptors(requestInterceptor) {
        chain.unshift(requestInterceptor.fulfilled, requestInterceptor.rejected)
    })

    this.interceptors.response.handlers.forEach(function pushResponseInterceptors (responseInterceptor) {
        chain.push(responseInterceptor.fulfilled, responseInterceptor.rejected)
    })

    console.log("chain", chain)

    // because this init promise is fulfilled, so onFulfilled is called. --> dispatchRequest, and config is its parameter
    while(chain.length){
        promise = promise.then(chain.shift(), chain.shift())
        console.log(promise)
    }

    return promise
}

const aliasMethod = ["get", "delete", "head", "options"]
const aliasMethodWithData = ["post", "put", "patch"]

aliasMethod.forEach(item => {
    Axios.prototype[item] = function (url, config) {
        return this.request(mergeConfig(config, {
            method: item,
            url: url
        }))
    }
})

aliasMethodWithData.forEach(item => {
    Axios.prototype[item] = function (url, data, config) {
        return this.request(mergeConfig(config, {
            method: item,
            url: url,
            data: data
        }))
    }
})

