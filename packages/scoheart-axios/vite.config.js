import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: "./index.js",
            name: "a",
            fileName: "axios"
        }
    }
})