export default {
    input: "index.js",
    output: [
        {
            file: "dist/axios.umd.js",
            format: "umd",
            name: "axios"
        },
        {
            file: "dist/axios.cjs",
            format: "cjs",
        }
    ]
}