
export default function InterceptorManager () {
    this.handlers = []
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
    })
    return this.handlers.length - 1
}

