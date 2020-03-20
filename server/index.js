// api接口
import React from 'react'
import axios from 'config/http'
import {apiText} from 'config/evn'

/**
 * 手机号码验证是否注册
 */
export const phoneValidate = params => {
	return axios.post(apiText + '/userAccount/validatMobile', params)
};

/**
 * 获取短信验证码
 */
export const sendSmsCode = params => {
	return axios.post(apiText + '/userAccount/sendSmsCode', params)
};
/**
 * 校验短信验证码
 */
export const validateSmsCode = params => {
	return axios.post(apiText + '/userAccount/validateSmsCode', params)
};
/**
 * 企业是否注册
 */
export const companyRegist = companyName => {
	return axios.get(apiText + '/companyInfo/isRegister?companyName=' + companyName);
};
/**
 * 注册内的晚上资料校验用户名是否被注册过
 */
export const validateNameFun = nickName => {
	return axios.get(apiText + '/userAccount/validateNickName?nickName=' + nickName);
};
/**
 * 使用手机和密码或验证码登录
 * 短信验证码和密码，二选一，传一个就行
 */
export const loginIn = params => {
	return axios.post(apiText + '/userAccount/pcLogin', params)
};
/**
 * 绑定手机号
 */
export const bindMobileFun = params => {
	return axios.post(apiText + '/userAccount/bindMobile', params)
};

/**
 * 用户注册提交
 */
export const registerFun = params => {
	return axios.post(apiText + '/userAccount/newRegister', params)
};
/**
 * 根据手机号修改密码等完善资料
 */
export const modifyAccountFun = params => {
	return axios.post(apiText + '/userAccount/modifyAccount', params)
};

/**
 * 头像上传
 */
export const photoUploadFun = params => {
	return axios.post(apiText + '/userAccount/photoUpload', params)
};

/**
 * 查询消息总量
 */
export const userMsgCountFun = toUserCode => {
	return axios.get(apiText + '/systemMsg/msgCount?toUserCode=' + toUserCode)
};

/**
 * banner
 */
export const bannerListFun = params => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/pcBanner/pcBannerList',
			method: 'get',
			params
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

/**
 * 建材仓首页分类
 */
export const materialTypesFun = () => {
	return axios.get(apiText + '/shopClassification/getMaterialShopClassificationListAndMaterialShopLabelList')
};

/**
 * 建材仓首页分类卡片，推荐商家列表
 */
export const materialCarkTypesFun = () => {
	return axios.get(apiText + '/shopClassification/getMaterialShopLabelListAndPcMateerialBanner')
};

/**
 * 建材仓首页分类
 */
export const queryMaterialByKeyWord = (parameter, type) => {
	// return axios.get(apiText + '/index/pcJCCsuggestNew?keyToken=' + keyToken + '&city=' + city)
	return axios.get(apiText + '/search/getParameterAssociate?parameter=' + parameter + '&type=' + type)
};

/**
 * 根据userCode获取用户信息(最新接口)
 */
export const userCodeFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/userAccount/personalCenter',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 建材仓首页新入驻供货商
 */
export const queryNewsMaterialShopFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/materialShop/newestMaterialShop',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};


/**
 * 建材仓首页常见问题
 */
export const queryQuestionFun = () => {
	return axios.get(apiText + '/pcFaq/list');
};

/**
 * 建材仓商家信息信息
 */
export const queryShopInfoFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/materialShop/queryContent',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 建材仓商家材料信息
 */
export const queryShopProductFun = (shopId) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/materialShop/queryContent',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};


/**
 * 建材仓首页推荐商家
 */
export const queryRecommendShopFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/materialShop/pcRecommend',
			method: 'get',
			params
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

/**
 * 建材仓材料详情
 * 材料ID
 */
export const queryMaterialDetailFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getProductDetail',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 建材仓材料搜索联想词分类与品牌
 *
 */
export const brandSuggestFun = (keyWord, city) => {
	return axios.get(apiText + '/shopClassification/pcGetTypeAndBrandByKeyWord?keyWord=' + keyWord + '&city=' + city)
};
/**
 * 建材仓商家搜索结果，根据大分类获取对应的标签
 *
 */
export const labeTypeFun = (id) => {
	return axios.get(apiText + '/shopClassification/labelListByType?id=' + id)
};
/**
 * 建材仓商铺搜索商铺
 *
 */
export const addShopInfo = (keyword, start, inquirySheetId, classification) => {
	return axios.get(apiText + '/materialShop/pcSearchShop?keyword=' + keyword + '&start=' + start + '&inquirySheetId=' + inquirySheetId + '&classification=' + classification)
};
/**
 * 建材仓全部商铺列表
 *
 */
