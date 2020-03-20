import React from 'react'
import axios from 'config/http'

/**
 * 招标详情
 */
export const getCardListFun = data => {
	return axios({
		url: '/payCenter/query/cardList',
		method: 'post',
		data
	})
};

/**
 * 查询商户认证状态和失败原因
 */
export const queryAccountStatusFun = params => {
	return axios({
		url: '/payCenter/query/queryAccount',
		method: 'get',
		params
	})
};

/**
 * 银行名称列表
 */
export const queryBankDataFun = () => {
	return axios({
		url: '/payCenter/query/bankNameList',
		method: 'get',
	})
};

/**
 * 绑卡前发送短信
 */
export const bindCardSendSmsFun = (data) => {
	return axios({
		url: '/payCenter/sqpay/sendBindCardSms',
		method: 'post',
		data
	})
};

/**
 * 绑卡
 */
export const bindCardFun = (data) => {
	return axios({
		url: '/payCenter/sqpay/bindCard',
		method: 'post',
		data
	})
};

/**
 * 解绑
 */
export const unBindCardFun = (data) => {
	return axios({
		url: '/payCenter/sqpay/delCard',
		method: 'post',
		data
	})
};

/**
 * 设置支付密码
 */
export const setPswFun = (data) => {
	return axios({
		url: '/payCenter/sqpay/setPassword',
		method: 'post',
		data
	})
};

//双乾支付页面需要的信息
export const getPayInfoForShuangQian = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: 'payCenter/sqpay/pay',
			method: 'post',
			data
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	})
};

//设置支付密码成功后改状态
export const setPswStatusFun = (params) => {
	return axios({
		url: '/payCenter/sqpay/setPasswdStatus',
		method: 'get',
		params
	})
};
