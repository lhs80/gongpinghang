import React from 'react'
import axios from 'config/http'
import {apiText} from 'config/evn'

/**
 * 发布招标
 */
export const AddInviteFun = params => {
	return axios.post(apiText + '/invitationBids/issueTender', params)
};

/**
 * 招标列表
 */
export const inviteListFun = params => {
	return axios.post(apiText + '/invitationBids/getTenderList', params)
};

/**
 * 招标详情
 */
export const inviteDetailFun = params => {
	return axios({
		url: apiText + '/invitationBids/getTenderInfo',
		method: 'get',
		params
	})
};
/**
 * 招标--删除草稿
 */
export const delInviteDraftFun = invitationId => {
	return axios.get(apiText + '/invitationBids/delBids?invitationId=' + invitationId)
};
/**
 * 招标--设置招标终止，废标
 */
export const stopInviteFun = params => {
	return axios.post(apiText + '/invitationBids/setTenderException', params)
};
/**
 * 招标--设置中标
 */
export const winningBidFun = params => {
	return axios.post(apiText + '/invitationBids/setWinning', params)
};
/**
 * 投标--投标列表
 */
export const bidListFun = params => {
	return axios.post(apiText + '/invitationBidsUser/myBidList', params)
};
/**
 * 投标--撤回投标
 */
export const withdrawBidFun = params => {
	return axios.post(apiText + '/invitationBidsUser/cancel', params)
};
/**
 * 招标--设置无效
 */
export const setInvalidFun = params => {
	return axios.post(apiText + '/invitationBids/setBidUserInvalid', params)
};
/**
 * 投标详情
 */
export const bidDetailFun = params => {
	return axios.post(apiText + '/invitationBidsUser/detail', params)
};

/**
 * 投标
 */
export const AddTenderFun = data => {
	return axios({
		url: apiText + '/invitationBidsUser/add',
		method: 'post',
		data
	})
};

/**
 * 变更招标
 */
export const uploadInviteFun = data => {
	return axios({
		url: apiText + '/invitationBids/updateTender',
		method: 'post',
		data
	})
};


/**
 * 招投标消息
 */
export const inviteMessageFun = params => {
	return axios({
		url: apiText + '/api/systemMsg/pcGetBidMsg',
		method: 'get',
		params
	})
};

