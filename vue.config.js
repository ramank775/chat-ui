module.exports = {
    devServer : {
        disableHostCheck: true,
        proxy: {
            '^/': {
                target: 'https://8080-a9b568c3-0c9b-42ad-af2e-e0739ff0f38e.ws-us02.gitpod.io',
                wss: true,
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    }
}
