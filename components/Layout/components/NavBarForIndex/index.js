import React, {Fragment} from 'react'
import Router, {withRouter} from 'next/router'
import {Icon, Menu, Input, Layout, Button, Badge, List, Avatar, Row, Col, Modal, message} from 'antd'
import {iconUrl, businessUrl, baseUrl} from 'config/evn'
import {delCartItem, queryMaterialByKeyWord} from 'server'
import {queryProductNumForIndexFun, queryCartListForIndexFun} from 'newApi'
import {hotKeyWord} from 'config/data'
import MaterialKind from 'components/Material-Kind/'
import cookie from 'react-cookies'
import './style.less'

const {Header} = Layout;
const Search = Input.Search;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class IndexHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cartList: [],//购物车列表
			cartTotal: 0,
			showCartList: false,
			showKinds: false,
			token: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').token : null,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			selectCity: cookie.load('city') ? cookie.load('city') : '苏州',
			keyWord: this.props.router.query.keyword,
			fuzzySearchResultList: [],
			isShowSearchSuggest: this.props.controlSearchSuggest, //是否显示联想词面板
			showTypeList: false,//显示分类列表
			showSearchType: false,//显示搜索类型
			fixedSearch: false,
			count: '',
			searchType: '1', //搜索类型 1:商品; 2:店铺
			placeHolderStr: '',//搜索框提示文字
			productNumInCart: 0//进货单商品数量
		}
	}

	componentDidMount() {
		let searchType = '', placeHolderStr = '';
		if (this.props.router.pathname.indexOf('/search/business') >= 0) {
			searchType = '2';
			placeHolderStr = '请输入店铺或公司名称'
		} else {
			searchType = '1';
			placeHolderStr = '请输入商品名称/规格/型号'
		}
		this.setState({
			showKinds: Router.router.route !== '/',
			searchType,
			placeHolderStr
		});
		this.affixHeader();
		this.queryProductNumForIndex();
		this.queryCartListForIndex();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.keyword !== this.props.router.query.keyword)
			this.setState({
				keyWord: this.props.router.query.keyword,
				isShowSearchSuggest: this.props.controlSearchSuggest
			});
	}

	componentWillReceiveProps(nextProps) {
		const {isShowSearchSuggest} = this.state;
		const newdata = nextProps.isShowSearchSuggest;
		if (isShowSearchSuggest !== newdata) {
			this.setState({
				isShowSearchSuggest: nextProps.isShowSearchSuggest,
			})
		}
	}

	//查询进货单商品数量
	queryProductNumForIndex = () => {
		let params = {
			userCode: this.state.userCode
		};
		queryProductNumForIndexFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					productNumInCart: res.data.count
				})
			}
		})
	};

	affixHeader = () => {
		//滚动条滚动到最底端，搜索框固定在最上面
		window.addEventListener('scroll', () => {
			let scrollTopValue = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			let heightValue = document.body.clientHeight;

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

	/**
	 * 搜索值变化时显示关键字面板
	 * */
	searchOnChange = (e) => {
		this.setState({
			keyWord: e.target.value,
		}, () => {
			queryMaterialByKeyWord(this.state.keyWord.trim(), this.state.searchType).then(res => {
				if (res.result === 'success') {
					this.setState({
						fuzzySearchResultList: res.data,
						isShowSearchSuggest: res.data.length
					});
				}
			});
		});
	};

	/**
	 * 在搜索框中点击回车或点击搜索按钮的事件
	 * */
	search = (value) => {
		this.setState({
			isShowSearchSuggest: false
		});
		//替换掉空格
		let keyword = value.replace(/^\s+|\s+$/g, '');
		if (keyword) {
			if (this.state.searchType === '2') {
				Router.push({
					pathname: '/search/business',
					query: {
						keyword: keyword
					}
				});
			} else {
				let pathname = '/search/material';
				let state = {typeId: 1, keyword: keyword, classId: ''};
				Router.push({
					pathname: '/search/material',
					query: {
						keyword: keyword
					}
				});
			}
		}
	};

	/**
	 * 搜索材料
	 * */
	onSearchMaterialClick = (word) => {
		this.setState({
			isShowSearchSuggest: false
		});
		Router.push({
			pathname: '/search/material',
			query: {
				type: 0,
				keyword: word
			}
		});
	};

	queryCartListForIndex = () => {
		let params = {
			userCode: this.state.userCode
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
		const {productNumInCart, cartList, cartTotal, showCartList, isShowSearchSuggest} = this.state;
		return (
			<Header className="index-page-head">
				<aside className="page-head-wrapper">
					{/*logo和搜索框*/}
					<section className={`${this.state.fixedSearch ? 'page-head-searchFixed' : ''}`}>
						<div className="page-head-search maxWidth">
							<div className="page-head-search-left">
								<a href="/" className="page-head-search-left">
									<i className="icon-logo" />
								</a>
							</div>
							<div className="page-head-search-main">
								<div className="search-wrapper">
									<div className={`search-type-wrapper ${this.state.showSearchType ? 'active' : ''}`}
									     onMouseEnter={() => this.setState({showSearchType: true})}
									     onMouseLeave={() => this.setState({showSearchType: false})}
									>
										<h5 className="search-type-title">
											{this.state.searchType === '2' ? '店铺' : '商品'}
											<IconFont type="iconfont-sanjiao" />
										</h5>
										<ul className="search-type">
											<li onClick={() => this.setState({
												searchType: '1',
												showSearchType: false,
												placeHolderStr: '请输入材料名/规格/型号/品牌/商家'
											})}>商品
											</li>
											<li onClick={() => this.setState({
												searchType: '2',
												showSearchType: false,
												placeHolderStr: '请输入店铺或公司名称'
											})}>店铺
											</li>
										</ul>
									</div>
									<Search
										value={this.state.keyWord}
										onChange={this.searchOnChange}
										style={{width: '528px'}}
										placeholder={this.state.placeHolderStr}
										onSearch={this.search}
										enterButton='搜索'
									/>
									<div className={`page-head-search-suggest ${isShowSearchSuggest ? '' : 'hide'}`}>
										{
											this.state.fuzzySearchResultList && this.state.fuzzySearchResultList.map((item, index) => {
												if (index <= 9) {
													return (
														<h5 key={index} onClick={() => this.onSearchMaterialClick(item)} className="text-ellipsis">{item}</h5>
													)
												}
											})
										}
									</div>
								</div>
								<div className="hot-word">
									<span className="title">热词搜索：</span>
									{
										hotKeyWord.map((item, key) => {
											return <a key={key} className="item" href={`/search/material?keyword=${item}`}>{item}</a>
										})
									}
								</div>
							</div>
							<div className="page-head-search-right"
							     onMouseEnter={() => {
								     this.setState({showCartList: true})
							     }}
							     onMouseLeave={() => {
								     this.setState({showCartList: false})
							     }}
							>
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
					</section>
					{/*导航菜单*/}
					<div className="maxWidth">
						<div className="material-bd-title"
						     onMouseEnter={() => this.setState({showTypeList: true})}
						     onMouseLeave={() => this.setState({showTypeList: false})}
						>
							<div className="material-bd-title_text">
								<IconFont type="iconfont-fenleisvg" /> 全部材料分类
							</div>
							{this.state.showTypeList && this.state.showKinds ? <MaterialKind /> : ''}
						</div>

						<Menu selectedKeys={[this.props.menuIndex]} mode="horizontal" className="page-head-menu">
							<Menu.Item key="home">
								<a href="/" className="prl1">首页</a>
							</Menu.Item>
							<Menu.Item key="buy" className="subName">
								<a href="/search/material" className="prl1">现货直采</a>
							</Menu.Item>
							{/*<Menu.Item key="inquiry" className="subName">*/}
							{/*<a href="/enquiry/index" className="prl1">询价大厅</a>*/}
							{/*</Menu.Item>*/}
							<Menu.Item key="business" className="subName">
								<a href={businessUrl} className="prl1" target="_blank">供应商入驻</a>
							</Menu.Item>
							{/*<Menu.Item key="invite" className="subName">*/}
							{/*<a href="/invite/home" target="_black">招投标</a>*/}
							{/*</Menu.Item>*/}
							{/*<Menu.Item key="price" className="subName">*/}
							{/*<a href="/price/home">信息价</a>*/}
							{/*</Menu.Item>*/}
							{/*<Menu.Item key="vip" className="subName">*/}
							{/*<a href="/mall/home">积分商城</a>*/}
							{/*</Menu.Item>*/}
							{/*<Menu.Item key="news" className="subName">*/}
							{/*<a href="/information/index">资讯</a>*/}
							{/*</Menu.Item>*/}
						</Menu>
					</div>
				</aside>
			</Header>
		)
	}
}

export default withRouter(IndexHeader);