export const shopAllInfo = (start, userCode, inquirySheetId) => {
	return axios.get(apiText + '/materialShop/pcInquirySheetShops?start=' + start + '&userCode=' + userCode + '&inquirySheetId=' + inquirySheetId)
};
/**
 * 建材仓用户收货地址列表
 * 20200305修改
 */
export const userAddressFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/deliveryAddress/list',
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
	});
};

/**
 * 建材仓常购材料列表
 *
 */
export const regularPurchaseFun = (userCode, start) => {
	return axios.get(apiText + '/detailedAccount/pcSelectByUserCode?start=' + start + '&userCode=' + userCode)
};
/**
 * 建材仓常购材料列表（无分页--用于打印）
 *
 */
export const oftenShopPrintListFun = (userCode) => {
	return axios.get(apiText + '/detailedAccount/all?userCode=' + userCode)
};

/**
 * 建材仓材料搜索结果
 *
 */
export const keyWordMaterialFun = (params) => {
	return axios.post(apiText + '/index/keyWordMaterialListNew', params)
};

/**
 * 建材仓商家搜索结果
 *
 */
export const keyWordShopListFun = (params) => {
	return axios.post(apiText + '/index/keyWordShopListNew', params)
};

/**
 * 建材仓个人中心添加常购清单
 *
 */
export const addOftenMaterialFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/detailedAccount/add',
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

/**
 * 建材仓个人中心删除常购清单材料
 *
 */
export const delMaterialFun = (id, userCode) => {
	return axios.get(apiText + '/detailedAccount/deleteById?id=' + id + '&userCode=' + userCode)
};

/**
 * 建材仓个人中心批量删除常购清单材料
 *
 */
export const delMulMaterialFun = (params) => {
	return axios.post(apiText + '/detailedAccount/deletematerialDetailedAccountsByIds', params)
};


/**
 * 建材仓个人中心我的询价单列表
 *
 */
export const queryMyInquiryListFun = (params) => {
	return axios.post(apiText + '/inquirySheet/pcSelectByStatusMore', params)
};

/**
 * 建材仓个人中心我的询价单详情
 *
 */
export const queryInquiryDetailFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquirySheet/queryById',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 建材仓个人中心取消询价单
 *
 */
export const cancelInquiryFun = (userCode, inquirySheetId) => {
	return axios.get(apiText + '/inquirySheet/cancelInquirySheet?userCode=' + userCode + '&inquirySheetId=' + inquirySheetId)
};

/**
 * 建材仓询价单提交
 *
 */
export const inquiryAddFun = (params) => {
	return axios.post(apiText + '/inquirySheet/add', params)
};

/**
 * 个人中心我的询价单--报价单详情
 *
 */
export const quoteDetailFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquirySheet/selectQuoteSheet',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 单图片上传
 *
 */
export const picUploadFun = (params) => {
	return axios.post(apiText + '/file/uploadImg', params)
};

/**
 * 建材仓--收藏店铺
 */
export const shopCollectFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/shopCollection/addCollection',
			method: 'get',
			params
		}).then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	});
};

/**
 * 建材仓--取消店铺收藏
 */
export const cancelShopCollectFun = (userCode, shopId) => {
	return axios.get(apiText + '/shopCollection/minusCollection?userCode=' + userCode + '&shopId=' + shopId)
};


/**
 * 建材仓--材料收藏
 * userode:""
 * id:材料ID
 */
export const materialCollectFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/addCollection',
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
	});
};
/**
 * 建材仓商家搜索结果校验能否询价
 */
export const isInquiryFun = (userCode) => {
	return axios.get(apiText + '/inquirySheet/queryIsInquiry?userCode=' + userCode)
};
/**
 * 根据token获取用户信息
 */
export const userInfoFun = (token) => {
	return axios.get(apiText + '/userAccount/loginByToken?token=' + token)
};

/**
 * 建材仓--取消材料收藏
 * userode:""
 * id:材料ID
 */
export const cancelMaterialCollectFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/minusCollection',
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
	});
};
/**
 * 建材仓--材料单位列表
 */
export const unitListFun = () => {
	return axios.get(apiText + '/unit/list')
};
/**
 * 根据userCode获取认证信息
 */
export const certificationInfoFun = (userCode) => {
	return axios.get(apiText + '/userAccount/certificationInfo?userCode=' + userCode)
};
/**
 * 账户资料-手机号码更新
 */
export const updateMobileFun = (params) => {
	return axios.post(apiText + '/userAccount/updateMobile', params)
};
/**
 * 个人认证判断姓名身份证银行卡是否正确
 */
export const threeElementVerifyFun = (params) => {
	return axios.post(apiText + '/fdd/threeElementVerify', params)
};
/**
 * fdd（账户设置）判断企业名称是否认证过
 */
export const companyNameRegisterFun = (companyName) => {
	return axios.get(apiText + '/fdd/isRegister?companyName=' + companyName)
};
/**
 * fdd（账户设置）企业初级认证
 */
