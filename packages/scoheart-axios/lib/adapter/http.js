import http from "http"

const isHttpAdapterSupported = typeof process !== "undefined"

export default isHttpAdapterSupported && function httpAdapter(config) {

    return new Promise(function dispatchHttpAdapter (resolve, reject) {
        const url = new URL(config.url)

        const request = http.request(url, function (res) {

            res.setEncoding("utf-8")

            res.on("data", function (data) {
                resolve(data)
            })

            res.on("error", function(error){
                reject(error)
            })

        })

        request.end()
    })

}




