module.exports = {
    devServer : {
        disableHostCheck: true,
        proxy: {
            '^/': {
                target: 'https://8080-cfdb0312-c8b9-4be6-8225-bb16d365c9d9.ws-us02.gitpod.io',
                wss: true,
                changeOrigin: true
            }
        }
    }
}