export const primaryCertifyFun = (params) => {
	return axios.post(apiText + '/fdd/primaryCertification', params)
};
/**
 * fdd（账户设置）获取企业认证的信息
 */
export const autherInfoFun = (userCode) => {
	return axios.get(apiText + '/fdd/queryFddCompanyCertification?userCode=' + userCode)
};
/**
 * fdd（账户设置）深度认证
 */
export const dapthCertifyFun = (params) => {
	return axios.post(apiText + '/fdd/companyRemittanceVerify', params)
};
/**
 * fdd（账户设置）企业认证信息查看
 */
export const queryInfoFun = (userCode) => {
	return axios.get(apiText + '/fdd/queryInfo?userCode=' + userCode)
};
/**
 * fdd（账户设置）企业深度认证判断对公银行账号打款信息的次数与金额是否正确
 */
export const checkMoneyFun = (userCode, money) => {
	return axios.get(apiText + '/fdd/checkMoney?userCode=' + userCode + '&money=' + money)
};
/**
 * 企业购买次数的支付宝URL
 */
export const getQrCodeFun = (params) => {
	return axios.post(apiText + '/alipay/getQrCodeInfo', params)
};

/**
 * 账户设置资料新增收货地址或者修改收货地址id(只有修改时传)
 */
export const addAddressFun = (params) => {
	return axios.post(apiText + '/deliveryAddress/addOrUpdate', params)
};
/**
 * 账户设置资料把地址设置为默认
 */
export const setDefaultFun = (userCode, id) => {
	return axios.get(apiText + '/deliveryAddress/setDefault?userCode=' + userCode + '&id=' + id)
};
/**
 * 账户设置资料删除收货地址
 */
export const deleteAddressFun = (id) => {
	return axios.get(apiText + '/deliveryAddress/delete?id=' + id)
};

/**
 * 账户设置资料删除收货地址
 */
export const addOrderFun = params => {
	return axios.post(apiText + '/materialOrderSheet/pcAdd', params)
};

/**
 * 个人中心我的采购订单
 */
export const orderListFun = params => {
	return axios.post(apiText + '/materialOrderSheet/pcQueryByKeywordMore', params)
};

/**
 * 个人中心我收藏的商铺
 */
export const collectShopFun = (userCode, start) => {
	return axios.get(apiText + '/shopCollection/queryCollection?userCode=' + userCode + '&start=' + start)
};

/**
 * 个人中心我收藏的材料
 */
export const collectMaterialFun = (userCode, start) => {
	return axios.get(apiText + '/materialCollection/queryCollection?userCode=' + userCode + '&start=' + start)
};

/**
 * 个人中心删除我收藏的店铺
 */
export const delCollectionShopFun = (userCode, shopId) => {
	return axios.get(apiText + '/shopCollection/minusCollection?userCode=' + userCode + '&shopId=' + shopId)
};

/**
 * 个人中心删除我收藏的材料
 */
export const delCollectionMaterialFun = (userCode, id) => {
	return axios.get(apiText + '/materialCollection/minusCollection?userCode=' + userCode + '&id=' + id)
};

/**
 * 个人中心我的询价账户
 */
export const queryMyInquiryAccountFun = (userCode, start) => {
	return axios.get(apiText + '/inquiryRecord/pcSelectByUserCode?userCode=' + userCode + '&start=' + start)
};

/**
 * 开通城市
 */
export const queryOpenCityFun = () => {
	return axios.get(apiText + '/openCity/queryOpenCityList')
};

/**
 * 个人中心批量删除我收藏的材料--暂时不用
 */
export const delMulCollectMaterialFun = (params) => {
	return axios.post(apiText + '/materialCollection/deleteBatch', params)
};

/**
 * 批量删除收藏店铺--暂时不用
 */
export const delMulCollectShopFun = (params) => {
	return axios.post(apiText + '/shopCollection/deleteBatch', params)
};

/**
 * 查询可购买的询价次数列表
 */
export const queryInquiryProductListFun = (type, userCode) => {
	return axios.get(apiText + '/appProduct/listByType?type=' + type + '&userCode=' + userCode)
};

/**
 * 支付宝收银台
 */
export const payByAlipayFun = (params) => {
	return axios.post(apiText + '/alipay/alipayPagePay', params)
};

/**
 * 系统消息
 */
export const querySysMsgFun = (toUserCode, start) => {
	return axios.get(apiText + '/systemMsg/pcGetNewMsg?toUserCode=' + toUserCode + '&start=' + start)
};

/**
 * 询价采购
 */
export const queryMaterialMsgFun = (toUserCode, start) => {
	return axios.get(apiText + '/systemMsg/pcGetJCCMsg?toUserCode=' + toUserCode + '&start=' + start)
};

/**
 * 客服信息
 */
