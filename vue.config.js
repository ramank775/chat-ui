module.exports = {
    devServer : {
        disableHostCheck: true,
        proxy: {
            '^/': {
                target: 'https://8080-c17aed85-89bd-44ab-8dfd-070350e67420.ws-us02.gitpod.io',
                wss: true,
                changeOrigin: true
            }
        }
    }
}
