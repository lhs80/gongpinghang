import React from 'react'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/mall'
import {Col, Icon, Row, Tag, Button, Input, Divider, Modal, message} from 'antd';
import MaterialAddAdress from 'components/MaterialAddAdress'
import Address from 'components/address'
import NumericInput from 'components/NumericInput'
import {baseUrl, iconUrl} from 'config/evn'
import {
	queryGoodsDetailFun,
	userAddressFun,
	cashPointsFun,
	sendSmsCode,
	userCodeFun,
	validateOrderSmsCodeFun,
	payVipOrderFun,
	addVipOrderFun
} from 'server'
import cookie from 'react-cookies';
import './style.less'

const InputGroup = Input.Group;

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MallOrder extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			userAddNewAddressId: -1,
			showAddress: 'none',
			visible: false,
			showMoneyPay: false,
			showUseMoneyToPay: false,
			goodInfo: {},
			curAddress: null,
			buyNum: cookie.load('num'),
			cash: 0,
			changToMoney: 0,
			points: 0,
			phone: '',
			showErrorTip: false,
			curOrderId: ''
		}
	}

	componentDidMount() {
		if (!this.userCode || this.userCode === 'guest') Router.push('/login/index');
		this.queryGoodDetail();
		this.getDefaultAddress();
		this.getCashPoints();
		this.getMobile();
	}

	componentDidUpdate(prevProps) {
		if (!this.userCode || this.userCode === 'guest') Router.push('/login/index');
		if (prevProps.router.query.id !== this.props.router.query.id)
			this.queryGoodDetail();
	}

	/**
	 * 材料详情
	 * */
	queryGoodDetail() {
		queryGoodsDetailFun(Number(this.props.router.query.id)).then(res => {
			if (res.result === 'success') {
				this.setState({
					goodInfo: {
						...res.data
					}
				});
			}
		})
	}

	/**
	 * 用户收货地址
	 * */
	getDefaultAddress = () => {
		let params = {
			userCode: this.userCode
		};
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				res.data.forEach((item, index) => {
					if (item.id === this.state.userAddNewAddressId || item.isDefault === '1') {
						this.setState({
							curAddress: item
						})
					}
				})
			}
		})
	};

	getCashPoints = () => {
		cashPointsFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					cash: res.data.money,
					points: res.data.integral
				})
			}
		})
	};

	changeBuyNum = (type) => {
		if (type === 'add') {
			this.setState({
				buyNum: ++this.state.buyNum
			})
		} else if (type === 'sub') {
			if (this.state.buyNum - 1 < 1) {
				return false;
			}
			this.setState({
				buyNum: --this.state.buyNum
			})
		}
	};

	/*---接收子组件收货地址的display----*/
	selectOtherAddress = (status) => {
		this.setState({
			showAddress: status
		})
	};

	selectAddressInfo = (info, status) => {
		this.setState({
			curAddress: info[0],
			showBtn: true,
			showAddress: status
		});
	};

	addNewAddress = (status, id) => {
		this.setState({
			visible: false,
			userAddNewAddressId: id
		}, this.getDefaultAddress())
	};

	pay = () => {
		let totalPoint = this.state.goodInfo.credits * this.state.buyNum;//总共需要支付的积分
		this.setState({
			changToMoney: (totalPoint - this.state.points) / 10
		}, () => {
			if (this.state.points < totalPoint && this.state.cash < this.state.changToMoney) {
				Modal.warn({
					title: '提示',
					content: '您的积分余额不足',
				});
			} else if (this.state.points < totalPoint && this.state.cash > this.state.changToMoney) {
				this.setState({
					showUseMoneyToPay: true
				})
			} else if (this.state.points > totalPoint) {
				//积分充足，生成订单，向用户发送验证码，进行支付
				let params = {
					userCode: this.userCode,
					consigneeName: this.state.curAddress.userName,
					consigneePhone: this.state.curAddress.userPhone,
					consigneeProvince: this.state.curAddress.province,
					consigneeCity: this.state.curAddress.city,
					consigneeArea: this.state.curAddress.area,
					consigneeAddress: this.state.curAddress.address,
					amount: this.state.buyNum * this.state.goodInfo.credits,
					goods: [{
						cid: this.props.router.query.id,
						quantity: this.state.buyNum
					}]
				};
				addVipOrderFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							showMoneyPay: true,
							curOrderId: res.data
						});
						this.getSmsCode();
					}
				});
			}
		});
	};

	/**
	 * 发送短信验证码
	 * */
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
	 * 关闭现金支付弹窗
	 * */
	closeMoneyPay = () => {
		this.setState({
			showErrorTip: false,
			showMoneyPay: false
		}, () => {
			Router.push('/account/custom-center/my-order');
		})
	};

	/**
	 * 获取用户手机号码
	 * */
	getMobile = () => {
		userCodeFun(this.userCode).then(res => {
			if (res.result === 'success') {
				let phone = res.data.mobile.substring(3, 9);
				this.setState({
					mobile: res.data.mobile,
					phone: res.data.mobile.replace(phone, '******')
				})
			}
		})
	};

	/**
	 * 输入验证码时判断验证码是否正确
	 * */
	onChange = (value) => {
		if (value.length >= 4) {
			let params = {
				mobile: this.state.mobile,
				verifyCode: value
			};
			validateOrderSmsCodeFun(params).then(res => {
				if (res.result === 'success') {
					let params = {
						userCode: this.userCode,
						verifyCode: value,
						orderId: this.state.curOrderId
					};
					payVipOrderFun(params).then(res => {
						if (res.result === 'success') {
							message.success('兑换成功');
							window.location.replace('/account.html#/mallorder');
							this.setState({
								showMoneyPay: false
							})
						}
					});
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

	payByCash = () => {
		this.setState({
			showUseMoneyToPay: false,
		});
		let params = {
			userCode: this.userCode,
			consigneeName: this.state.curAddress.userName,
			consigneePhone: this.state.curAddress.userPhone,
			consigneeProvince: this.state.curAddress.province,
			consigneeCity: this.state.curAddress.city,
			consigneeArea: this.state.curAddress.area,
			consigneeAddress: this.state.curAddress.address,
			amount: this.state.buyNum * this.state.goodInfo.credits,
			goods: [{
				cid: this.goodId,
				quantity: this.state.buyNum
			}]
		};
		addVipOrderFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					showMoneyPay: true,
					curOrderId: res.data
				});
				this.getSmsCode();
			}
		});
	};

	render() {
		const {goodInfo, curAddress, points} = this.state;
		const buyNum = this.state.buyNum ? this.state.buyNum : 1;

		return (
			<Layout title="积分商城">
				<section style={{background: '#f1f5f0'}}>
					<section className="page-content-wrapper">
						<aside>
							<div className="bg-lightgrey text-muted mt2 prl3" style={{height: '40px', lineHeight: '40px'}}>选择收货地址</div>
							<div className="bg-white ptb4 prl5">
								{
									curAddress
										? <Row>
											<Col span={18}>
												<Tag color="green"
												     className={`border-circle h5 prl1 ${curAddress.isDefault === '1' ? 'show' : 'hide'}`}
												     style={{border: 'none'}}
												>
													默认地址
												</Tag>
												<h5 className="mt2">
													<span className="text-muted">收货人</span>
													<span className="prl1 text-grey">{curAddress.userName}</span>
												</h5>
												<h5 className="mt2">
													<span className="text-muted">联系方式</span>
													<span className="prl1 text-grey">{curAddress.userPhone}</span>
												</h5>
												<h5 className="mt2">
													<span className="text-muted">收货地址</span>
													<span className="prl1 text-grey">{curAddress.province}{curAddress.city}{curAddress.area}{curAddress.address}</span>
												</h5>
											</Col>
											<Col span={1}>
												<Divider type="vertical" style={{height: '100px'}} />
											</Col>
											<Col span={5}>
												<Button type="primary" size="large" onClick={() => this.setState({showAddress: 'block'})} ghost>切换地址</Button>
												<div className="mt3 text-info prl1" onClick={() => this.setState({visible: true})} style={{cursor: 'pointer'}}>
													<IconFont
														type="iconfont-tianjiaadd73"
														className="h3" style={{verticalAlign: 'middle'}}
													/>使用新地址
												</div>
											</Col>
										</Row>
										: <div className="text-center text-muted">
											<span>请完善收货地址！</span>
											<span className="prl1" onClick={() => this.setState({visible: true})} style={{cursor: 'pointer'}}>
														去添加
													</span>
										</div>
								}
							</div>
							<div className="prl3 mt2 bg-lightgrey">
								<Row className="text-muted" style={{height: '40px', lineHeight: '40px'}}>
									<Col span={8}>商品信息</Col>
									<Col span={8} className="text-center">市场价</Col>
									<Col span={4} className="text-center">数量</Col>
									<Col span={4} className="text-center">兑换积分</Col>
								</Row>
							</div>
							<div className="p4 bg-white">
								<Row type="flex" align="top">
									<Col span={8}>
										<Row>
											<Col span="8"><img src={baseUrl + goodInfo.productImages} alt="" width="106" style={{border: 'solid 1px #e2e2e2'}} /></Col>
											<Col span="14"><span className="h4 text-grey">{goodInfo.productName}</span></Col>
										</Row>
									</Col>
									<Col span={8} className="text-center">
										<span className="h4 text-muted">￥{goodInfo.settlement}</span>
									</Col>
									<Col span={4} className="text-center">
										<InputGroup compact>
											<Button type="default" size="small" style={{height: '32px'}} onClick={() => this.changeBuyNum('sub')}>-</Button>
											<Input value={buyNum} style={{width: '64px'}} className="text-center h4 text-grey" readOnly />
											<Button type="default" size="small" style={{height: '32px'}} onClick={() => this.changeBuyNum('add')}>+</Button>
										</InputGroup>
									</Col>
									<Col span={4} className="text-center" style={{color: '#f66f6a'}}>
										<span className="h2">{(goodInfo.credits ? goodInfo.credits : 0) * buyNum}</span> 积分
									</Col>
								</Row>
							</div>
							<div className="prl4 ptb3 bg-lightgrey">
								<h4 className="text-muted">支付方式</h4>
								<div className="h4 mt2">
									<IconFont type="iconfont-coinpay" className="h2 text-primary" />
									<span className="text-grey prl1">积分账户</span>
									<span className="text-muted">(剩余：{points}积分)</span>
								</div>
								<h5 className={`text-muted prl3 ${points < ((goodInfo.credits ? goodInfo.credits : 0) * buyNum) ? 'block' : 'hide'}`}>余额不足</h5>
							</div>
							<Divider style={{margin: '0'}} />
							<div className="prl4 ptb3 bg-lightgrey text-right">
								<h4 className="text-grey">
									<span>您将支付</span>
									<span className="h0" style={{color: '#f66f6a', marginLeft: '60px'}}>{(goodInfo.credits ? goodInfo.credits : 0) * buyNum}</span>
									<span className="h5" style={{color: '#f66f6a'}}> 积分</span>
								</h4>
								<Button type="primary" size='large' style={{width: '180px', height: '50px'}}
								        className="mt4 bg-primary-linear border-radius"
								        onClick={this.pay}>确认支付</Button>
							</div>
						</aside>
					</section>
				</section>
				{/*---选择收货地址----*/}
				<MaterialAddAdress
					isShowAddress={this.state.showAddress}
					showAddressModal={this.selectOtherAddress.bind(this)}
					selectAddresInfo={this.selectAddressInfo.bind(this)}
				/>
				{/*---新地址----*/}
				<Modal
					title="使用新地址"
					visible={this.state.visible}
					footer={null}
					width={560}
					onCancel={() => this.setState({visible: false})}
				>
					<Address changeBlackLast={this.addNewAddress} hideBtn={true} />
				</Modal>
				{/*---支付密码----*/}
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
				{/*提示使用现金支付*/}
				<Modal
					visible={this.state.showUseMoneyToPay}
					centered
					onCancel={() => {
						this.setState({
							showUseMoneyToPay: false
						})
					}}
					okText='确认支付'
					onOk={this.payByCash}
				>
					<h3 className="text-center mt4">您的积分余额不足，是否使用现金账户支付！</h3>
					<h5 className="text-center mt2">您将支付：{this.state.changToMoney}元</h5>
				</Modal>
			</Layout>
		)
	}
}

export default withRouter(MallOrder)