export const queryServiceInfoFun = () => {
	return axios.get(apiText + '/userService/query?type=kefu')
};

/**
 * 取消采购单
 */
// export const cancelOrderFun = (orderId, userCode, cancelReason) => {
// 	return axios.get(apiText + '/materialOrderSheet/cancelMaterialOrderSheet?orderId=' + orderId + '&userCode=' + userCode + '&cancelReason=' + cancelReason)
// };

/**
 * 新的取消采购单(get请求IE传汉字会导致请求报错)
 */
export const cancelOrderNewFun = (params) => {
	return axios.post(apiText + '/materialOrderSheet/pcCancelMaterialOrderSheet', params)
};


/**
 * 删除采购单
 */
export const delOrderFun = (orderId, userCode) => {
	return axios.get(apiText + '/materialOrderSheet/deteleMaterialOrderSheet?orderId=' + orderId + '&userCode=' + userCode)
};


/**
 * 采购单详情
 */
export const orderDetailFun = (orderId) => {
	return axios.get(apiText + '/materialOrderSheet/queryMaterialOrderSheet?orderId=' + orderId)
};
/**
 * 建材仓添加商品的所有商铺
 */
export const allShopsFun = (start, userCode) => {
	return axios.get(apiText + '/materialShop/getpcInquirySheetShops?start=' + start + '&userCode=' + userCode)
};
/**
 * 建材仓添加商品的收藏的商铺
 */
export const collectionFun = (start, userCode) => {
	return axios.get(apiText + '/materialShop/getpcInquirySheetShopsCollection?start=' + start + '&userCode=' + userCode)
};
/**
 * 建材仓添加商品询过价的商铺
 */
export const contactFun = (start, userCode) => {
	return axios.get(apiText + '/materialShop/getpcInquirySheetShopsContact?start=' + start + '&userCode=' + userCode)
};
/**
 * 个人中心发送给其它商家
 */
export const sendSellerFun = (params) => {
	return axios.post(apiText + '/inquirySheet/forward', params)
};
/**
 * 询价单根据常购材料的id查询材料对应的信息
 */
export const ofenShopMaterialFun = (ids) => {
	return axios.get(apiText + '/detailedAccount/queryByIds?ids=' + ids)
};
/**
 * 现金购买询价次数
 */
export const moneyPayFun = (params) => {
	return axios.post(apiText + '/integral/getTimes', params)
};
/**
 * 我的收益个人积分与现金账户
 */
export const cashPointsFun = (userCode) => {
	return axios.get(apiText + '/integral/queryInfo?userCode=' + userCode)
};
/**
 * 我的收益积分兑换现金
 */
export const exchangeCashFun = (params) => {
	return axios.post(apiText + '/integral/exchangeCash', params)
};
/**
 * 我的收益积分与现金的列表页type=0积分，type=1现金
 */
export const cashPointsListFun = (userCode, start, type) => {
	return axios.get(apiText + '/integral/pcQueryByUserCode?userCode=' + userCode + '&start=' + start + '&type=' + type)
};
/**
 * 我的收益申请提现
 */
export const applicationCashFun = (params) => {
	return axios.post(apiText + '/applyWithdrawCash/addApply', params)
};
/**
 * 我的收益-我的邀请的数量
 */
export const myInvitationNumFun = (userCode) => {
	return axios.get(apiText + '/materialShop/myInvite?userCode=' + userCode)
};
/**
 * 我的收益-我的邀请的每项的列表
 */
export const myInvitationListFun = (userCode) => {
	return axios.get(apiText + '/materialShop/inviteList?userCode=' + userCode)
};
/**
 * 个人中心-意见反馈提交
 */
export const feedBackFun = (params) => {
	return axios.post(apiText + '/feedBack/saveFeedBack', params)
};
/**
 * 个人中心-意见反馈列表f
 */
export const feedBackListFun = (userCode) => {
	return axios.get(apiText + '/feedBack/queryFeedBack?userCode=' + userCode)
};
/**
 * 根据大分类的Id获取大分类的名称
 */
export const queryName = (id) => {
	return axios.get(apiText + '/shopClassification/queryNameById?id=' + id)
};

/**
 * 信息价列表
 */
export const getPriceListFun = params => {
	return axios.post(apiText + '/materialPrice/pcQueryMaterial', params)
};

/**
 * 信息价期次
 */
export const queryYearFun = (id) => {
	return axios.get(apiText + '/materialPeriod/queryYear?cityid=' + id)
};

/**
 * 信息价分类
 */
export const materialTypeListFun = (id) => {
	return axios.get(apiText + '/materialType/list?issue=' + id)
};

/**
 * 信息价材料详情
 */
export const materialPriceDetailFun = (id) => {
	return axios.get(apiText + '/materialPrice/content?id=' + id)
};

/**
 * 帮助中心问题分类列表
 */
