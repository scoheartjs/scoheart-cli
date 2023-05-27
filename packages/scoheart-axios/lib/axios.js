import defaults from './defaults/index.js';
import Axios from './core/Axios.js';
import mergeConfig from './core/mergeConfig.js';

function createInstance (defaultConfig) {
    const context = new Axios(defaultConfig)

    const instance = Axios.prototype.request.bind(context)

    Object.keys(context).forEach(property => {
        instance[property] = context[property]
    })

    Object.keys(Axios.prototype).forEach(method => {
        instance[method] = Axios.prototype[method]
    })

    instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig))
    }

    return instance
}

const axios = createInstance(defaults)

export default axios