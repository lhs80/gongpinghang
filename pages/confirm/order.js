// 用户中心
import React, {Fragment} from 'react'
import Router, {withRouter} from 'next/router'
import {iconUrl, baseUrl} from 'config/evn'
import {checkBank, checkPhone, checkTel, checkFreeTel} from 'config/regular'
import {addOrderFun, userAddressFun, addMallOrder, userCodeFun, querycartList} from 'server'
import Layout from 'components/Layout/index'
import GoodList from './components/GoodList'
import BillInfo from './components/Bill-Dialog/'
import AddressList from './components/Address-List/'
import {Icon, Button, Modal, message, Divider} from 'antd'
import cookie from 'react-cookies';
import './style.less'
import dynamic from 'next/dynamic'
import BillAddress from './components/Bill-Address-List';

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

class ConfirmOrder extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			productNum: 0,//商品总数，用于页面展示
			receiveAddrInfo: [],//收货地址列表
			billAddrInfo: [],//收票地址列表
			showConnect: 'none',
			orderAmount: 0,//商品总价，用于页面展示
			freightAmount: 0,//总运费，用于页面展示
			orderInfo: {
				deliveryId: -1,//收货地址ID
				invoiceDeliveryId: -1,//收票地址ID
				invoiceInfoId: -1,//发票ID
				orderList: [],
			}
		};
	}

	componentDidMount() {
		if (!this.userCode || this.userCode === 'guest') {
			Router.push('/login/index')
		}
		this.getCartList();
		this.getReceiveAddress();
		this.getBillAddress();
		// window.onbeforeunload = function (e) {
		// 	return ('确定离开当前页面吗？')
		// }
	}

	//收货地址列表
	getReceiveAddress = () => {
		let params = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			type: 0
		};
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let defaultAddress = res.data.filter(item => item.isDefault === '1');
				let {orderInfo} = this.state;
				orderInfo.deliveryId = defaultAddress[0] ? defaultAddress[0].id : -1;
				this.setState({
					receiveAddrInfo: res.data,
					orderInfo
				});
			}
		})
	};

	//收票地址列表
	getBillAddress = () => {
		let params = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			type: 1
		};
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let defaultAddress = res.data.filter(item => item.isDefault === '1');
				let {orderInfo} = this.state;
				orderInfo.invoiceDeliveryId = defaultAddress[0] ? defaultAddress[0].id : -1;
				this.setState({
					billAddrInfo: res.data,
					orderInfo
				});
			}
		})
	};

	//购物车里面的商品
	//从购物车页面传过来的是，用户选择的商品ID
	//查询数据库，根据传过来的ID，筛选出选中的商品
	getCartList = () => {
		let params = {
			userCode: this.userCode
		};
		let selectProductId = sessionStorage.getItem('zzjcpls');
		let {orderInfo} = this.state;
		let productNum = 0;
		let amount = 0;
		let freight = 0;
		querycartList(params).then(res => {
			let newList = JSON.parse(JSON.stringify(res.data));

			res.data.list.forEach((item, index) => {
				if (!item.list.length) {
					newList.list[index].splice(index, 1)
				}
				for (let i = item.list.length - 1; i >= 0; i--) {
					//遍历每个商品， 如果商品的cartId与用户选择的商品不一样，就从商品列表中删除这个商品
					if (selectProductId.indexOf(item.list[i].productCartId) < 0) {
						newList.list[index].list.splice(i, 1);
					}
				}
			});

			//遍历每个订单列表，如果商品列表中没有窗口，删除这个订单
			for (let j = newList.list.length - 1; j >= 0; j--) {
				if (newList.list[j].list.length === 0) {
					newList.list.splice(j, 1);
				}
			}

			newList.list.forEach((item, index) => {
				//给list新增字段orderAmount
				newList.list[index].orderAmount = 0;
				freight += item.freight;
				item.list.forEach((cartItem, key) => {
					productNum++;//商品总数
					if (this.props.router.query.type) {
						newList.list[index].type = this.props.router.query.type;
					}
					newList.list[index].userCode = this.userCode;
					newList.list[index].orderAmount += Number(cartItem.price) * Number(cartItem.num);
					amount += Number(cartItem.price) * Number(cartItem.num);
				});
			});
			orderInfo.orderList = newList.list;
			this.setState({
				orderInfo,
				productNum,
				orderAmount: amount,
				freightAmount: freight
			})
		}).catch(error => {
			message.error(error)
		})
	};

	//修改订单备注
	//e:备注内容
	//index:商品列表的索引
	orderNoteChange = (e, index) => {
		const {orderInfo} = this.state;
		orderInfo.orderList[index].orderNote = e.target.value;
		this.setState({
			orderInfo
		})
	};

	// fix by 2.3.1版本
	//修改订单运费
	//e:运费
	//index:商品列表的索引
	// freightChange = (e, index) => {
	// 	const {value} = e.target;
	// 	const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
	// 	if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
	// 		const {orderInfo} = this.state;
	// 		orderInfo.orderList[index].freight = value;
	// 		this.setState({
	// 			orderInfo
	// 		})
	// 	}
	// };

	submit = () => {
		if (this.state.orderInfo.deliveryId < 0) {
			if (!msgBox) {
				msgBox = message.error('请选择收货地址！', .5, () => {
					msgBox = null;
				});
			}
			return false;
		}

		if (this.state.orderInfo.invoiceInfoId > 0) {
			if (this.state.orderInfo.invoiceDeliveryId < 0) {
				if (!msgBox) {
					msgBox = message.error('请选择收票地址！', .5, () => {
						msgBox = null;
					});
				}
				return false;
			}
		}

		const {orderInfo} = this.state;
		let newOrderInfo = JSON.stringify(orderInfo)
			.replace(/num/g, 'quantity')
			.replace(/list/g, 'materialList')
			.replace(/price/g, 'unitPrice')
			.replace(/productName/g, 'name')
			.replace(/productSpecsId/g, 'specsId');
		addMallOrder(JSON.parse(newOrderInfo)).then(res => {
			Router.replace({pathname: '/account/purchase/home', query: {type: this.props.router.query.type}})
		}).catch(error => {
			if (!msgBox) {
				msgBox = message.error(error, .5, () => {
					msgBox = null;
				});
			}
		})
	};

	//关闭聊天窗口
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	connectCustomer = () => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block'
			})
		} else {
			Router.push('/login/index');
		}
	};

	// 子组件调用
	// 用户选择的收货地址ID
	onAddressChange = (id) => {
		const {orderInfo} = this.state;
		orderInfo.deliveryId = id;
		this.setState({
			orderInfo
		})
	};

	// 子组件调用
	// 用户选择的收票地址ID
	onBillAddressChange = (id) => {
		const {orderInfo} = this.state;
		orderInfo.invoiceDeliveryId = id;
		this.setState({
			orderInfo
		})
	};

	//子组件传过来的发票信息
	getBillId = (item) => {
		const {orderInfo} = this.state;
		orderInfo.invoiceInfoId = item.id;
		this.setState({
			orderInfo
		})
	};

	render() {
		const {orderInfo, receiveAddrInfo, billAddrInfo, productNum, orderAmount, freightAmount} = this.state;
		return (
			<Layout title="确认订单">
				<aside className="confirm-order-wrapper">
					{/*地址*/}
					<AddressList deliveryId={orderInfo.deliveryId}
					             addressList={receiveAddrInfo}
					             onAddressChange={this.onAddressChange}
					             getReceiveAddress={this.getReceiveAddress}
					/>
					{/*商品*/}
					<GoodList orderInfo={orderInfo}
						// freightChange={() => this.freightChange(e, index)}
						        orderNoteChange={(e, index) => this.orderNoteChange(e, index)}
					/>
					{/*发票*/}
					<BillInfo submit={(item) => this.getBillId(item)} />
					{/*发票地址*/}
					{
						orderInfo.invoiceInfoId >= 0 ?
							<BillAddress invoiceDeliveryId={orderInfo.invoiceDeliveryId}
							             onBillAddressChange={this.onBillAddressChange}
							             receiveAddrId={orderInfo.deliveryId}
							             receiveAddress={receiveAddrInfo}
							             billAddress={billAddrInfo}
							             getBillAddress={this.getBillAddress}
							/>
							:
							null
					}
					{/*结算*/}
					<div className="common-title">
						<Divider type="vertical" className="line" />
						结算信息
					</div>
					<div className="prl4 text-right">
						<span className="text-lightgrey prl6">{productNum}件商品，总计：</span>
						<span className="text-grey h2">
							<b>￥{parseFloat(orderAmount).toFixed(2)}</b>
						</span>
					</div>
					<div className="prl4 text-right mt1">
						<span className="text-lightgrey prl6">运费：</span>
						<span className="text-grey h2">
							<b>￥{parseFloat(freightAmount).toFixed(2)}</b>
						</span>
					</div>
					{/*页脚*/}
					<div className="footer">
						<span className="title">预计总金额：</span>
						<span className="money">￥{parseFloat(orderAmount + freightAmount).toFixed(2)}</span>
						<span className="btn-submit" onClick={this.submit}>提交订单</span>
					</div>
					{/*聊天窗口*/}
					<ImInfo showConnect={this.state.showConnect} userCode={orderInfo.shopUserCode} closeModal={this.closeModal} />
				</aside>
			</Layout>
		)
	}
}

export default withRouter(ConfirmOrder)