export const questionListTypeFun = () => {
	return axios.get(apiText + '/pcFaq/allType')
};

/**
 * 帮助中心热门问题
 */
export const questionListHotFun = (id) => {
	return axios.get(apiText + '/pcFaq/hot?id=' + id)
};

/**
 * 帮助中心问题详情
 */
export const questiodetailFun = (id) => {
	return axios.get(apiText + '/pcFaq/content?id=' + id)
};

/**
 * 积分商城商品列表
 */
export const queryGoodsFun = (sort, type, userCode) => {
	return axios.get(apiText + '/commercialActivities/list?sort=' + sort + '&type=' + type + '&userCode=' + userCode)
};

/**
 * 积分商城商品详情
 */
export const queryGoodsDetailFun = (id) => {
	return axios.get(apiText + '/commercialActivities/detail?id=' + id)
};

/**
 * 积分商城积分兑换礼品时校验验证码
 */
export const validateOrderSmsCodeFun = (params) => {
	return axios.post(apiText + '/integralOrderSheet/validateOrderSmsCode', params)
};

/**
 * 积分商城积分兑换礼品生成订单
 */
export const addVipOrderFun = (params) => {
	return axios.post(apiText + '/integralOrderSheet/add', params)
};


/**
 * 积分商城积分兑换礼品支付
 */
export const payVipOrderFun = (params) => {
	return axios.post(apiText + '/integralOrderSheet/pay', params)
};

/**
 * 积分商城订单列表
 */
export const vipOrderListFun = (params) => {
	return axios.post(apiText + '/integralOrderSheet/pcOrderSheetList', params)
};

/**
 * 取消积分商城订单
 */
export const cancelVipOrderFun = (userCode, orderId) => {
	return axios.get(apiText + '/integralOrderSheet/cancel?userCode=' + userCode + '&orderId=' + orderId);
};

/**
 * 积分商城订单确认收货
 */
export const confirmVipOrderFun = (orderId) => {
	return axios.get(apiText + '/integralOrderSheet/affirm?orderId=' + orderId);
};

/**
 * 积分商城订单确认收货
 */
export const vipOrderDetailFun = (orderId) => {
	return axios.get(apiText + '/integralOrderSheet/content?orderId=' + orderId);
};

/**
 * 资讯分类
 */
export const queryNewsTypeListFun = () => {
	return axios.get(apiText + '/newsType/queryNewsTypeList');
};

/**
 * 查询资讯
 */
export const queryInfoByTypeFun = (type, start) => {
	return axios.get(apiText + '/information/pcQueryInfoByType?type=' + type + '&start=' + start);
};

/**
 * 查询资讯详情
 */
export const detailInfoByIdFun = (id, userCode) => {
	return axios.get(apiText + '/information/detailInfoById?id=' + id + '&userCode=' + userCode);
};

/**
 * 热门资讯
 */
export const informationHotFun = () => {
	return new Promise((resolve, reject) => {
		axios.get(apiText + '/information/hot').then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	})
};
/**
 * 商家搜索结果八大分类
 * */
export const bigClassificationFun = () => {
	return axios.get(apiText + '/shopClassification/list');
};
/**
 * 商家搜索结果根据关键字获取分类标签与品牌type:1材料，type:2店铺
 * */
export const getTypeAndBrandAndLabelFun = (params) => {
	return axios.post(apiText + '/shopClassification/pcGetTypeAndBrandAndLabelByKeyWord', params)
};
/**
 * 根据大分类获取相关品牌
 * */
export const getLabelBrandFun = () => {
	return axios.get(apiText + '/shopClassification/queryBrandByLabelId');
};

/**
 * 根据userCode获取卖家信息
 */
export const getSellerFun = userCode => {
	return axios.get(apiText + '/materialUserAccount/queryByUserCode?userCode=' + userCode);
};
/**
 *
 * 书籍一级目录
 */
export const bookParentTypeFun = () => {
	return axios.get(apiText + '/book/queryOneClass');
};

/**
 * 书籍根据一级目录查找二级目录
 */
export const bookSecondTypeFun = (topBookId) => {
	return axios.get(apiText + '/book/newqueryTwoClassByOneClass?topBookId=' + topBookId);
};

/**
 * 根据小分类查询书籍或图集
 */
export const bookListFun = (bookTypeId, userCode, start) => {
	return axios.get(apiText + '/book/pcQueryBooksByTwoClass?bookTypeId=' + bookTypeId + '&userCode=' + userCode + '&start=' + start);
};

/**
 * 收藏书籍
 */
export const bookAddFavourFun = (bookId, userCode) => {
	return axios.get(apiText + '/book/addFavouriteBooks?bookId=' + bookId + '&userCode=' + userCode);
};


/**
 * 取消收藏书籍
 */
