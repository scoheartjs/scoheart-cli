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

}

export default defaults