const pkg = require('./package.json')
process.env.VUE_APP_VERSION = `${pkg.version}_${pkg.versionCode}`

module.exports = {
  publicPath: './',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
  },
  chainWebpack: (config) => {
    // 排除 macOS 系统文件进入打包产物
    config.module.rule('file').exclude.add(/\.DS_Store$/)
  },
}
