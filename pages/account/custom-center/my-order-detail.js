// 用户中心
import React from 'react'
import {withRouter} from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, Table, Divider, Modal, Input, message, Card, Row, Col, Avatar} from 'antd';
// import ImInfo from 'component/ImInfo'
import NumericInput from 'components/NumericInput'
import {baseUrl, iconUrl} from 'config/evn'
import {
	vipOrderDetailFun,
	timestampToTime,
	cancelVipOrderFun,
	cashPointsFun,
	sendSmsCode,
	validateOrderSmsCodeFun,
	payVipOrderFun,
	userCodeFun,
	confirmVipOrderFun,
	queryServiceInfoFun,
	networkTime
} from 'server'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MyMallOrderDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			cash: 0,
			points: 0,
			changToMoney: 0,
			keyWord: '',
			showMoneyPay: false,
			isShowConfirm: false,
			showErrorTip: false,
			showUseMoneyToPay: false,
			showConnect: 'none',
			orderInfo: {},
			goodInfo: {},
			phone: '',
			cutOffTime: '',
			curOrderId: '',//this.props.match.params.id,
			neteaseUserId: ''
		}
	}

	componentDidMount() {
		this.queryInquiryDetail();
		this.getCashPoints();
		this.getMobile();
		this.queryServiceInfo();
	}

	queryInquiryDetail() {
		let id = this.props.router.query.id;
		vipOrderDetailFun(id).then(res => {
			if (res.result === 'success') {
				this.setState({
					orderInfo: res.data,
					goodInfo: res.data.goods[0],
					cutOffTime: networkTime(res.data.endTime)
				}, () => {
					this.timer = setInterval(() => {
						this.setState({
							cutOffTime: networkTime(res.data.endTime)
						})
					}, 1000)
				});
			}
		})
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

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

	/**
	 * 获取用户手机号码
	 * */
	getMobile = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
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
	 * 显示取消采购单提示框，并给当前操作的ID赋值
	 **/
	showCancelOrderModal(id) {
		this.setState({
			curOrderId: id,
			isShowCancelConfirm: true
		})
	}

	/**
	 * 取消订单
	 **/
	cancelOrder = () => {
		cancelVipOrderFun(this.userCode, this.props.router.query.id).then(res => {
			this.setState({
				isShowCancelConfirm: false
			}, () => {
				message.info('取消采购单成功！');
				this.queryInquiryDetail()
			})
		})
	};

	pay = (curOrderId) => {
		let {goodInfo} = this.state;
		let totalPoint = goodInfo.credits * goodInfo.quantity;//总共需要支付的积分

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
				this.setState({
					showMoneyPay: true,
					curOrderId: curOrderId
				});
				this.getSmsCode();
			}
		});
	};

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
						orderId: this.props.router.query.id,//this.state.curOrderId
					};
					payVipOrderFun(params).then(res => {
						if (res.result === 'success') {
							message.success('兑换成功');
							this.setState({
								showErrorTip: false,
								showMoneyPay: false
							});
							this.queryInquiryDetail();
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

	showConfirmOrderModal = (curOrderId) => {
		this.setState({
			curOrderId: curOrderId,
			isShowConfirm: true
		})
	};

	/**
	 * 确认收货
	 * */
	confirmOrder = () => {
		confirmVipOrderFun(this.props.router.query.id).then(res => {
			if (res.result === 'success') {
				this.setState({
					isShowConfirm: false
				});
				this.queryInquiryDetail();
			}
		})
	};

	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	/*-----获取客服----*/
	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					neteaseUserId: res.data[0].neteaseUserId
				})
			}
		})
	}

	payByCash = () => {
		this.setState({
			showUseMoneyToPay: false,
			showMoneyPay: true,
		});

		this.getSmsCode();
	};

	render() {
		const {orderInfo, goodInfo, cutOffTime} = this.state;
		return (
			<Layout title="个人中心" menuIndex={'9'} mainMenuIndex={'home'}>
				<section className="bg-white p4">
					{(() => {
						switch (orderInfo.status) {
							case '1':
								return <h2 className="p2 text-grey" style={{background: '#cfe6d8'}}> 当前订单状态：<b>待支付</b></h2>;
							case '2':
								return <h2 className="p2 text-grey" style={{background: '#cfe6d8'}}> 当前订单状态：<b>待处理</b></h2>;
							case '3':
								return <Row className="h2 p2 text-grey" style={{background: '#f0f5fe'}}>
									<Col span={12}>当前订单状态：<b>待收货</b></Col>
									<Col span={12} className="text-right h5">您还有 <b>{cutOffTime}</b> 来完成确认收货</Col>
								</Row>;
							case '4':
								return <h2 className="p2 text-grey" style={{background: '#e6e6e6'}}> 当前订单状态：<b>已完成</b></h2>;
							case '5':
								return <h2 className="p2 text-muted" style={{background: '#e6e6e6'}}> 当前订单状态：<b>已取消</b></h2>;
						}
					})()}
					<h4 className="mt3 prl2">
						<i>{orderInfo.consigneeName}</i>
						<i className="prl1">{orderInfo.consigneePhone}</i>
					</h4>
					<h4
						className="mt2 prl2">{orderInfo.consigneeProvince}{orderInfo.consigneeCity}{orderInfo.consigneeArea}{orderInfo.consigneeAddress}</h4>
					<h4 className="inquiry-detail-smalltitle text-grey prl2">商品信息</h4>
					{/* 详细报价 */
					}
					<Card className="mt2" bordered={false}>
						<div className="prl2 ptb3 bg-lightgrey">
							<Row type="flex" align="bottom">
								<Col span={20}>
									{
										goodInfo.productImages ?
											<Avatar shape="square" src={baseUrl + goodInfo.productImages} size={106} style={{float: 'left'}} /> :
											<Avatar shape="square" src="images/default-header.png" size={106} style={{float: 'left'}} />
									}
									<div style={{float: 'left', marginLeft: '17px'}}>
										<h4 className="text-grey">
											{goodInfo.productName}
										</h4>
										<h4 className="text-muted mt4"><span className="h6">X</span>{goodInfo.quantity}</h4>
										<h4 className="text-muted mt1">{goodInfo.credits}积分</h4>
									</div>
								</Col>
								<Col span={4} className="text-right">
									合计：<span style={{color: '#f66f6a'}} className="h2">{orderInfo.amount}</span>
									<span style={{color: '#f66f6a'}} className="h4"> 积分</span>
								</Col>
							</Row>
						</div>
					</Card>
					{/* 订单信息 */}
					<h4 className="inquiry-detail-smalltitle text-grey prl2">订单信息</h4>
					<div
						className="prl2 mt3">
						<h5 className="text-grey"> 订单编号：{this.state.orderInfo.orderCode}</h5>
						<h5 className="text-grey mt2"> 创建时间：{timestampToTime(this.state.orderInfo.createTime)}</h5>
						<h5
							className={`text-grey mt2 ${orderInfo.status === '2' || orderInfo.status === '3' || orderInfo.status === '4' ? 'block' : 'hide'}`}>
							支付时间：{timestampToTime(this.state.orderInfo.payTime)}
						</h5>
						<h5 className={`text-grey mt2 ${orderInfo.status === '3' || orderInfo.status === '4' ? 'block' : 'hide'}`}>
							处理时间：{timestampToTime(this.state.orderInfo.handleTime)}
						</h5>
						<h5 className={`text-grey mt2 ${orderInfo.status === '4' ? 'block' : 'hide'}`}>
							完成时间：{timestampToTime(this.state.orderInfo.finishTime)}
						</h5>
						<h5 className={`text-grey mt2 ${orderInfo.status === '5' ? 'block' : 'hide'}`}>
							取消时间：{timestampToTime(this.state.orderInfo.cancelTime)}
						</h5>
					</div>
					<div className="menu-panel mt4 text-center">
						<Button className={`border-circle ${orderInfo.status === '5' ? 'hide' : 'show'}`}
						        onClick={() => {
							        this.setState({
								        showConnect: 'block',
							        })
						        }}
						>
							<IconFont type="iconfont-kefu" className="text-primary" />联系客服
						</Button>
						<Button type="warn"
						        className={`border-circle prl1 ${orderInfo.status === '1' || orderInfo.status === '2' ? 'show' : 'hide'}`}
						        onClick={() => this.showCancelOrderModal(orderInfo.orderId)}
						>
							取消订单
						</Button>
						<Button type="primary"
						        className={`border-circle ${orderInfo.status === '1' ? 'show' : 'hide'}`}
						        onClick={() => this.pay(orderInfo.orderId)}>
							去支付
						</Button>
						<Button type="info"
						        className={`border-circle ${orderInfo.status === '3' ? 'show' : 'hide'}`}
						        onClick={() => this.showConfirmOrderModal(orderInfo.orderId)}>
							确认收货
						</Button>
					</div>
				</section>
				{/*取消订单弹框*/}
				<Modal
					visible={this.state.isShowCancelConfirm}
					onOk={this.cancelOrder}
					onCancel={() => {
						this.setState({isShowCancelConfirm: false})
					}}
					okText="确认"
					cancelText="取消"
				>
					<h2 className="text-center mt3">确定取消订单？</h2>
				</Modal>
				{/*确认收货*/}
				<Modal
					visible={this.state.isShowConfirm}
					onOk={this.confirmOrder}
					onCancel={() => {
						this.setState({isShowConfirm: false})
					}}
					okText="确认"
					cancelText="取消"
				>
					<h2 className="text-center mt3">请收到货后，再确认收货！ 并确保货品完好！ ？</h2>
				</Modal>
				{/*输入验证码*/}
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
				{/*<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />*/}
			</Layout>
		)
	}
}

export default withRouter(MyMallOrderDetail)
