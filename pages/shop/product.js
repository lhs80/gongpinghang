import React from 'react'
import {withRouter} from 'next/router'
import PageLayout from 'components/Layout/shop'
import {Pagination, Input, Layout, Icon} from 'antd';
import MaterialGoodsList from './components/Material-Item/';
import {getShopClassList, getMaterialList, queryShopInfoFun} from 'server'
import cookie from 'react-cookies';
import ShopInfo from 'components/ShopInfoSliderBar';
import {iconUrl} from 'config/evn';
import './style.less'

const Search = Input.Search;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ProductList extends React.Component {
	constructor(props) {
		super(props);
		this.intStartSale = React.createRef();
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			loading: true,
			keyword: this.props.router.query.keyword || '',
			products: [],//材料列表
			classes: [],
			shopInfo: {},//店铺信息
			firstGroupId: '',//一级分类ID
			groupName: '',
			searchParams: {
				sort: 0,
				startSale: '',
				longitude: '',
				latitude: '',
				groupId: ''
			},
			pagination: {
				defaultCurrent: 0,
				total: 0,
				pageSize: 20,
				current: 1,
				onChange: this.onPageChange
			}
		}
	}

	componentDidMount() {
		this.getCityMap();
		this.queryShopInfo();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id || prevProps.router.query.tid !== this.props.router.query.tid || prevProps.router.query.keyword !== this.props.router.query.keyword) {
			this.getCityMap();
			this.queryShopInfo();
			const {pagination} = this.state;
			pagination.current = 1;
			this.setState({
				keyword: this.props.router.query.keyword,
				pagination
			})
		}
	}

	//根据IP获取当前经纬度
	getCityMap = () => {
		//实例化城市查询类
		let citysearch = new AMap.CitySearch();
		let self = this;
		//自动获取用户IP，返回当前城市
		citysearch.getLocalCity(function (status, result) {
			if (status === 'complete' && result.info === 'OK') {
				if (result && result.city && result.bounds) {
					let rectangle = result.rectangle.split(',');
					let {searchParams} = self.state;
					searchParams.longitude = rectangle[0];
					searchParams.latitude = rectangle[2];
					self.setState({
						searchParams
					}, () => {
						self.queryShopProduct(true, self.props.router.query.tid);
						self.queryShopClassList();
					})
				}
			} else {
				message.error('获取当前城市失败')
			}
		});
	};

	/**
	 * 商家材料信息
	 * */
	queryShopProduct = (init, id, word = this.props.router.query.keyword) => {
		const {searchParams, pagination} = this.state;
		searchParams.groupId = id;
		if (init) {
			pagination.current = 1;
			this.setState({
				pagination
			})
		}
		this.setState({
			searchParams
		});
		let params = {
			...searchParams,
			pageSize: pagination.pageSize,
			shopId: this.props.router.query.id,
			pageNum: pagination.current - 1,
			productName: word,
		};
		getMaterialList(params).then(res => {
			const {pagination} = this.state;
			if (res.result === 'success') {
				pagination.total = res.data.count;
				this.setState({
					products: res.data.list,
					pagination,
					loading: false
				})
			}
		})
	};

	//查询店铺分类
	queryShopClassList() {
		let params = {
			shopId: this.props.router.query.id
		};
		getShopClassList(params).then(res => {
			this.setState({
				classes: res.data
			}, () => {
				const {classes} = this.state;
				const {tid} = this.props.router.query;
				if (tid) {
					let firstId = classes.filter(item => item.id === Number(tid));
					if (firstId.length) {
						this.setState({
							firstGroupId: firstId[0].id
						})
					} else {
						let curIndex = '';
						const {searchParams} = this.state;
						classes.forEach((item, index) => {
							let childList = item.childList.filter(child => child.id === Number(tid));
							if (childList.length) {
								curIndex = index;
							}
						});
						searchParams.groupId = Number(tid);
						this.setState({
							firstGroupId: classes[curIndex].id,
							searchParams
						})
					}
				}
			})
		})
	}

	//分页
	onPageChange = (page, pageSize) => {
		let {pagination} = this.state;
		pagination.current = page;
		this.setState({
			pagination
		}, () => {
			this.queryShopProduct();
		});
	};

	//商家信息
	queryShopInfo() {
		let params = {
			id: this.props.router.query.id,
			userCode: this.userCode
		};
		queryShopInfoFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					shopInfo: {
						...res.data
					}
				})
			}
		})
	}

	//改变分组Id
	changeFirstClassId(id, name) {
		const {pagination} = this.state;
		pagination.current = 1;
		this.setState({
			firstGroupId: id,
			groupName: name,
			pagination
		}, () => {
			this.queryShopProduct(false, id);
		})
	}

	//改变品类Id
	changeSecondClassId(id, name) {
		const {pagination} = this.state;
		pagination.current = 1;
		this.setState({
			groupName: name,
			pagination,
		}, () => {
			this.queryShopProduct(false, id);
		});
	}

	//改变排序类型
	changeSortType = (value) => {
		const {searchParams} = this.state;
		searchParams.sort = value;
		this.setState({
			searchParams
		}, () => {
			this.queryShopProduct(false, this.state.searchParams.groupId)
		})
	};

	//起订量变化
	onStartSaleChange = (e) => {
		if (e.nativeEvent.keyCode === 13) { //e.nativeEvent获取原生的事件对像
			const {searchParams} = this.state;
			searchParams.startSale = this.intStartSale.current.input.value;
			this.setState({
				searchParams
			}, () => {
				this.queryShopProduct()
			})
		}
	};

	searchOnChange = (e) => {
		this.setState({
			keyword: e.target.value
		})
	};

	search = () => {
		this.queryShopProduct(true, this.state.firstGroupId, this.state.keyword);
	};

	render() {
		const {searchParams, pagination, products, classes, shopInfo, firstGroupId, loading} = this.state;
		//过滤二级品类
		const secondMaterialList = classes.filter(item => item.id === firstGroupId)[0] || [];
		return (
			<PageLayout shopInfo={shopInfo} title="产品供应" mainMenuIndex='list'>
				<Layout className="product-detail mt2" style={{height: 'auto'}}>
					<ShopInfo info={shopInfo} shopId={shopInfo.shopId ? shopInfo.shopId : ''} list={classes} />
					{/*商品列表*/}
					<section className="shop-material-list">
						{/*类目与品牌*/}
						<section className="search-condition-panel">
							{/*一级*/}
							<div className="search-condition-item">
								<label className="title">分组：</label>
								<ul className="categoryDetail">
									<li onClick={() => this.changeFirstClassId('', '')} className={firstGroupId === '' ? 'active' : ''}>全部</li>
									{
										classes && classes.map((item, index) => {
											return (
												<li key={index}
												    onClick={() => this.changeFirstClassId(item.id, item.name)}
												    className={item.id === firstGroupId ? 'active' : ''}
												>{item.name}</li>
											)
										})
									}
								</ul>
							</div>
							{/*一级*/}
							{
								firstGroupId && secondMaterialList.childList.length ?
									<div className="search-condition-item">
										<label className="title" />
										<ul className="categoryDetail">
											{
												secondMaterialList && secondMaterialList.childList.map((item, index) => {
													return (
														<li key={index}
														    className={item.id === searchParams.groupId ? 'active' : ''}
														    onClick={() => this.changeSecondClassId(item.id, item.name)}
														>{item.name}</li>
													)
												})
											}
										</ul>
									</div>
									:
									''
							}
						</section>
						{/*排序/起订量*/}
						<section className="sort-wrapper">
							<ul className="sort-panel" style={{width: '30%'}}>
								<li>排序：</li>
								<li
									className={`item ${searchParams.sort === 0 ? 'acitve' : ''}`}
									onClick={() => this.changeSortType(0)}>默认
								</li>
								<li
									className={`item ${searchParams.sort === 1 || searchParams.sort === 2 ? 'acitve' : ''}`}
									onClick={() => this.changeSortType(searchParams.sort === 1 ? 2 : 1)}
								>
									销量<i className={`iconfont ${searchParams.sort !== 2 ? 'iconfont-jiantou_xiangxia_o' : 'iconfont-jiantou_xiangshang_o'}`} />
								</li>
							</ul>
							<ul className="sort-content prl1" style={{width: '70%'}}>
								<li>
									<label className="text-lightgrey">起订量：</label>
									<Input style={{width: '70px'}} ref={this.intStartSale} onKeyPress={this.onStartSaleChange} />
									<label className="text-darkgrey prl1"> 以下</label>
								</li>
								<li>
									<Search
										value={this.state.keyword}
										onChange={this.searchOnChange}
										placeholder="请输入关键字查询"
										onSearch={this.search}
										style={{marginTop: '10px'}}
										enterButton='搜索'
									/>
								</li>
								<li className="page-panel">
									<Pagination {...pagination} simple />
								</li>
							</ul>
						</section>
						{/*----商品列表---*/}
						<div className="bg-white">
							<MaterialGoodsList
								materialList={products}
								searchKeyWord={this.state.groupName}
								num={4}
								isLoading={loading}
							/>
						</div>
					</section>
				</Layout>
			</PageLayout>
		)
	}
}

export default withRouter(ProductList);
