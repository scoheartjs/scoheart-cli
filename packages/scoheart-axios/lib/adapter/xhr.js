import AxiosError from '../core/AxiosError.js';

const isXhrAdapterSupported = typeof window !== "undefined"

export default isXhrAdapterSupported && function (config) {
    return new Promise(function dispatchXhrAdapter(resolve, reject) {

        const requestData = config.data

        let request = new XMLHttpRequest()

        request.timeout = config.timeout

        request.open(config.method, config.url, true)

        function onloadend() {
            if (!request) return

            const response = {
                data: request.response,
                status: request.status,
                statusText: request.statusText,
                headers: request.getAllResponseHeaders()
            }

            if (request.status === 200) {
                resolve(response)
            }

            // clean up request 
            request = null
        }

        if ("onloadend" in request) {
            // use onloadend callback if available
            request.onloadend = onloadend
        } else {
            // if unavailable
            // use onreadystatechange to listen for readystate to emulate onloadend
            request.onreadystatechange = function () {
                if (!request && request.readystate !== 4) return

                if (request.status === 0) return

                // next eventloop call onloadend
                setTimeout(onloadend)
            }
        }

        request.onabort = function handleAbort() {
            if (!request) return

            reject(new AxiosError(0))

            request = null
        }

        request.onerror = function handleError() {
            reject(new AxiosError(2))

            // clean up request
            request = null
        }

        request.ontimeout = function handleTimeout() {
            reject(new AxiosError(1))

            // clean up request
            request = null
        }

        request.send(requestData || null)
    })
}