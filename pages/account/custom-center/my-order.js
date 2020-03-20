// 用户中心
import React from 'react'
import Layout from 'components/Layout/account'
import {Button, Col, Icon, Modal, Pagination, Row, Table, message, Form, Input, Divider, Card, Avatar} from 'antd';
import {baseUrl, iconUrl} from 'config/evn'
import Link from 'next/link'
import {
	vipOrderListFun,
	cancelVipOrderFun,
	cashPointsFun,
	sendSmsCode,
	validateOrderSmsCodeFun,
	payVipOrderFun,
	userCodeFun,
	confirmVipOrderFun,
	queryServiceInfoFun
} from 'server'
import cookie from 'react-cookies';
import NumericInput from 'components/NumericInput'
import {saveAs, s2ab} from 'config/export'
import './style.less'
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MallOrder extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			reload: 0,
			total: 0,
			curPage: 0,
			cash: 0,
			points: 0,
			changToMoney: 0,
			keyWord: '',
			showMoneyPay: false,
			isShowConfirm: false,
			showUseMoneyToPay: false,
			myOrderList: [],
			phone: '',
			curOrderId: '',
			status: '',
			showConnect: 'none',
			neteaseUserId: '',
			pagination: {
				defaultPageSize: 16,
				showQuickJumper: true,
				total: 0,
				onChange: this.onCurPageChange
			}
		}
	}

	componentDidMount() {
		this.vipOrderList();
		this.getCashPoints();
		this.getMobile();
		this.queryServiceInfo();
	}

	/**
	 * 订单列表
	 * */
	vipOrderList() {
		let params = {
			userCode: this.userCode,
			start: this.state.curPage,
			status: this.state.status,
			keyWord: this.state.keyWord
		};
		vipOrderListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					myOrderList: res.data.list,
					total: res.data.count
				})
			}
		})
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
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		this.setState({
			curPage: page - 1
		}, () => {
			this.vipOrderList();
		});
	};

	/**
	 * 改变订单单状态
	 **/
	changeInquiryStatus = (curStatus) => {
		this.setState({
			status: curStatus
		}, () => {
			this.vipOrderList();
		})
	};

	keyWordChange = (e) => {
		this.setState({
			keyWord: e.target.value
		})
	};

	/**
	 * 显示取消订单提示框，并给当前操作的ID赋值
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
		cancelVipOrderFun(this.userCode, this.state.curOrderId).then(res => {
			this.setState({
				isShowCancelConfirm: false
			}, () => {
				message.info('取消采购单成功！');
				//更新用户账户信息
				this.getCashPoints();
				this.vipOrderList()
			})
		})
	};

	pay = (curOrderId) => {
		let goodInfo = {};
		this.state.myOrderList.forEach((item, index) => {
			if (item.orderId === curOrderId) {
				goodInfo = item;
			}
		});
		let totalPoint = goodInfo.goods[0].credits * goodInfo.goods[0].quantity;//总共需要支付的积分

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
					showUseMoneyToPay: true,
					curOrderId: curOrderId
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
			showMoneyPay: false,
			reload: 1
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
							this.setState({
								showMoneyPay: false,
								reload: 1
							});
							message.success('兑换成功');
							this.vipOrderList();
							this.getCashPoints();
						}
					});
				} else {
					this.setState({
						showErrorTip: true,
						reload: 0
					})
				}
			})
		} else {
			this.setState({
				showErrorTip: false,
				reload: 0
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
		confirmVipOrderFun(this.state.curOrderId).then(res => {
			if (res.result === 'success') {
				this.setState({
					isShowConfirm: false
				});
				this.vipOrderList();
				this.setState({
					showMoneyPay: false
				})
			}
		})
	};
	/*----关闭聊天框----*/
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	/*-----获取客服----*/
	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			//console.log('客服', res)
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
		return (
			<Layout title="我的订单" mainMenuIndex={'home'} menuIndex={'9'}>
				<section className="bg-white" style={{paddingBottom: '30px'}}>
					<div className="my-inquiry-tab">
						<a onClick={() => this.changeInquiryStatus('')} className={this.state.status === '' ? 'active' : 'text-muted'}>全部</a>
						<a onClick={() => this.changeInquiryStatus('1')} className={this.state.status === '1' ? 'active' : 'text-muted'}>待支付</a>
						<a onClick={() => this.changeInquiryStatus('2')} className={this.state.status === '2' ? 'active' : 'text-muted'}>待处理</a>
						<a onClick={() => this.changeInquiryStatus('3')} className={this.state.status === '3' ? 'active' : 'text-muted'}>待收货</a>
						<a onClick={() => this.changeInquiryStatus('4')} className={this.state.status === '4' ? 'active' : 'text-muted'}>已完成</a>
						<a onClick={() => this.changeInquiryStatus('5')} className={this.state.status === '5' ? 'active' : 'text-muted'}>已取消</a>
					</div>
					<div className="text-right prl3 mt3">
						<label style={{marginRight: '10px'}}>查询</label>
						<Input style={{width: '255px'}} size="large" placeholder="请输入订单编号或商品名" onChange={this.keyWordChange} />
						<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginLeft: '24px', width: '100px'}}
						        onClick={() => this.vipOrderList()}>查询</Button>
					</div>
					{
						this.state.myOrderList.length ?
							this.state.myOrderList.map((item, index) => {
								return (
									<Card className="mt3" bodyStyle={{padding: '20px 0 0 0'}} key={index} style={{margin: '0 30px'}}>
										{/*<Link href={`/mallorderdetail/${item.orderId}`}>*/}
										<Link href={{pathname: '/account/custom-center/my-order-detail', query: {id: item.orderId}}}>
											<div className="prl3">
												<Row type="flex" align="middle">
													<Col span={12}>
														<h5 className="text-grey"><span className="text-muted">订单单号</span> <span>{item.orderCode}</span></h5>
													</Col>
													<Col span={12} className="text-right">
														{(() => {
															switch (item.status) {
																case '1':
																	return <h4 className="text-primary">待支付</h4>;
																case '2':
																	return <h4 className="text-primary">待处理</h4>;
																case '3':
																	return <h4 className="text-info">待收货</h4>;
																case '4':
																	return <h4 className="text-muted">已完成</h4>;
																case '5':
																	return <h4 className="text-muted">已取消</h4>;
															}
														})()}
													</Col>
												</Row>
												<Row className="mt3" type="flex" align="middle">
													<Col span={12}>
														<Avatar shape="square" size={68} src={baseUrl + item.goods[0].productImages} style={{float: 'left'}} />
														<h4 className="text-grey prl1" style={{width: '300px', marginLeft: '17px', float: 'left'}}>
															{item.goods[0].productName}
														</h4>
													</Col>
													<Col span={12} className="text-right">
														<h4 className="text-muted"><span className="h6">X</span>{item.goods[0].quantity}</h4>
														<h3 className="mt1">
															<span className="text-grey">{item.goods[0].credits}</span>
															<span className="text-muted h4"> 积分</span>
														</h3>
													</Col>
												</Row>
											</div>
										</Link>
										<Row className="prl3 ptb1 mt3 bg-lightgrey" type="flex" align="middle">
											<Col span={12} className="h4">
												<span className='text-muted'>合计</span>
												<span style={{color: '#f66f6a'}} className="h2"> {item.amount}</span>
												<span style={{color: '#f66f6a'}}> 积分</span>
											</Col>
											<Col span={12} className="text-right">
												<div className="menu-panel">
													<Button type='primary' ghost
													        className={`border-radius ${item.status === '5' ? 'hide' : 'show'}`}
													        onClick={() => {
														        this.setState({
															        showConnect: 'block'
														        })
													        }}
													>
														<IconFont type="iconfont-kefu" className="text-primary" />联系客服
													</Button>
													<Button type="primary"
													        className={`border-radius bg-primary-linear prl1 ${item.status === '1' || item.status === '2' ? 'show' : 'hide'}`}
													        onClick={() => this.showCancelOrderModal(item.orderId)}
													>
														取消订单
													</Button>
													<Button type="primary"
													        className={`border-radius bg-primary-linear ${item.status === '1' ? 'show' : 'hide'}`}
													        onClick={() => this.pay(item.orderId)}>
														去支付
													</Button>
													<Button type="info"
													        className={`border-radius bg-primary-linear ${item.status === '3' ? 'show' : 'hide'}`}
													        onClick={() => this.showConfirmOrderModal(item.orderId)}>
														确认收货
													</Button>
												</div>
											</Col>
										</Row>
									</Card>
								)
							})
							:
							<aside className="text-center ptb6">
								<div><img src='/static/images/icon-nodata.png' alt="" /></div>
								<h3 className="mt3 text-muted">暂无数据！</h3>
							</aside>
					}
					<Pagination
						{...this.state.pagination}
						hideOnSinglePage={true}
						className="mt2 prl3"
						style={{textAlign: 'right', marginBottom: '30px'}}
						onChange={this.onCurPageChange}
					/>
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
						<NumericInput onChange={(value) => this.onChange(value)} length={4} reset={this.state.reload} />
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
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />
			</Layout>
		)
	}
}
