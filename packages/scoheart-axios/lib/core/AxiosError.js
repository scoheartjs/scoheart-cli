
export default function AxiosError(code) {

    const errorMessage = 
    [
        "ERR_REQUEST_ABORTED",
        "ERR_TIME_OUT",
        "ERR_NETWORK_ERROR"
    ]

    return new Error(errorMessage[code])
}