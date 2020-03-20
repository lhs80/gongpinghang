import React from 'react'
import {withRouter} from 'next/router'
import {Pagination, Breadcrumb, message, Input, Cascader} from 'antd'
import {
	getShopClass,
	getShopList,
	getAreaCityFun,
	getBrandFun
} from 'server'
import BusinessItem from './components/Business-Item/'
import Layout from 'components/Layout/index';
import './style.less'

class BusinessSearch extends React.Component {
	constructor(props) {
		super(props);
		this.intStartSale = React.createRef();
		this.fieldNames = {
			value: 'label', children: 'cities'
		};
		this.state = {
			loading: true,
			shopList: [],//材料列表
			shopClass: [],//材料默认分类列表
			brandList: [],//品牌列表
			areaData: [],
			expandIndex: -1,//当前展开的分类index
			searchKeyWord: this.props.router.query.keyword,//搜索关键字
			searchParams: {
				pageSize: 48,
				pageNum: 0,
				parameter: this.props.router.query.keyword,
				classification: '',
				city: '',
				province: '',
				longitude: 0,
				label: '',
				brand: '',
				sort: 0,
			}
		};
	}

	componentDidMount() {
		this.getCityMap();
		this.getAllArea();
		this.queryBrand();
		this.queryShopClass();//分类
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.keyword !== prevProps.router.query.keyword) {
			this.setState({
				searchKeyWord: this.props.router.query.keyword
			});
			this.queryShopClass();//分类
			this.getCityMap();
			this.getAllArea();
			this.queryBrand();
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
						self.queryShopList();
					})
				}
			} else {
				message.error('获取当前城市失败')
			}
		});
	};

	/*----获取地区json----*/
	getAllArea() {
		getAreaCityFun().then(res => {
			//按照插件要求，修改返回字段。
			let data = JSON.stringify(res.data)
				.replace(/provinceName/g, 'label')
				.replace(/cityName/g, 'label');
			//增加默认的所有地区选项
			data = JSON.parse(data);
			data.unshift({
				label: '全部地区',
				value: ''
			});
			//赋值
			this.setState({
				areaData: data,
			});
		}).catch(error => {
			message.error(error)
		});
	}

	//搜索关键字进入页面，查询相关分类
	queryShopClass() {
		let params = {
			parameter: this.props.router.query.keyword
		};
		getShopClass(params).then(res => {
			this.setState({
				shopClass: res.data
			})
		}).catch(error => {
			message.error(error);
		})
	}

	//查询品牌列表
	queryBrand() {
		let params = {
			// type: 0,
			keywords: this.props.router.query.keyword,
			// classId: ''
		};
		getBrandFun(params).then(res => {
			this.setState({
				brandList: res.data
			})
		}).catch(error => {
			message.error(error);
		})
	}

	//查询材料列表
	queryShopList(init) {
		const {searchParams} = this.state;
		searchParams.parameter = this.props.router.query.keyword;
		if (init) {
			searchParams.pageNum = 0;
			this.setState({
				searchParams
			})
		}

		getShopList(searchParams).then(res => {
			this.setState({
				shopList: res.data || [],
				loading: false
			})
		}).catch(error => {
			message.error(error);
		})
	}

	//改变分类Id
	changeFirstClassId(id) {
		const {searchParams} = this.state;
		searchParams.classification = searchParams.classification > 0 && searchParams.classification === id ? '' : id;
		this.setState({
			searchParams,
			expandIndex: -1
		}, () => {
			this.queryShopList(true);
		})
	}

	//改变标签Id
	changeSecondClassId(id) {
		const {searchParams} = this.state;
		searchParams.label = searchParams.label > 0 && searchParams.label === id ? '' : id;
		this.setState({
			searchParams,
			expandIndex: -1
		}, () => {
			this.queryShopList(true);
		});
	}

	//改变品牌
	changeSubClassId(id) {
		const {searchParams} = this.state;
		searchParams.brand = searchParams.brand > 0 && searchParams.brand === id ? '' : id;
		this.setState({
			searchParams,
			expandIndex: -1
		}, () => {
			this.queryShopList(true);
		});
	}

	//分页
	onPageChange = (page, pageSize) => {
		let {searchParams} = this.state;
		searchParams.pageNum = page - 1;
		this.setState({
			searchParams
		}, () => {
			this.queryShopList();
		});
	};

	//地区变化
	areaChange = (value) => {
		const {searchParams} = this.state;
		searchParams.province = value[0] === '全部地区' ? '' : value[0];
		searchParams.city = value[1];
		this.setState({
			searchParams
		}, () => {
			this.queryShopList(true)
		})
	};

	//改变排序类型
	changeSortType = (value) => {
		const {searchParams} = this.state;
		searchParams.sort = value;
		this.setState({
			searchParams
		}, () => {
			this.queryShopList(true)
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
				this.queryShopList()
			})
		}
	};

	render() {
		const {shopClass, expandIndex, areaData, searchKeyWord, shopList, searchParams, brandList, loading} = this.state;
		//过滤二级品类
		const secondMaterialList = shopClass.filter(item => item.classificationId === searchParams.classification)[0] || [];
		//共多少页
		const pageTotal = Math.ceil(shopList.count / searchParams.pageSize);
		return (
			<Layout title='搜索' searchKey={this.props.router.query.keyword}>
				<section className="resultMenu">
					{/*路径*/}
					<Breadcrumb separator=">" className='text-lightgrey ptb1'>
						<Breadcrumb.Item>首页</Breadcrumb.Item>
						<Breadcrumb.Item href="">关键词"{searchParams.parameter}" 共{shopList.count}条筛选结果</Breadcrumb.Item>
					</Breadcrumb>
					{/*类目与品牌*/}
					<section className="search-condition-panel">
						{/*分类*/}
						<div className="search-condition-item">
							<label className="title">分类：</label>
							<ul className="categoryDetail">
								<li className={searchParams.classification ? '' : 'active'}
								    onClick={() => this.changeFirstClassId('')}>不限
								</li>
								{
									shopClass && shopClass.map((item, index) => {
										return (
											<li key={index}
											    onClick={() => this.changeFirstClassId(item.classificationId)}
											    className={item.classificationId === searchParams.classification ? 'active' : ''}
											>{item.classificationName}</li>
										)
									})
								}
							</ul>
							<label className={`more ${shopClass && shopClass.length > 19 ? '' : 'hide'}`}>
										<span className={`${expandIndex === 1 ? 'hide' : ''}`} onClick={() => this.setState({expandIndex: 1})}>
											<i>展开</i>
											<i className="iconfont iconfont-xiajiantou h6" />
										</span>
								<span className={`${expandIndex === 1 ? '' : 'hide'}`} onClick={() => this.setState({expandIndex: -1})}>
											<i>收起</i>
											<i className="iconfont iconfont-xiangshang h6" />
										</span>
							</label>
						</div>
						{/*标签*/}
						<div className={`search-condition-item ${expandIndex === 2 ? 'expand' : ''}`}>
							<label className="title">标签：</label>
							<ul className="categoryDetail">
								<li className={searchParams.secondMaterialList ? '' : 'active'}
								    onClick={() => this.changeSecondClassId('')}>不限
								</li>
								{
									searchParams.classification && secondMaterialList && secondMaterialList.list && secondMaterialList.list.map((item, index) => {
										return (
											<li key={index}
											    className={item.labelId === searchParams.label ? 'active' : ''}
											    onClick={() => this.changeSecondClassId(item.labelId)}
											>{item.labelName}</li>
										)
									})
								}
							</ul>
							<label className={`more ${secondMaterialList && secondMaterialList.list && secondMaterialList.list.length > 19 ? '' : 'hide'}`}>
										<span className={`${expandIndex === 2 ? 'hide' : ''}`} onClick={() => this.setState({expandIndex: 2})}>
											<i>展开</i>
											<i className="iconfont iconfont-xiajiantou h6" />
										</span>
								<span className={`${expandIndex === 2 ? '' : 'hide'}`} onClick={() => this.setState({expandIndex: -1})}>
											<i>收起</i>
											<i className="iconfont iconfont-xiangshang h6" />
										</span>
							</label>
						</div>
						{/*品牌*/}
						<div className="search-condition-item">
							<label className="title">品牌：</label>
							<ul className="categoryDetail">
								<li className={searchParams.brand ? '' : 'active'}
								    onClick={() => this.changeSubClassId('')}>不限
								</li>
								{
									brandList.map((item, index) => {
										return (
											<li key={index}
											    className={item.brandId === searchParams.brand ? 'active' : ''}
											    onClick={() => this.changeSubClassId(item.brandId)}
											>{item.name}</li>
										)
									})
								}
							</ul>
							<label className={`more ${brandList && brandList.length > 19 ? '' : 'hide'}`}>
										<span className={`${expandIndex === 3 ? 'hide' : ''}`} onClick={() => this.setState({expandIndex: 3})}>
											<i>展开</i>
											<i className="iconfont iconfont-xiajiantou h6" />
										</span>
								<span className={`${expandIndex === 3 ? '' : 'hide'}`} onClick={() => this.setState({expandIndex: -1})}>
											<i>收起</i>
											<i className="iconfont iconfont-xiangshang h6" />
										</span>
							</label>
						</div>
					</section>
					{/*排序/起订量/所在地区*/}
					<section className="sort-wrapper">
						<ul className="sort-panel">
							<li>排序：</li>
							<li
								className={`item ${searchParams.sort === 0 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(0)}>默认
							</li>
							<li
								className={`item ${searchParams.sort === 1 || searchParams.sort === 2 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(searchParams.sort === 1 ? 2 : 1)}
							>
								销量<i
								className={`iconfont ${searchParams.sort !== 2 ? 'iconfont-jiantou_xiangxia_o' : 'iconfont-jiantou_xiangshang_o'}`} />
							</li>
							<li
								className={`item ${searchParams.sort === 3 || searchParams.sort === 4 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(searchParams.sort === 3 ? 4 : 3)}
							>
								距离<i className={`iconfont ${searchParams.sort !== 4 ? 'iconfont-jiantou_xiangxia_o' : 'iconfont-jiantou_xiangshang_o'}`} />
							</li>
						</ul>
						<ul className="sort-content">
							<li style={{width: '100px'}}>
								<Cascader options={areaData}
								          fieldNames={this.fieldNames}
								          onChange={this.areaChange}
								          expandTrigger='hover'
								>
									{/*已经选择城市，显示选择的城市，没有选择城市，显示全部地区*/}
									<a href="#">{searchParams.city ? searchParams.city : '全部地区'}</a>
								</Cascader>
							</li>
							<li className="page-panel">
								<Pagination
									simple
									current={searchParams.pageNum + 1}
									total={shopList.count}
									pageSize={searchParams.pageSize}
									onChange={this.onPageChange.bind(this)}
								/>
							</li>
						</ul>
					</section>
					{/*----商品详情---*/}
					<BusinessItem shopDataList={shopList} searchKeyWord={searchKeyWord} isLoading={loading} />
					{/*loading={this.state.loading} searchTotal={this.state.searchTotal}*/}
					{/*---分页---*/}
					<section className="mt2 text-right">
						<Pagination
							showQuickJumper
							current={searchParams.pageNum + 1}
							total={shopList.count || 0}
							pageSize={searchParams.pageSize}
							onChange={this.onPageChange.bind(this)}
							showTotal={total => `${searchParams.pageSize}条/页 共计 ${total} 条 当前页：${searchParams.pageNum + 1}/${pageTotal}`}
							hideOnSinglePage={true}
						/>
					</section>
				</section>
			</Layout>
		)
	}
}

export default withRouter(BusinessSearch)
