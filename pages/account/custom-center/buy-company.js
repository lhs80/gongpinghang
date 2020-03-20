// 用户中心
import React from 'react'
import Layout from 'components/Layout/account'
import {Button, Icon, message, Radio, Row, Col} from 'antd';
import MoneyPay from 'components/MoneyPay'
import {iconUrl, baseUrl} from 'config/evn'
import {payByAlipayFun, userCodeFun, sendSmsCode} from 'server'
import cookie from 'react-cookies';

const RadioGroup = Radio.Group;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class CompanyInquiryAccount extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			productList: [
				{
					count: 2,
					desc: '',
					price: 200.00,
					productId: 2,
					times: 1,
					type: 1
				}
			],
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
		}
	}

	componentDidMount() {
		this.getMoney();
	}

	/**
	 * 获取询价次数商品列表
	 * */


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
				returnUrl: 'localhost:8081/account.html#/paysuccess'
			};
			payByAlipayFun(params).then(res => {
				if (res.result === 'success') {
					const newTab = window.open();
					const div = document.createElement('div');
					div.innerHTML = res.msg; // html code
					newTab.document.body.appendChild(div);
					newTab.document.forms.punchout_form.submit();
				}
			})
		} else if (paySelectValue === 2) {
			//现金支付
			this.getSmsCode()
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
				this.setState({
					money: res.data.money,
					mobile: res.data.mobile
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
	/*----关闭现金支付弹窗---*/
	closeMoneyPayModal = (status) => {
		this.setState({
			showMoneyPay: status
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
				this.setState({
					showMoneyPay: true
				});
			}
		})
	};

	render() {
		return (
			<Layout title="个人中心" mainMenuIndex={'home'} menuIndex={'6'}>
				<section className="bg-white text-center" style={{height: '766px'}}>
					<h2 className="mt6">询价次数购买</h2>
					<aside className="mt6 ptb1" style={{width: '676px', height: '230px', margin: '0 auto'}}>
						{
							this.state.productList.map((item, index) => {
								return (
									<div className={`buy-price-card ${this.state.selectType === item.productId ? 'active' : ''}`}
									     onClick={() => this.selectType(item.productId, item.price, item.times)} key={index}>
										<h2 className="text-grey">{item.times}<span className="text-muted h5">次</span></h2>
										<h1 className="price"><span className="h5">￥</span>2.00</h1>
									</div>
								)
							})
						}
					</aside>
					<section style={{width: '676px', margin: '0 auto'}} className="text-left">
						<RadioGroup onChange={this.onChangePay} value={this.state.paySelectValue}>
							<Radio value={1} disabled={this.state.payDisabled}>
								<IconFont type="iconfont-alipay" style={{color: '#00aaef', marginRight: '10px'}} className="h0" />
								支付宝
							</Radio>
							<Radio value={2} disabled={this.state.moneyDisabled}>
								<IconFont type="iconfont-coinpay" className="h0 text-primary" style={{marginRight: '10px'}} />现金账户
								<span className="text-muted">(余额&nbsp;:&nbsp;{this.state.money}元)</span>
								{
									this.state.balance ?
										<span style={{color: '#f5222d'}} className="h5">&nbsp;余额不足</span>
										: null
								}
							</Radio>
						</RadioGroup>
						<Row className="mt3">
							<Col span={16}>
								{
									this.state.payDes ?
										<div>
											<span className="h4">已选择&nbsp;:&nbsp;</span>
											<span className="h3">{this.state.num}次</span>
											<span className="h4" style={{marginLeft: '10px'}}>应付金额&nbsp;:&nbsp;</span>
											<span className="h3" style={{color: '#f97f27', fontWeight: 'bold'}}>{this.state.selectMoney}元</span>
										</div>
										: null
								}
								<h5 className="text-muted ptb2">支付过程中如有问题，请致电400-893-8990，或联系在线客服</h5>
							</Col>
							<Col span={8} className="text-right">
								<Button size="large" type="primary" className="h4" style={{width: '160px'}} onClick={this.payByAlipay}>去付款</Button>
							</Col>
						</Row>
					</section>
				</section>
				<MoneyPay showMoneyPay={this.state.showMoneyPay} closeMoneyPay={this.closeMoneyPayModal.bind(this)}
				          productId={this.state.selectType} history={this.props.history} />
			</Layout>
		)
	}
}
