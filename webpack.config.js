module.exports = {
	module: {
		rules: [ {
			test: /\.scss$|\.sass$/, use: ['resolve-url-loader', {
				loader: 'sass-loader',
				options: {
					sourceMap: true,
					// bootstrap-sass requires a minimum precision of 8
					precision: 8,
				}
			}]
		} ]
	}
}