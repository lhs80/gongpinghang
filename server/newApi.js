import axios from 'config/http'
import {apiText} from 'config/evn'

/**
 * 首页查询进货单商品数量
 */
export const queryProductNumForIndexFun = params => {
	return axios({
		url: apiText + '/cart/getProductCount',
		method: 'get',
		params
	})
};

/**
 * 最近浏览
 */
export const queryBroweListFun = params => {
	return axios({
		url: apiText + '/search/browseList',
		method: 'get',
		params
	})
};

/**
 * 首页购物车列表
 */
export const queryCartListForIndexFun = params => {
	return axios({
		url: apiText + '/cart/getCartProductList',
		method: 'get',
		params
	})
};

/**
 * 认证中心认证信息
 */
export const queryAuthInfoFun = data => {
	return axios({
		url: apiText + '/unifyAuth/authInfo',
		method: 'post',
		data
	})
};

/**
 * 企业认证营业执照上传
 */
export const uploadBusinessLicenseFun = data => {
	return axios({
		url: apiText + '/companycert/photoUpload',
		method: 'post',
		data
	})
};

/**
 * 企业认证信息提交
 */
export const submitAuthFun = data => {
	return axios({
		url: apiText + '/companycert/submit',
		method: 'post',
		data
	})
};

/**
 * 新增发票
 */
export const addBillFun = data => {
	return axios({
		url: apiText + '/invoice/add',
		method: 'post',
		data
	})
};

/**
 * 发票列表
 */
export const billListFun = data => {
	return axios({
		url: apiText + '/invoice/list',
		method: 'post',
		data
	})
};

/**
 * 支付新接口
 */
export const newPayFun = data => {
	return axios({
		url: apiText + '/payCenter/sqpay/uploadImg',
		method: 'post',
		data
	})
};
