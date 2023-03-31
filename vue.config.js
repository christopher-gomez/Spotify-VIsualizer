const bootstrapSassAbstractsImports = require('vue-cli-plugin-bootstrap-vue/sassAbstractsImports.js')
module.exports = {
	devServer: {
		disableHostCheck: true,
	},
	css: {
		loaderOptions: {
			sass: {
				additionalData: bootstrapSassAbstractsImports.join('\n')
			},
			scss: {
				additionalData: [...bootstrapSassAbstractsImports, ''].join(';\n')
			}
		}
	}
}