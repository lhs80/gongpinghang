import React, {Component} from 'react';
import Router from 'next/router'
import {Button, Divider, Row, Col, Input, Icon, message, Modal, Radio} from 'antd';
import AddInquiry from 'components/AddInquiry';
import {iconUrl} from 'config/evn';
import './style.less'
import cookie from 'react-cookies';
import {addOftenMaterialFun, addCart} from 'server'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

function SinglePrice(props) {
	const {specs} = props;
	if (specs) {
		const newSpecs = specs.sort((a, b) => {
			return a.price - b.price
		});
		return (
			<span>
			{
				newSpecs.length > 1
					?
					<span className="text-primary h0">
						<small>{newSpecs[0].price < 0 ? '' : '￥'}</small>
						<i>{newSpecs[0].price < 0 ? '待询价' : newSpecs[0].price + '~' + newSpecs[newSpecs.length - 1].price}</i>
					</span>
					:
					<span className="text-primary h0">
						<small>{newSpecs[0].price < 0 ? '' : '￥'}</small>
						<i>{newSpecs[0].price < 0 ? '待询价' : newSpecs[0].price}</i>
					</span>
			}
			</span>
		)
	} else {
		return (
			<span className="text-primary h0">0 <small>元</small></span>
		)
	}
}

function RangePrice(props) {
	const {intervalPrice} = props;
	const newIntervalPrice = intervalPrice.sort((a, b) => {
		return a.start - b.start
	});
	return (
		<Row className="text-primary" style={{display: 'inline-block', width: '80%', verticalAlign: 'middle'}}>
			{
				newIntervalPrice.map((item, index) => {
					return (
						<Col span={8} key={index}>
							<div className="h0 text-primary text-center">
								<small>￥</small>
								{item.price}</div>
							<div className="text-muted h5 text-center" style={{marginTop: '16px'}}>
								{index === newIntervalPrice.length - 1 ? `≥` : ''}
								{item.start}
								{index !== 0 && index !== newIntervalPrice.length - 1 ? `~${item.end}` : ''}
								{props.unit}
								{index === 0 ? `起订` : ''}
							</div>
						</Col>
					)
				})
			}
		</Row>
	)
}

