'use strict';

var http = require('http');

const defaults = {

    adapter: ["xhr", "http"],

    transformRequest: null,

    transformResponse: null,

    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    validateStatus: null,

};

function AxiosError(code) {

    const errorMessage = 
    [
        "ERR_REQUEST_ABORTED",
        "ERR_TIME_OUT",
        "ERR_NETWORK_ERROR"
    ];

    return new Error(errorMessage[code])
}

const isXhrAdapterSupported = typeof window !== "undefined";

var xhrAdapter = isXhrAdapterSupported && function (config) {
    return new Promise(function dispatchXhrAdapter(resolve, reject) {

        const requestData = config.data;

        let request = new XMLHttpRequest();

        request.timeout = config.timeout;

        request.open(config.method, config.url, true);

        function onloadend() {
            if (!request) return

            const response = {
                data: request.response,
                status: request.status,
                statusText: request.statusText,
                headers: request.getAllResponseHeaders()
            };

            if (request.status === 200) {
                resolve(response);
            }

            // clean up request 
            request = null;
        }

        if ("onloadend" in request) {
            // use onloadend callback if available
            request.onloadend = onloadend;
        } else {
            // if unavailable
            // use onreadystatechange to listen for readystate to emulate onloadend
            request.onreadystatechange = function () {
                if (!request && request.readystate !== 4) return

                if (request.status === 0) return

                // next eventloop call onloadend
                setTimeout(onloadend);
            };
        }

        request.onabort = function handleAbort() {
            if (!request) return

            reject(new AxiosError(0));

            request = null;
        };

        request.onerror = function handleError() {
            reject(new AxiosError(2));

            // clean up request
            request = null;
        };

        request.ontimeout = function handleTimeout() {
            reject(new AxiosError(1));

            // clean up request
            request = null;
        };

        request.send(requestData || null);
    })
};

const isHttpAdapterSupported = typeof process !== "undefined";

var httpAdapter = isHttpAdapterSupported && function httpAdapter(config) {

    return new Promise(function dispatchHttpAdapter (resolve, reject) {
        const url = new URL(config.url);

        const request = http.request(url, function (res) {

            res.setEncoding("utf-8");

            res.on("data", function (data) {
                resolve(data);
            });

            res.on("error", function(error){
                reject(error);
            });

        });

        request.end();
    })

};

const knownAdapters = {
    xhr: xhrAdapter,
    http: httpAdapter
};

var adapters = {
    getAdapter: function getAdapter(adapters) {

        let adapterSelected;

        adapters.forEach(adapter => {
            knownAdapters[adapter]
                ? adapterSelected = knownAdapters[adapter]
                : undefined;
        });

        return adapterSelected
    }
};

function transformRequestData(data) {
    return JSON.stringify(data)
}

function transformResponseData(data) {
    try {
        data = JSON.parse(data);
    } catch (error) {/** ignore */}
    return data
}

function dispatchRequest(config) {

    config.data = transformRequestData(config.data);

    const adapter = adapters.getAdapter(defaults.adapter);

    return adapter(config).then(function onAdapterResolution(response) {

        response.data = transformResponseData(response.data);

        return response
    }, function onAdapterRejection(reason) {

        return Promise.reject(reason)
    })
}

function mergeConfig(config1, config2) {

    const config = {};

    return Object.assign(config, config1, config2)
}

function InterceptorManager () {
    this.handlers = [];
}

/**
 * 
 * @param {Function} fulfilled The onFulfilled Function you write
 * @param {Function} rejected  The onRejected Function you write
 * @returns 
 */
InterceptorManager.prototype.use = function use (fulfilled, rejected) {
    this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
    });
    return this.handlers.length - 1
};

function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };
}

Axios.prototype.request = function (config) {

    config = mergeConfig(this.defaults, config);

    let chain = [dispatchRequest, undefined];

    // const promise = new Promise(function (resolve, reject) {
    //     resolve(config)
    // })
    let promise = Promise.resolve(config);

    this.interceptors.request.handlers.forEach(function unshiftRequestInterceptors(requestInterceptor) {
        chain.unshift(requestInterceptor.fulfilled, requestInterceptor.rejected);
    });

    this.interceptors.response.handlers.forEach(function pushResponseInterceptors (responseInterceptor) {
        chain.push(responseInterceptor.fulfilled, responseInterceptor.rejected);
    });

    console.log("chain", chain);

    // because this init promise is fulfilled, so onFulfilled is called. --> dispatchRequest, and config is its parameter
    while(chain.length){
        promise = promise.then(chain.shift(), chain.shift());
        console.log(promise);
    }

    return promise
};

const aliasMethod = ["get", "delete", "head", "options"];
const aliasMethodWithData = ["post", "put", "patch"];

aliasMethod.forEach(item => {
    Axios.prototype[item] = function (url, config) {
        return this.request(mergeConfig(config, {
            method: item,
            url: url
        }))
    };
});

aliasMethodWithData.forEach(item => {
    Axios.prototype[item] = function (url, data, config) {
        return this.request(mergeConfig(config, {
            method: item,
            url: url,
            data: data
        }))
    };
});

function createInstance (defaultConfig) {
    const context = new Axios(defaultConfig);

    const instance = Axios.prototype.request.bind(context);

    Object.keys(context).forEach(property => {
        instance[property] = context[property];
    });

    Object.keys(Axios.prototype).forEach(method => {
        instance[method] = Axios.prototype[method];
    });

    instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig))
    };

    return instance
}

const axios = createInstance(defaults);

module.exports = axios;
