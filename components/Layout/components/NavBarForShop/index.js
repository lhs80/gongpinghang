import React, {Component, Fragment} from 'react';
import Link from 'next/link'
import {Button, Menu, Input, Icon, message, Badge, Avatar, Row, Col, List} from 'antd'
import {baseUrl, iconUrl} from 'config/evn'
import './style.less'
import dynamic from 'next/dynamic'
import cookie from 'react-cookies';
import Router from 'next/router';
import {cancelShopCollectFun, shopCollectFun, delCartItem} from 'server';
import {queryProductNumForIndexFun, queryCartListForIndexFun} from 'newApi'
import AddInquiry from '../../../AddInquiry';

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const Search = Input.Search;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

class Index extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			keyWord: '',
			fixedSearch: false,
			showConnect: 'none',
			shopIsCollect: this.props.shopInfo ? this.props.shopInfo.flag : '',
			productNumInCart: 0,//进货单商品数量
			cartList: [],//购物车列表
			cartTotal: 0,
			showCartList: false,
		}
	}

	componentDidMount() {
		this.affixHeader();
		this.queryProductNumForIndex();
		this.queryCartListForIndex();
	}

	componentWillReceiveProps(nextProps) {
		this.queryProductNumForIndex();
		this.queryCartListForIndex();
	}

	affixHeader = () => {
		//滚动条滚动到最底端，搜索框固定在最上面
		window.addEventListener('scroll', () => {
			let scrollTopValue = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			let heightValue = document.body.clientHeight;
			let srcollHeight = document.body.scrollHeight;
			let screenHeight = window.screen.height;

			if (scrollTopValue >= heightValue) {
				this.setState({
					fixedSearch: true
				})
			} else {
				this.setState({
					fixedSearch: false
				})
			}
		});
	};
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};
	connectCustomer = (userCode) => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block',
				shopUserCode: userCode
			})
		} else {
			Router.push('/login/index');
		}
	};

	//收藏商家
	shopCollect = () => {
		if (this.userCode && this.userCode !== 'guest') {
			let params = {
				userCode: this.userCode,
				shopId: this.props.shopInfo ? this.props.shopInfo.shopId : ''
			};
			shopCollectFun(params).then(res => {
				this.setState({
					shopIsCollect: true
				});
				window.location.reload()
			}).catch(error => {
				if (!msgBox)
					message.error(error, .2, () => {
						msgBox = null;
					})
			});
		} else {
			Router.push({pathname: '/login/index', query: {redirectUrl: encodeURIComponent(window.location.href)}});
		}
	};

	//取消收藏商家
	cancelShopCollect = () => {
		cancelShopCollectFun(this.userCode, this.props.info ? this.props.info.shopId : '').then(res => {
			if (res.result === 'success') {
				this.setState({
					shopIsCollect: false
				})
			}
		})
	};

	//搜全网
	searchWeb = () => {
		Router.push({pathname: '/search/material', query: {keyword: this.state.keyword}})
	};

	//搜本店
	searchShop = () => {
		Router.push({pathname: '/shop/product', query: {id: this.props.shopInfo.shopId, keyword: this.state.keyword}})
	};

	searchOnChange = (e) => {
		this.setState({
			keyword: e.target.value
		})
	};


	//查询进货单商品数量
	queryProductNumForIndex = () => {
		let params = {
			userCode: this.userCode
		};
		queryProductNumForIndexFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					productNumInCart: res.data.count
				})
			}
		})
	};

	queryCartListForIndex = () => {
		let params = {
			userCode: this.userCode
		};
		queryCartListForIndexFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					cartList: res.data
				}, () => {
					let total = 0;
					this.state.cartList.forEach(item => {
						total += item.price * item.num
					});
					this.setState({
						cartTotal: total
					})
				})
			}
		})
	};

	del = (e, id) => {
		let params = {
			list: [id]
		};
		delCartItem(params).then(res => {
			if (res.result === 'success') {
				this.queryCartListForIndex();
				this.queryProductNumForIndex();
			}
		}).catch(error => {
			message.error(error)
		})
	};

	render() {

		const {shopId} = this.props.shopInfo;
		const {productId} = this.props;
		const {productNumInCart, cartList, cartTotal, showCartList} = this.state;
		return (
			<div className="shop-header">
				<aside className="page-head-wrapper maxWidth">
					<div className={`${this.state.fixedSearch ? 'page-head-searchFixed' : ''}`}>
						<div className="page-head-search maxWidth">
							<div className="page-head-search-left">
								<a href="/"><i className="icon-logo" /></a>
							</div>
							<div className="page-head-search-main">
								<div className="search-wrapper">
									<Search
										value={this.state.keyword}
										onChange={this.searchOnChange}
										style={{width: '515px'}}
										placeholder="请输入商品名称/规格/型号"
										onSearch={this.searchShop}
										enterButton={<span><IconFont type="iconfont-fangdajing" style={{marginTop: '-5px'}} /> 搜本店</span>}
									/>
								</div>
								<Button size="large" type="primary" onClick={this.searchWeb}>搜全网</Button>
							</div>
							<div className="page-head-search-right"
							     onMouseEnter={() => {
								     this.setState({showCartList: true})
							     }}
							     onMouseLeave={() => {
								     this.setState({showCartList: false})
							     }}>
								<Button type="primary" size="large" ghost style={{width: '160px'}}
								        onClick={() => {
									        Router.push('/account/cart/home')
								        }}
								>
									<IconFont type="iconfont-gouwuche" className="h0" />
									<span className="h5" style={{margin: '0 20px 0 10px'}}>我的购物车</span>
									<Badge count={productNumInCart || 0} offset={[0, -5]} showZero>
										<a href="#" className="h5" />
									</Badge>
								</Button>
								{
									showCartList ?
										<div className="index-cart-list-panel-wrapper">
											{
												cartList.length ?
													<Fragment>
														<List
															className="index-cart-list-panel"
															itemLayout="horizontal"
															dataSource={cartList}
															renderItem={item => (
																<List.Item
																	actions={[<IconFont type="iconfont-guanbi" className="h4 text-muted"
																	                    onClick={(e) => this.del(e, item.productCartId)} />]}
																>
																	<List.Item.Meta
																		avatar={
																			<Avatar shape="square" src={item.image ? baseUrl + item.image.split(',')[0] : '/static/images/nologin.png'}
																			        size={48} />
																		}
																		title={<div className="text-ellipsis h5 text-grey text-left" style={{width: '220px'}}>{item.productName}</div>}
																		description={<Row style={{width: '220px'}}>
																			<Col span={12} className="text-muted text-left">x{item.num}</Col>
																			<Col span={12} className="text-right text-primary"><b>￥{item.price * item.num}</b></Col></Row>}
																	/>
																</List.Item>
															)}
														/>
														<Row className="index-cart-list-total">
															<Col span={12} className="text-muted h5">合计：<b className="text-primary">￥{parseFloat(cartTotal).toFixed(2)}</b></Col>
															<Col span={12} className="bg-primary text-white h4"
															     onClick={() => {
																     Router.push('/account/cart/home')
															     }}>
																<span style={{cursor: 'pointer'}}>去购物车结算</span>
															</Col>
														</Row>
													</Fragment>
													:
													<div className="text-muted ptb3 h5 text-center">
														<IconFont type="iconfont-shopping_car_grey" className="large text-muted" />
														<br />
														<div className="mt1">购物车内还没有商品，赶紧选购吧！</div>
													</div>
											}
										</div>
										:
										null
								}
							</div>
						</div>
					</div>
				</aside>
				<aside className='bg-primary-linear' style={{overflow: 'hidden'}}>
					{/*导航菜单*/}
					<div className="maxWidth">
						<Menu selectedKeys={[this.props.mainMenuIndex]} mode="horizontal" className="page-head-menu">
							<Menu.Item key="home">
								<Link href={{pathname: '/shop/home', query: {id: shopId}}}>店铺首页</Link>
							</Menu.Item>
							<Menu.Item key="list" className="subName">
								<Link href={{pathname: '/shop/product', query: {id: shopId}}}>全部商品</Link>
							</Menu.Item>
							<Menu.Item key="inquiry" className="subName">
								<Link href={{pathname: '/shop/atlas', query: {id: shopId}}}>店铺图集</Link>
							</Menu.Item>
							<Menu.Item key="price" className="subName">
								<AddInquiry type={'link'}
								            text={'向TA询价'}
								            class="h4 text-white"
								            showModalOfType={this.showModalOfType}
								            urlParams={{type: 1, mid: productId, shopId: shopId}}
								            style={{marginTop: '-10px'}}
								/>
							</Menu.Item>
						</Menu>
					</div>
				</aside>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.shopUserCode} closeModal={this.closeModal} />
			</div>
		)
	}
}

Index.propTypes = {};

export default Index;
