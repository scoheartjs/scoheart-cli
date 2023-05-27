export default function mergeConfig(config1, config2) {

    const config = {}

    return Object.assign(config, config1, config2)
}