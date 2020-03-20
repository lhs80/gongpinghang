const withLess = require('@zeit/next-less');
const withCss = require('@zeit/next-css');
const SpritesmithPlugin = require('webpack-spritesmith');
const path = require('path');

module.exports = withCss(withLess({
	exportPathMap: async function (defaultPathMap) {
		return {
			'/': {page: '/'},
			'/mall': {page: '/mall/home'},
		}
	},
	webpack(config, {}) {
		const originalEntry = config.entry;
		config.entry = async () => {
			const entries = await originalEntry();
			if (
				entries['main.js'] &&
				!entries['main.js'].includes('./client/polyfill.js')
			) {
				entries['main.js'].unshift('./client/polyfill.js')
			}
			return entries
		};

		config.node = {
			fs: 'empty'
		};
		config.resolve.alias = {
			...config.resolve.alias,
			'config': path.resolve(__dirname, './config'),
			'server': path.resolve(__dirname, './server/index.js'),
			'inviteApi': path.resolve(__dirname, './server/inviteApi.js'),
			'newApi': path.resolve(__dirname, './server/newApi.js'),
			'payApi': path.resolve(__dirname, './server/payApi.js'),
			'components': path.resolve(__dirname, './components'),
			'static': path.resolve(__dirname, './static'),
		};
		config.plugins.push(new SpritesmithPlugin({
			src: {
				cwd: path.resolve(__dirname, './static/sprites'),
				glob: '*.png'
			},
			target: {
				image: path.resolve(__dirname, './static/images/sprite.png'),
				css: path.resolve(__dirname, './static/sprite.css')
			},
			//样式中调用雪碧图路径
			apiOptions: {
				cssImageRef: '/static/images/sprite.png'
			},
			//生成图片的方向
			spritesmithOptions: {
				algorithm: 'left-right'
			}
		}));
		config.module.rules.push({
			test: /\.(png|jpe?g|svg|gif)$/,
			use: [{
				loader: 'file-loader',
				options: {
					limit: 1000,
					name: 'images/[name].[ext]'
				}
			}],
		}, {
			test: /\.(eot|svg|ttf|woff)$/,
			use: [
				{
					loader: 'url-loader',

					options: {
						limit: 1000 //limit
					}
				}
			]
		});
		return config
	},
	lessLoaderOptions: {
		javascriptEnabled: true,
		importLoaders: 1,
		localIdentName: '[local]___[hash:base64:5]',
	}
}));