class Index extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			showError: false,
			isExpand: false,
			errorText: '订购数量必须为大于0的整数',
			showAddOfterBuyModal: false,
			num: 0,
			specs: [],
			sendSampleSpecsId: 0
		}
	}

	// 父组件重传props时就会调用这个方法
	componentWillReceiveProps(nextProps) {
		const {specs} = nextProps.info;
		if (specs && specs.length)
			specs.forEach(item => {
				Object.assign(
					item,
					{num: 0},
					{name: nextProps.info.name},
					{shopId: nextProps.shopId},
					{img: nextProps.info.image},
					{materialBrand: nextProps.info.materialBrand},
					{materialUnit: nextProps.info.unit},
					{productId: nextProps.info.id},
					{optionalAttribute: nextProps.info.optionalAttribute},
				);
			});
		this.setState({
			specs
		});
	}

	add = (index) => {
		const {specs} = this.state;
		const {intervalPrice} = this.props.info;
		let newPrice = 0;
		this.setState({
			showError: false,
		});
		specs[index].num = Number(specs[index].num) + 1;
		if (intervalPrice) {
			let parsePrice = intervalPrice;
			const {num} = specs[index];
			newPrice = parsePrice.filter(item =>
				item.end !== '' && Number(item.start) <= num && num <= Number(item.end)
				||
				item.end === '' && Number(item.start) <= num
			)
		}
		if (newPrice.length) {
			specs[index].price = newPrice[0].price;
		}

		specs[index].totalPrice = specs[index].num * specs[index].price;
		this.setState({
			specs,
			isExpand: true
		})
	};

	minus = (index) => {
		const {specs} = this.state;
		const {intervalPrice} = this.props.info;
		let newPrice = [];
		this.setState({
			showError: false,
		});
		specs[index].num = Number(specs[index].num) - 1;
		if (intervalPrice) {
			let parsePrice = JSON.parse(intervalPrice);
			const {num} = specs[index];
			newPrice = parsePrice.filter(item =>
				item.end !== '' && Number(item.start) <= num && num <= Number(item.end)
				||
				item.end === '' && Number(item.start) <= num
			)
		}
		if (newPrice.length) {
			specs[index].price = newPrice[0].price;
		}
		specs[index].totalPrice = specs[index].num * specs[index].price;
		this.setState({
			specs,
			isExpand: true
		})
	};

	changeNum = (e, index) => {
		const {specs} = this.state;
		const {value} = e.target;
		const {intervalPrice} = this.props.info;
		let newPrice = 0;
		const reg = /^\d+$/;

		if ((!Number.isNaN(value) && reg.test(value)) || value === '' || value === '-') {
			//输入的数量是不是比库存多
			specs[index].num = value >= specs[index].stock ? specs[index].stock : value;
			if (intervalPrice) {
				let parsePrice = intervalPrice;
				const {num} = specs[index];
				newPrice = parsePrice.filter(item =>
					item.end !== '' && Number(item.start) <= num && num <= Number(item.end)
					||
					item.end === '' && Number(item.start) <= num
				)
			}
			if (newPrice.length) {
				specs[index].price = newPrice[0].price;
			}

			this.setState({
				specs,
				isExpand: true,
				showError: false,
			})
		}
	};

	buy = () => {
		if (this.userCode && this.userCode !== 'guest') {
			const {intervalPrice} = this.props.info;
			const {shopId, shopName, shopUserCode} = this.props;
			let productList = [];
			if (intervalPrice) {
				let parsePrice = intervalPrice;//区间价
				productList = this.state.specs.filter(item => item.num >= Number(parsePrice[0].start) && item.num > 0);
				if (!productList.length) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			} else if (this.props.info.specs.length) {
				productList = this.state.specs.filter(item => Number(item.num) >= this.props.info.startSale);
				if (productList.length === 0) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			} else {
				productList = this.state.specs.filter(item => item.num > this.props.info.startSale && item.num > 0);
				if (!productList.length) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			}

			let params = {
				shopId: shopId,
				list: productList,
				shopName: shopName,
				shopUserCode: shopUserCode
			};
			sessionStorage.setItem('zzjcpls', JSON.stringify(params));
			Router.push({pathname: '/confirm/order', query: {type: 2}})
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
			})
		}
	};

	//申请寄样
	getSample = () => {
		if (this.userCode && this.userCode !== 'guest') {
			const {shopId, shopName, shopUserCode} = this.props;
			const {intervalPrice} = this.props.info;

			//区间价排序
			if (intervalPrice) {
				const newIntervalPrice = intervalPrice.sort((a, b) => {
					return a.start - b.start
				});
				this.state.specs.forEach(item => {
					item.price = newIntervalPrice[newIntervalPrice.length - 1].price
				});
			}

			if (this.state.specs.length > 1)
				this.showSelectSampleDialog();
			else {
				this.state.specs.forEach(item => {
					item.num = 1;
				});
				let params = {
					shopId: shopId,
					list: this.state.specs,
					shopName: shopName,
					shopUserCode: shopUserCode
				};
				sessionStorage.setItem('zzjcpls', JSON.stringify(params));
				Router.push({pathname: '/confirm/order', query: {type: 3}})
			}
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
			})
		}
	};

	//显示选择寄样商品对话框
	showSelectSampleDialog = () => {
		Modal.confirm({
			width: '490px',
			icon: null,
			title: <b>请选择申请寄样的商品规格（单选）：</b>,
			content:
				<Radio.Group className="send-sample-group" name="address">
					{
						this.state.specs.map((item, index) => {
							return (
								<Radio onChange={this.onSendSampleChange} value={item.id} className="send-sample-item" key={index}>
									{item.attributeValue}
								</Radio>
							)
						})
					}
				</Radio.Group>,
			okText: '确定',
			cancelText:
				'取消',
			onOk: () => {
				const {shopId, shopName, shopUserCode} = this.props;
				let checkSendSample = this.state.specs.filter(item => item.id === this.state.sendSampleSpecsId);
				if (checkSendSample[0].stock > 0) {
					checkSendSample[0].num = 1;
					let params = {
						shopId: shopId,
						list: checkSendSample,//this.state.specs,
						shopName: shopName,
						shopUserCode: shopUserCode
					};
					sessionStorage.setItem('zzjcpls', JSON.stringify(params));
					Router.push({pathname: '/confirm/order', query: {type: 3}})
				} else {
					if (!msgBox)
						message.error('库存不足！', 0.5, () => {
							msgBox = null;
						})
				}
			},
		});
	};

	onSendSampleChange = (e) => {
		this.setState({
			sendSampleSpecsId: e.target.value
		});
	};

	//添加常购清单
	addOftenMaterial = () => {
		const {info} = this.props;
		if (this.userCode && this.userCode !== 'guest') {
			let params = {
				userCode: this.userCode,
				unit: info.unit,
				name: info.name,
				brand: info.materialBrand,
			};
			addOftenMaterialFun(params).then(res => {
				this.setState({
					showAddOfterBuyModal: true
				})
			}).catch(error => {
				message.error(error)
			})
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
			})
		}
	};

	/**
	 * 去常购清单页面
	 * */
	onOftenBuyModalOkClick = () => {
		Router.push({pathname: '/account/custom-center/often-shop'});
	};

	hiddenOfterBuyModal = () => {
		this.setState({
			showAddOfterBuyModal: false
		})
	};

	addToCart = () => {
		if (this.userCode && this.userCode !== 'guest') {
			const {intervalPrice} = this.props.info;
			let productList = [];
			if (intervalPrice) {
				let parsePrice = intervalPrice;//区间价
				productList = this.state.specs.filter(item => item.num >= Number(parsePrice[0].start) && item.num > 0);
				if (!productList.length) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			} else if (this.props.info.specs.length) {
				productList = this.state.specs.filter(item => Number(item.num) >= this.props.info.startSale);
				if (productList.length === 0) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			} else {
				productList = this.state.specs.filter(item => item.num > this.props.info.startSale && item.num > 0);
				if (!productList.length) {
					this.setState({
						showError: true,
						errorText: '订购数量不小于起批量'
					});
					return false
				}
			}
			let params = [];
			productList.forEach((item, index) => {
				const {productId, id, num} = item;
				params.push({
					productId: productId,
					productSpecsId: id,
					userCode: this.userCode,
					num: num
				})
			});

			addCart(params).then(res => {
				if (!msgBox) {
					msgBox = message.success('加入成功！', 0.5, () => {
						msgBox = null;
					});
				}
				this.props.updateCartNum();
			}).catch(error => {
				message.error(error)
			})
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
			})
		}
		// if (!this.userCode || this.userCode === 'guest') {
		// 	Router.push({
		// 		pathname: '/login/index',
		// 		query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
		// 	});
		// 	return false;
		// }
		// let params = [];
		// let productList = this.state.specs.filter(item => item.num > 0);
		// if (!productList.length) {
		// 	this.setState({
		// 		showError: true,
		// 	});
		// 	return false
		// }
		// productList.forEach((item, index) => {
		// 	const {productId, id, num} = item;
		// 	params.push({
		// 		productId: productId,
		// 		productSpecsId: id,
		// 		userCode: this.userCode,
		// 		num: num
		// 	})
		// });
		//
		// addCart(params).then(res => {
		// 	if (!msgBox) {
		// 		msgBox = message.success('加入成功！', 0.5, () => {
		// 			msgBox = null;
		// 		});
		// 	}
		// }).catch(error => {
		// 	message.error(error)
		// })
	};

	render() {
		const {info, shopId} = this.props;
		const {isExpand, specs, showError} = this.state;
		return (
			<div className="material-detail-info">
				<div className="product-name"><b>{info ? info.materialBrand : ''} {info ? info.name : ''}</b></div>
				<Row className="price" type="flex" align="middle">
					<Col span={16}>
						<h5>
							<label className="text-muted">价格：</label>
							{
								info ?
									info.intervalPrice ?
										<RangePrice intervalPrice={info.intervalPrice} unit={info ? info.unit : ''} />
										:
										<SinglePrice specs={info.specs} />
									:
									''
							}
						</h5>
					</Col>
					<Col span={8}>
						{
							info && info.intervalPrice ? '' :
								<h5>
									<label className="text-muted">起批量：</label>
									<span>≥{info ? info.startSale : 0}
										<i className="text-muted"> {info ? info.unit : ''}</i>
									</span>
								</h5>
						}
						<div className="sale-num">
							<label className="text-muted">成交量：</label>
							<span>{info ? info.salesVolume : ''}</span>
							<span className="text-muted"> {info ? info.unit : ''}已成交</span>
						</div>
					</Col>
				</Row>
				<Row className="more-info">
					<Col span={7}><label
						className="text-muted">发货地：</label><span>{info ? info.province : ''}{info ? info.city : ''}</span></Col>
					<Col span={1}><Divider type="vertical" /></Col>
					<Col span={7} className="text-center"><label className="text-muted">商品交付：</label><span>现货</span></Col>
					<Col span={1}><Divider type="vertical" /></Col>
					<Col span={7} className="text-right">
						<label className="text-muted">支持寄样：</label>
						{
							info && info.isSend === '1' ?
								<span className="send-sample"><i className="text" onClick={this.getSample}>点我申请寄样</i></span>
								:
								<span>否</span>
						}
					</Col>
				</Row>
				<div className="norms">
					<label className="text-muted">{info && info.optionalAttribute ? info.optionalAttribute : '数量'}：</label>
					<div className={`norms-list ${isExpand ? 'expand' : ''}`}
					     style={{overflowY: (specs && specs.length > 10) && isExpand ? 'scroll' : 'hidden'}}>
						{
							specs && specs.length >= 2
								?
								specs.map((item, index) => {
									return (
										<Row className="item" key={index}>
											<Col span={18}>
												<span className="norms-title">{item.attributeValue}</span>
												<span style={{marginLeft: '20px'}}>{item.price < 0 ? '待询价' : item.price + '元'}</span>
												<span style={{marginLeft: '20px'}}>{item.stock}{info ? info.unit : ''}可售 </span>
											</Col>
											<Col span={6} className="text-right">
												<Input
													addonBefore={<Button type='primary'
													                     size="small"
													                     className="btn-handle"
													                     onClick={() => this.minus(index)}
													                     disabled={item.num <= 0}>-</Button>}
													addonAfter={<Button type='primary'
													                    size="small"
													                    className="btn-handle"
													                    onClick={() => this.add(index)}
													                    disabled={item.num >= specs[index].stock}
													>+</Button>}
													value={item.num}
													size="small"
													onChange={(e) => this.changeNum(e, index)}
												/>
											</Col>
										</Row>
									)
								})
								:
								<div className="item">
									<Input
										addonBefore={<Button type="primary"
										                     size="small"
										                     className="btn-handle"
										                     onClick={() => this.minus(0)}
										                     disabled={specs && specs[0] && specs[0].num <= 1}
										>-</Button>}
										addonAfter={<Button type="primary"
										                    size="small"
										                    className="btn-handle"
										                    onClick={() => this.add(0)}
										                    disabled={specs && specs[0] && specs[0].num >= specs[0].stock}
										>+</Button>}
										value={specs && specs[0] && specs[0].num}
										size="small"
										onChange={(e) => this.changeNum(e, 0)}
									/>
									<span
										style={{marginLeft: '20px'}}>{info && info.specs && info.specs[0].stock}{info ? info.unit : ''}可售 </span>
								</div>
						}
					</div>
					<div className={`btn-expand ${!isExpand && (specs && specs.length) >= 2 ? '' : 'hide'}`}
					     onClick={() => this.setState({isExpand: true})}>
						<i className="iconfont iconfont-jiantou h6 text-primary" />
					</div>
				</div>
				<div className="material-detail-button">
					{/*<Button type="primary" size='large' onClick={this.buy} className="btn-buy">*/}
					{/*<IconFont type="iconfont-yingshoukuan1" className="h2" />立即购买*/}
					{/*</Button>*/}
					{
						info && info.specs && info.specs[0].price < 0 ?
							null
							:
							<Button type="primary" size='large' className="h3" style={{width: '160px'}} onClick={this.addToCart}>加入购物车</Button>
					}

					{/*先去掉*/}
					{/*<AddInquiry type={'primary'}*/}
					{/*            size="large"*/}
					{/*            text={'去询价'}*/}
					{/*            class="btn-inquiry"*/}
					{/*            showModalOfType={this.showModalOfType}*/}
					{/*            urlParams={{type: 1, mid: info ? info.id : '', shopId: shopId}}*/}
					{/*            icon="iconfont-xunjia"*/}
					{/*            iconClass={'h2'}*/}
					{/*/>*/}
					{/*<Button type="primary" size={'large'} ghost onClick={this.addOftenMaterial}>加入常购清单</Button>*/}
				</div>
				<div className="small-tags">
					<span className="prl2"><i className="tags"><em>正</em></i><i>正品保障</i></span>
					<span className="prl2"><i className="tags"><em>服</em></i><i>一对一客服</i></span>
				</div>
				<div className={`text-danger prl2 mt1 ${showError ? '' : 'hide'}`}>{this.state.errorText}</div>
				<Modal
					closable={false}
					width={480}
					centered={true}
					okText="进入常购清单"
					cancelText="我再看看"
					visible={this.state.showAddOfterBuyModal}
					onOk={this.onOftenBuyModalOkClick}
					onCancel={this.hiddenOfterBuyModal}>
					<div className="text-center text-darkgrey">
						<h2>添加成功</h2>
						<h2 className="mt3">是否进入常购清单开始询价？</h2>
					</div>
				</Modal>
			</div>
		);
	}
}

export default Index;