export const bookCancelFavourFun = (bookId, userCode) => {
	return axios.get(apiText + '/book/minusFavouriteBooks?bookId=' + bookId + '&userCode=' + userCode);
};

/**
 * 书籍目录
 */
export const bookChapterFun = (bookId) => {
	return axios.get(apiText + '/chapters/newqueryChaptersByBookId?bookId=' + bookId);
};

/**
 * 书籍内容返回html格式
 */
export const bookContentFun = (bookId) => {
	return axios.get(apiText + '/chapters/queryUrlByBookId?bookId=' + bookId);
};

/**
 * 图集内容返回图片url
 */
export const imageContentFun = (bookId) => {
	return axios.get(apiText + '/chapters/newqueryChaptersByBookId?bookId=' + bookId);
};

/**
 * 根据城市查询书籍
 */
export const queryBooksByCityFun = (userCode, twoClass, start) => {
	return axios.get(apiText + '/book/pcQueryBooksByCity?userCode=' + userCode + '&twoClass=' + twoClass + '&start=' + start);
};

/**
 * 搜索书籍和图集
 */
export const queryBooksBySearchNameFun = (params) => {
	return axios.post(apiText + '/book/pcQueryBooksByName', params);
};

/**
 * 书籍正文中查询书籍名称
 */
export const queryBookNameByPostIdFun = (postId) => {
	return axios.get(apiText + '/book/queryBookNameByPostId?postId=' + postId);
};

/**
 * 我收藏的书籍
 * */
export const queryCollectBookFun = (userCode, start) => {
	return axios.get(apiText + '/book/pcQueryFavouriteBooks?userCode=' + userCode + '&start=' + start);
};


/**
 * 我收藏的书籍
 * */
export const getPriceCity = () => {
	return axios.get(apiText + '/materialCity/queryProvinceList');
};


/**
 * 多账号--使用中的员工账号
 * */
export const getEmployeeListFun = (userCode) => {
	return axios.get(apiText + '/fdd/employeeList?userCode=' + userCode)
}


/**
 * 多账号--使用中的员工账号
 * */
export const addEmployeeSendSmsCodeFun = (params) => {
	return axios.post(apiText + '/fdd/sendSmsCode', params)
}

/**
 * 多账号--查询要添加的账号的状态
 * */
export const queryAccountStateFun = (mobile) => {
	return axios.get(apiText + '/fdd/validateMobile?mobile=' + mobile)
}


/**
 * 多账号--添加新的员工账号
 * */
export const addEmployeeAccountFun = (params) => {
	return axios.post(apiText + '/fdd/addEmployee', params)
};


/**
 * 多账号--转让授权
 * */
export const setNewManagerFun = (oldUserCode, newUserCode) => {
	return axios.get(apiText + '/fdd/setNewManager?oldUserCode=' + oldUserCode + '&newUserCode=' + newUserCode)
};


/**
 * 多账号--解除关联/退出公司
 * */
export const unBindAccountFun = (userCode) => {
	return axios.get(apiText + '/fdd/quitCompany?userCode=' + userCode)
};


/**
 * 多账号--重新关联
 * */
export const reBindAccountFun = (params) => {
	return axios.post(apiText + '/fdd/addAgain', params)
};

/**
 * 多账号--企业认证
 * */
export const companyAuthenteFun = (params) => {
	return axios.post(apiText + '/fdd/newCertification', params)
};
/**
 * 多账号--公司名称联想面板
 * */
export const companyNameFun = (keyword) => {
	return axios.get(apiText + '/fdd/queryCompanyName?keyword=' + keyword)
};
/**
 * 多账号--企业是否认证过
 * */
export const queryRegisterFun = (companyName) => {
	return axios.get(apiText + '/fdd/queryRegister?companyName=' + companyName)
};
/**
 * 多账号--是否可以退出公司
 * */
export const signOutFun = (userCode) => {
	return axios.get(apiText + '/fdd/queryQuit?userCode=' + userCode)
};
/**
 * 多账号--识别营业执照
 * */
export const judgeLicenseFun = (licenseImageUrl) => {
	return axios.get(apiText + '/fdd/ocrPic?licenseImageUrl=' + licenseImageUrl)
};
/**
 * 多账号--识别营业执照
 * */
export const checkIdentityFun = (params) => {
	return axios.post(apiText + '/fdd/twoElementVerify', params)
};
/**
 * 微信支付
 * */
export const weChatPayFun = (params) => {
	return axios.post(apiText + '/wechatPay/nativePay', params)
};
/**
 * 消息最新3条未读
 * */
export const newsFun = (toUserCode) => {
	return axios.get(apiText + '/systemMsg/pcNewestMsg?toUserCode=' + toUserCode)
};
/**
 * 消息中心-单条消息设置为已读消息
 * */
