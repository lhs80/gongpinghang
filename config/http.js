// import 'babel-polyfill'
import axios from 'axios'
import {baseUrl} from './evn'
import cookie from 'react-cookies';
import Promise from 'es6-promise';
import md5 from 'blueimp-md5'

Promise.polyfill();
const APP_KEY = 'BE53C102BA2176C77BCC29F8E4B7EEA9';

//请求拦截
axios.interceptors.request.use(config => {
		const now = new Date();
		const headTime = now.getFullYear()
			+ (now.getMonth() + 1).toString().padStart(2, '0')
			+ now.getDate().toString().padStart(2, '0')
			+ now.getHours().toString().padStart(2, '0')
			+ now.getMinutes().toString().padStart(2, '0')
			+ now.getSeconds().toString().padStart(2, '0');

		config.baseURL = baseUrl;
		config.timeout = 15000;
		config.headers.post['Content-Type'] = 'application/json;charset=utf-8';
		config.headers = {
			// 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			clientId: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').clientId : '',
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			sourceType: 'WEB',
			time: headTime,
			nonce: now.getTime(),
			sign: md5(`nonce=${now.getTime()}sourceType=WEBtime=${headTime}${APP_KEY}`).toUpperCase()
		};

		return config;
	},
	(error) => {
		return Promise.reject(error);
	});

//响应拦截
axios.interceptors.response.use((response) => {
	if (response.status && response.status === 200) {
		return response.data;
	}
}, (error) => {
	// if (error.response.status) {
	// 	if (error.response.status === 504 || error.response.status === 404) {
	// 		console.log('服务器被吃了⊙﹏⊙∥');
	// 	} else if (error.response.status === 403) {
	// 		console.log('权限不足,请联系管理员')
	// 	} else {
	// 		console.log('未知错误')
	// 	}
	// }
	return Promise.resolve(error);
});

export default axios;
