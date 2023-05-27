import xhrAdapter from './xhr.js';
import httpAdapter from './http.js';

const knownAdapters = {
    xhr: xhrAdapter,
    http: httpAdapter
}

export default {
    getAdapter: function getAdapter(adapters) {

        let adapterSelected

        adapters.forEach(adapter => {
            knownAdapters[adapter]
                ? adapterSelected = knownAdapters[adapter]
                : undefined
        });

        return adapterSelected
    }
}