export const newsReadFun = (toUserCode, id) => {
	return axios.get(apiText + '/systemMsg/pcSetIsRead?toUserCode=' + toUserCode + '&id=' + id)
};
/**
 * 消息中心-删除单条消息
 * */
export const newsDeleFun = (toUserCode, id) => {
	return axios.get(apiText + '/systemMsg/deleteMsgById?toUserCode=' + toUserCode + '&id=' + id)
};
/**
 * 消息中心-系统或询价消息全部设为已读
 * */
export const newsReadAllFun = (toUserCode, openType) => {
	return axios.get(apiText + '/systemMsg/pcSetIsReadAll?toUserCode=' + toUserCode + '&openType=' + openType)
};
/**
 * 消息中心-系统或询价消息全部删除
 * */
export const newsDelAllFun = (toUserCode, openType) => {
	return axios.get(apiText + '/systemMsg/deleteMsgByOpenType?toUserCode=' + toUserCode + '&openType=' + openType)
};
/**
 * 登录---扫码轮询登录
 * */
export const sweepCodeFun = (key) => {
	return axios.get(apiText + '/userAccount/qrPollingLogin?key=' + key)
};

/**
 * 登录---获取二维码sessionId
 * */
export const codeSessionIdFun = () => {
	return axios.get(apiText + '/userAccount/putGuid')
};


/****************2019-07-24 改版后 新接口*****************/
//查询材料默认分类
export const getMaterialClass = () => {
	return new Promise((resolve, reject) => {
		axios.get(apiText + '/search/getDefaultClassification').then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	})
};

//首页分类查询
export const getMaterialClassByIndex = () => {
	return new Promise((resolve, reject) => {
		axios.get(apiText + '/search/getDefaultClassificationNew').then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	})
};

//首页分类卡片
export const getMaterialClassByIndexCard = () => {
	return new Promise((resolve, reject) => {
		axios.get(apiText + '/firstPageModule/recommend').then(res => {
			if (res.result === 'success')
				resolve(res);
			else
				reject(res.msg)
		}).catch(error => {
			reject(error)
		})
	})
};


//根据搜索关键字查询商品分类
export const getMaterialClassByKeyWord = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getClassificationByParameter',
			method: 'get',
			params
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

//材料列表
export const getMaterialList = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/indexProductSearch',
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

// 账户设置资料获取省市区的json
export const getAreaCityFun = () => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/areaCity/getAllArea',
			method: 'get',
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

// 商铺搜索页中获取品牌列表
export const getBrandFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getBrandList',
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

// 商铺搜索页中 分类
export const getShopClass = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getShopClassificationByParameter',
			method: 'get',
			params
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

// 商铺搜索页中 分类
export const getShopList = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/indexShopSearch',
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

//询价单列表
export const getInquiryList = () => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquirySheet/getIndexInquiry',
			method: 'get'
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

//实时数据
export const getLiveData = () => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquirySheet/getInquiryInfo',
			method: 'get',
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

//问题列表
export const getAnswer = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/pcFaq/getRoleType',
			method: 'get',
			params
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

//问题列表
export const getShopClassList = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getGroupInfo',
			method: 'get',
			params
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

//添加商城订单
// fix by 2.3.1
export const addMallOrder = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/addOrders',
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

//添加商品到进货单
export const addCart = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/cart/addProductCart',
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


//进货单列表
export const querycartList = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/cart/getProductCartList',
			method: 'get',
			params
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

//删除进货单
export const delCartItem = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/cart/batchDel',
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

//更新进货单商品数量
export const updateCartItemNum = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/cart/updateCartProductNum',
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

//采购单列表
export const queryPurchaseList = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/getOrderList',
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

//取消订单
export const cancelOrderFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/closeOrder',
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

//添加订单异常
export const addExecptionToOrder = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/addException',
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

//取消订单异常
export const cancelExecptionToOrder = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/closeException',
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

//确认收货
export const confirmGoodReceive = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/goodsReceiving',
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

//订单详情
export const queryOrderDetail = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/getOrderDetail',
			method: 'get',
			params
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

//发货单详情
export const queryDeliveryOrderDetail = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/getInvoiceDetail',
			method: 'get',
			params
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

//评价订单
export const rateOrder = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/orderEvaluate',
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

//评价订单
export const queryInquiryHallList = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquiry/getInquiryHall',
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

//询价大厅--询价单详情
export const queryInquiryHallDetail = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/inquirySheet/getInquiryDetail',
			method: 'get',
			params
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

//订单支付
export const orderPayFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/orderPayment',
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

//协议
export const getProtocolInfoFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getProtocolInfo',
			method: 'get',
			params
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

/****************2019-09-23 店铺详情/商品详情/提交评价 需求调整*****************/

//其他人在看
export const otherWatchFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/othersWatching',
			method: 'get',
			params
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

