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
										enterButton={<IconFont type="iconfont-fangdajing" style={{marginTop: '-5px'}} />}
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
							</div>
						</div>
					</section>
				</aside>
			</Header>
		)
	}
}

export default withRouter(IndexHeader);
