import defaults from '../defaults/index.js';
import adapters from '../adapter/adapters.js';

function transformRequestData(data) {
    return JSON.stringify(data)
}

function transformResponseData(data) {
    try {
        data = JSON.parse(data)
    } catch (error) {/** ignore */}
    return data
}

export default function dispatchRequest(config) {

    config.data = transformRequestData(config.data)

    const adapter = adapters.getAdapter(defaults.adapter)

    return adapter(config).then(function onAdapterResolution(response) {

        response.data = transformResponseData(response.data)

        return response
    }, function onAdapterRejection(reason) {

        return Promise.reject(reason)
    })
}