//同类商品
export const guessLikeFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/sameClassProducts',
			method: 'get',
			params
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

//评价列表
export const getProductEvaluateListFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/search/getProductEvaluateList',
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

//评价时获取订单材料
export const getOrderMaterialForEvaluateFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/getOrderProducts',
			method: 'get',
			params
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

//评价订单和材料
export const evaluateOrderAndMaterialFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/order/evaluate',
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

//评价订单和材料图片上传(接口可传多图)
export const uploadImgBatchFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/file/uploadImgMore',
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

//店铺图集
export const queryShopAtlasFun = (params) => {
	return new Promise((resolve, reject) => {
		axios({
			url: apiText + '/materialShop/storeAtlas',
			method: 'get',
			params
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

/**
 * 双乾图片上传接口
 *
 */
export const sqPicUploadFun = (params) => {
	return axios.post('/payCenter/sqpay/uploadImg', params)
};

/**
 * 获取双乾商户号
 */
export const getSqBusinessNoFun = (data) => {
	return new Promise((resolve, reject) => {
		axios({
			url: '/payCenter/sqpay/queryMerchNo',
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

/**
 * 双乾认证
 */
export const sqAuthFun = (data) => {
	return axios({
		url: '/payCenter/sqpay/auth',
		method: 'post',
		data
	})
};

/***************************公共方法*****************************/
//把时间戳转换成时间格式
export function timeToString(timestamp) {
	const now = new Date().getTime();
	const oldDay = new Date(timestamp);
	const disMinute = (now - timestamp) / 1000;

	if (disMinute < 3600) {
		return parseInt(disMinute / 3600) + '分钟前';
	} else if (disMinute < (24 * 3600)) {
		return parseInt(disMinute / 3600) + '小时前';
	} else if (disMinute >= 24 * 3600 && disMinute < 48 * 3600) {
		return '昨天';
	} else if (disMinute > 48 * 3600) {
		return (oldDay.getMonth() + 1).toString().padStart(2, '0') + '月' + oldDay.getDate().toString().padStart(2, '0') + '日';
	} else {
		return oldDay.getFullYear() + '年' + (oldDay.getMonth() + 1).toString().padStart(2, '0') + '月' + oldDay.getDate().toString().padStart(2, '0') + '日';
	}
}

export function timestampToTime(timestamp) {
	let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	let Y = date.getFullYear() + '-';
	let M = (date.getMonth() + 1).toString().padStart(2, '0') + '-';
	let D = date.getDate().toString().padStart(2, '0') + ' ';
	let h = date.getHours().toString().padStart(2, '0') + ':';
	let m = date.getMinutes().toString().padStart(2, '0');
	//let s = date.getSeconds();
	return Y + M + D + h + m;
};

export function outputmoney(val) {
//金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
	let str = (val / 100).toFixed(2) + '';
	let intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',');//取到整数部分
	let dot = str.substring(str.length, str.indexOf('.')); //取到小数部分搜索
	//let ret = intSum + dot;
	return intSum + dot;
}

export function networkTime(time) {
	let returnObj = {}, hasUseTime = (time - new Date().getTime()) / 1000;
	// 1 时 = 3600秒 1分 = 60秒
	if (hasUseTime < 60) {
		if (hasUseTime < 0) {
			returnObj = '0秒';
		} else {
			returnObj = parseInt(hasUseTime).toString().padStart(2, '0') + '秒';
		}
		return returnObj;
	} else if (hasUseTime >= 60 && hasUseTime <= 3600) {
		let minute = parseInt(hasUseTime / 60).toString().padStart(2, '0');
		let second = parseInt(hasUseTime - minute * 60).toString().padStart(2, '0');
		return minute + '分钟' + second + '秒';
	} else if (hasUseTime > 3600 && hasUseTime <= 3600 * 24) {
		let hour = parseInt(hasUseTime / 3600).toString().padStart(2, '0');
		let minute = parseInt((hasUseTime - hour * 3600) / 60).toString().padStart(2, '0');
		let second = parseInt(hasUseTime - hour * 3600 - minute * 60).toString().padStart(2, '0');
		returnObj = hour + '小时' + minute + '分钟' + second + '秒';
		return returnObj;
	} else if (hasUseTime > 3600 * 24) {
		let day = parseInt(hasUseTime / (24 * 3600)).toString().padStart(2, '0');
		let hour = parseInt((hasUseTime - day * 24 * 3600) / 3600).toString().padStart(2, '0');
		let minute = parseInt((hasUseTime - day * 24 * 3600 - hour * 3600) / 60).toString().padStart(2, '0');
		let second = parseInt(hasUseTime - day * 24 * 3600 - hour * 3600 - minute * 60).toString().padStart(2, '0');
		returnObj = day + '天' + hour + '小时' + minute + '分钟' + second + '秒';
		return returnObj;
	}
}

