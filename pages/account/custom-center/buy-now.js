// 用户中心
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, message, Radio, Row, Col, Modal} from 'antd';
import NumericInput from 'components/NumericInput/index'
import {iconUrl, baseUrl, payUrl} from 'config/evn'
import {
	queryInquiryProductListFun,
	userCodeFun,
	sendSmsCode,
	moneyPayFun,
	weChatPayFun
} from 'server'
import cookie from 'react-cookies';
import './style.less'
//import QRCode from 'qrcode'

const QRCode = require('qrcode.react');
const RadioGroup = Radio.Group;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MyInquiryAccount extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			payResult: '',
			productList: [],
			companyBuyList: [{
				count: 2,
				desc: '',
				price: 2.00,
				productId: 2,
				times: 1,
				type: 1
			}],
			curPage: 0,
			curType: 0,
			selectType: '',
			money: 0,
			paySelectValue: 1,
			payDisabled: true,
			moneyDisabled: true,
			balance: false,
			num: 0,
			selectMoney: 0,
			payDes: false,
			mobile: '',
			showMoneyPay: false,//现金支付弹窗
			isAuthPri: 0,//企业认证状态
			phone: '',
			showWetChatPay: false,//微信支付弹窗
			wetChatUrl: ''
		}
	}

	componentDidMount() {
		this.queryInquiryProductList();
		this.getMoney();
	}

	/**
	 * 获取询价次数商品列表
	 * */
	queryInquiryProductList() {
		queryInquiryProductListFun(1, this.userCode).then(res => {
			if (res.result === 'success') {
				let data = res.data;
				if (res.data[0].count !== 0) {
					data = res.data.slice(1)
				}
				this.setState({
					productList: data
				})
			}
		})
	}

	payByAlipay = () => {
		const {paySelectValue} = this.state;
		if (!this.state.selectType) {
			message.error('请选择一个产品！');
			return false;
		}
		if (paySelectValue === 1) {
			//支付宝支付
			let params = {
				userCode: this.userCode,
				productId: this.state.selectType,
			};
			// let newBaseUrl = baseUrl.substring(0, baseUrl.length - 8);
			window.location.href = `${payUrl}/alipay/payPage.html?userCode=${this.userCode}&productId=${this.state.selectType}`
			// window.location.href = `http://192.168.199.240/alipay/payPage.html?userCode=${this.userCode}&productId=${this.state.selectType}`
			//
			// payByAlipayFun(params).then(res => {
			//   if (res.result === "success") {
			//     const newTab = window.open();
			//     const div = document.createElement('div');
			//     div.innerHTML = res.msg;
			//     newTab.document.body.appendChild(div);
			//     newTab.document.forms.punchout_form.submit();
			//   }
			// })
		} else if (paySelectValue === 2) {
			//现金支付
			this.getSmsCode();
			this.setState({
				showMoneyPay: true
			})
		} else if (paySelectValue === 3) {
			this.getWetChatUrl();
		}
	};

	selectType(id, price, num) {
		if (this.state.money >= price) {
			this.setState({
				moneyDisabled: false,
				balance: false
			})
		} else {
			this.setState({
				balance: true,
				moneyDisabled: true,
				paySelectValue: 1
			})
		}
		this.setState({
			selectType: id,
			payDisabled: false,
			payDes: true,
			num: num,
			selectMoney: price
		})
	}

	/**
	 * 获取现金余额
	 * */
	getMoney = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				let phone = res.data.mobile.substring(3, 9);
				this.setState({
					money: res.data.money,
					mobile: res.data.mobile,
					isAuthPri: res.data.isAuthPri,
					phone: res.data.mobile.replace(phone, '******')
				})
			}
		})
	};

	/*---选择不同的支付方式----*/
	onChangePay = (e) => {
		this.setState({
			paySelectValue: e.target.value,
		});
	};
	/**
	 * 关闭现金支付弹窗
	 * */
	closeMoneyPay = () => {
		this.setState({
			showErrorTip: false,
			showMoneyPay: false
		})
	};
	/*----获取验证-----*/
	getSmsCode = () => {
		let params = {
			mobile: this.state.mobile,
			order: 'order'
		};
		sendSmsCode(params).then(res => {
			if (res.result === 'success') {
			}
		})
	};
	/**
	 * 输入验证码时判断验证码是否正确
	 * */
	onChange = (value) => {
		if (value.length >= 4) {
			let data = {
				userCode: this.userCode,
				productId: this.state.selectType,
				verifyCode: value,
			};
			moneyPayFun(data).then(res => {
				if (res.result === 'success') {
					Router.push('/account/custom-center/buy-result')
					// this.props.history.push(`/paysuccess`)
				} else {
					this.setState({
						showErrorTip: true
					})
				}
			})
		} else {
			this.setState({
				showErrorTip: false
			})
		}
	};
	/*---获取微信支付的二维码---*/
	getWetChatUrl = () => {
		let params = {
			userCode: this.userCode,
			productId: this.state.selectType,
		};
		weChatPayFun(params).then(res => {
			//console.log("微信订单",res);
			if (res.result === 'success') {
				this.setState({
					wetChatUrl: res.msg
				}, () => {
					//微信支付
					this.setState({
						showWetChatPay: true
					})
				})
			}

		})
	};

	render() {
		const {isAuthPri} = this.state;
		return (
			<Layout menuIndex={'6'} mainMenuIndex={'home'} title="购买询价次数">
				<section className="bg-white prl3 ptb5 text-center">
					<h2>询价次数购买</h2>
					<aside className="mt6 ptb1" style={{width: '676px', margin: '0 auto'}}>
						{
							isAuthPri ?
								<div style={{height: '110px'}}>
									{
										this.state.companyBuyList.map((item, index) => {
											return (
												<div className={`buy-price-card ${this.state.selectType === item.productId ? 'active' : ''}`}
												     onClick={() => this.selectType(item.productId, item.price, item.times)} key={index}>
													<h2 className="text-grey">{item.times}<span className="text-muted h5">次</span></h2>
													<h1 className="price"><span className="h5">￥</span>{item.price}</h1>
												</div>
											)
										})
									}
								</div>
								:
								<div style={{height: '230px'}}>
									{
										this.state.productList.map((item, index) => {
											return (
												<div className={`buy-price-card ${this.state.selectType === item.productId ? 'active' : ''}`}
												     onClick={() => this.selectType(item.productId, item.price, item.times)} key={index}>
													<h2 className="text-grey">{item.times}<span className="text-muted h5">次</span></h2>
													<h1 className="price"><span className="h5">￥</span>{item.price}</h1>
													<span className={`flag ${item.price === 0.01 ? 'show' : 'hide'}`}>体验版</span>
												</div>
											)
										})
									}
								</div>
						}
					</aside>
					<section style={{width: '676px', margin: '0 auto'}} className="text-left">
						<RadioGroup onChange={this.onChangePay} value={this.state.paySelectValue} className="mt10">
							<Radio value={1} disabled={this.state.payDisabled}>
								<IconFont type="iconfont-alipay" style={{color: '#00aaef', marginRight: '10px', verticalAlign: 'middle'}} className="h0" />
								支付宝
							</Radio>
							<Radio value={2} disabled={this.state.moneyDisabled}>
								<IconFont type="iconfont-coinpay" className="text-primary h0" style={{marginRight: '10px', verticalAlign: 'middle'}} />现金账户
								<span className="text-muted">(余额&nbsp;:&nbsp;{this.state.money}元)</span>
								{
									this.state.balance ?
										<span style={{color: '#f5222d'}} className="h5">&nbsp;余额不足</span>
										: null
								}
							</Radio>
							<Radio value={3} disabled={this.state.payDisabled}>
								<IconFont type="iconfont-weixin-copy" style={{color: '#00aaef', marginRight: '10px', verticalAlign: 'middle'}} className="h0" />
								微信支付
							</Radio>
						</RadioGroup>
						<Row className="mt5">
							<Col span={16}>
								{
									this.state.payDes ?
										<div style={{marginBottom: '16px'}}>
											<span className="h4">已选择：</span>
											<span className="h3">{this.state.num}次</span>
											<span className="h4" style={{marginLeft: '10px'}}>应付金额：</span>
											<span className="h3" style={{color: '#f97f27'}}><b>{this.state.selectMoney}元</b></span>
										</div>
										: null
								}
								<span className="text-muted show h5">支付过程中如有问题，请致电400-893-8990，或联系在线客服</span>
							</Col>
							<Col span={8} className="text-right toPay">
								<Button size="large" type="primary" className="bg-primary-linear border-radius" style={{width: '160px', height: '50px'}}
								        onClick={this.payByAlipay}>
									去付款
								</Button>
							</Col>
						</Row>
					</section>
					<Modal
						visible={this.state.showMoneyPay}
						centered
						onCancel={this.closeMoneyPay}
						footer={[
							<Button key="submit" type="primary" size="large" onClick={this.closeMoneyPay}>取消</Button>,
						]}
					>
						<h4 className="prl6 ptb3 text-center">
							已向您的手机号码<b>{this.state.phone}</b>发送短信验证码，请输入验证码完成支付
						</h4>
						<div className="smsCodeInputMask">
							<NumericInput onChange={(value) => this.onChange(value)} length={4} />
						</div>
						<h5 className="text-center mt2" style={{color: '#f5222d', height: '16px'}}>
							{this.state.showErrorTip ? '手机验证码不正确' : ''}
						</h5>
					</Modal>
					<Modal
						visible={this.state.showWetChatPay}
						centered
						closable={false}
						maskClosable={false}
						okText={'查看账户'}
						cancelText={'关闭'}
						onOk={() => this.props.history.push(`/inquiryaccount`)}
						//onCancel={() => {this.setState({showWetChatPay: false});this.queryInquiryProductList()}}
						onCancel={() => {
							this.setState({showWetChatPay: false});
							window.location.reload();
						}}
					>
						<div className="smsCodeInputMask">
							<Row>
								<Col span={12}>
									<QRCode value={this.state.wetChatUrl} />
								</Col>
								<Col span={12} className="ptb4 h4">
									<span>付款金额:</span>
									<span className="text-warning h2">{this.state.selectMoney}元</span>
								</Col>
							</Row>
						</div>
					</Modal>
				</section>
			</Layout>
		)
	}
}
