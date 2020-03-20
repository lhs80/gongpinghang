import React, {Fragment} from 'react'
import {withRouter} from 'next/router';
import {Pagination, Breadcrumb, message, Input, Cascader, Icon, Button, Checkbox} from 'antd'
import {getMaterialClass, getMaterialList, getAreaCityFun, materialCollectFun, getBrandFun} from 'server'
// import {queryBrandForMaterialSearchFun} from 'newApi' //查询分类相关品牌
import MaterialGoodsList from './components/Material-Item/'
import RecentView from 'components/Recent-View/'
import Layout from 'components/Layout/index';
import './style.less'
import {iconUrl} from 'config/evn';
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MaterialSearch extends React.Component {
	constructor(props) {
		super(props);
		this.intStartSale = React.createRef();
		this.fieldNames = {
			value: 'label', children: 'cities'
		};
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			loading: true,
			brandList: [],//品牌列表
			materialList: [],//材料列表
			materialCount: 0,//材料数量
			brandMore: false,//是否展品牌
			typeMore: false,//是否展开分类
			showBrandTag: false,//显示品牌标签
			canMulBrand: false,//选多个品牌
			searchKeyWord: this.props.router.query.keyword,//搜索关键字
			areaData: [],
			navPath: [],
			showType: 'img',//商品展示类型 img：大图 list:列表
			searchParams: {
				pageSize: 25,
				pageNum: 0,
				parameter: this.props.router.query.keyword,
				oneId: '',
				twoId: '',
				threeId: '',
				city: '',
				province: '',
				startSale: '',
				sort: 0,
				longitude: 0,
				latitude: 0,
				brandId: ''
			}
		};
	}

	componentWillMount() {
		this.getAllArea();
		this.queryMaterialClass();
	}

	componentDidMount() {
		this.setState({
			showType: cookie.load('isg') ? cookie.load('isg') : 'img'
		});
		this.getCityMap();
	}

	componentWillUpdate(prevProps) {
		const {query} = this.props.router;
		if (query.typeId !== prevProps.router.query.typeId || query.keyword !== prevProps.router.query.keyword) {
			this.queryMaterialClass();//分类
			this.getCityMap();
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
						self.queryMaterialList(true);
						self.queryBrandList();
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

	//查询材料分类
	queryMaterialClass() {
		getMaterialClass().then(res => {
			let navPath = [];
			if (this.props.router.query.typeId)
				navPath = this.setNavPath(res.data, this.props.router.query.typeId, 1);
			else {
				navPath.push({name: '现货直采', list: res.data})
			}
			this.setState({
				navPath
			})
		})
	}

	//品牌列表
	queryBrandList = () => {
		let {type, id} = this.getSearchParams();
		let params = {
			type: type,
			classId: id,
			keywords: this.state.searchKeyWord || ''
		};
		getBrandFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					brandList: res.data
				})
			}
		})
	};

	//设置路径和分类
	setNavPath = (nodes, leafId, leave, path) => {
		if (path === undefined) {
			path = [{name: '', list: nodes}];
		}
		for (let i = 0; i <= nodes.length; i++) {
			let tmpPath = path.concat();
			if (nodes[i]) {
				tmpPath.push(nodes[i]);
				let curValue = leave.toString() + nodes[i].id;
				if (curValue === leafId) {
					return tmpPath;
				}
				if (nodes[i].list) {
					let findResult = this.setNavPath(nodes[i].list, leafId, leave + 1, tmpPath);
					if (findResult) {
						return findResult
					}
				}
			}
		}
	};

	//取得查询的分类类型 1:一级；2：二级；3：三级
	//取得查询的分类Id
	getSearchParams = () => {
		const {typeId} = this.props.router.query;
		let searchClassType = 0, searchClassId = '';
		if (typeId) {
			searchClassType = typeId.substring(0, 1);
			searchClassId = typeId.substring(1, typeId.length);
		}
		return {type: searchClassType, id: searchClassId};
	};

	//查询材料列表
	queryMaterialList(init) {
		const {searchParams} = this.state;
		const {type, id} = this.getSearchParams();
		searchParams.parameter = this.props.router.query.keyword;
		if (!searchParams.parameter)
			switch (type) {
				case '1':
					searchParams.oneId = id;
					break;
				case '2':
					searchParams.twoId = id;
					break;
				case '3':
					searchParams.threeId = id;
					break;
			}
		else {
			searchParams.oneId = '';
			searchParams.twoId = '';
			searchParams.threeId = '';
		}
		if (init) {
			searchParams.pageNum = 0;
			this.setState({
				searchParams
			})
		}
		getMaterialList(searchParams).then(res => {
			if (res.result === 'success')
				this.setState({
					materialList: res.data ? res.data.list : [],
					materialCount: res.data ? res.data.count : 0,
					loading: false
				})
		}).catch(error => {
			message.error(error);
		})
	}

	//选择品牌
	changeSubClassId(id, name) {
		let {searchParams, brandList} = this.state;
		searchParams.brandId = id;
		brandList = brandList.filter(item => item.name === name);
		this.setState({
			showBrandTag: true,
			searchParams,
			brandList
		}, () => {
			this.queryMaterialList(true);
		});
	}

	//分页
	onPageChange = (page, pageSize) => {
		let {searchParams} = this.state;
		searchParams.pageNum = page - 1;
		this.setState({
			searchParams
		}, () => {
			this.queryMaterialList();
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
			this.queryMaterialList(true)
		})
	};

	//改变排序类型
	changeSortType = (value) => {
		const {searchParams} = this.state;
		searchParams.sort = value;
		this.setState({
			searchParams
		}, () => {
			this.queryMaterialList(true)
		})
	};

	//起订量变化
	onStartSaleChange = (e) => {
		if (e.nativeEvent.keyCode === 13) {
			const {searchParams} = this.state;
			searchParams.startSale = this.intStartSale.current.input.value;
			this.setState({
				searchParams
			}, () => {
				this.queryMaterialList()
			})
		}
	};

	//收藏商品
	addCollectPro = (pId) => {
		let params = {
			pId,
			userCode: this.userCode
		};
		materialCollectFun(params).then(res => {
			if (res.result === 'success') {
				let {materialList} = this.state;
				let materialIndex = materialList.findIndex(item => item.materialId === pId);
				materialList[materialIndex].collectionStatus = 1;
				this.setState({
					materialList
				})
			}
		})
	};

	//品牌被选中时，更新搜索条件
	selMulBrand = (e) => {
		if (e.target.checked) {
			let {searchParams} = this.state;
			searchParams.brandId += e.target.value + ',';
			this.setState({
				searchParams
			})
		} else {
			let {searchParams} = this.state;
			let newArray = searchParams.brandId.substring(0, searchParams.brandId.length - 1).split(',');
			let index = newArray.indexOf(e.target.value.toString());
			newArray.splice(index, 1);
			searchParams.brandId = newArray.toString();
			this.setState({
				searchParams
			})
		}
	};

	//删除选中的品牌
	removeSelBrand = () => {
		let {searchParams} = this.state;
		searchParams.brandId = '';
		this.setState({
			searchParams,
			showBrandTag: false
		}, () => {
			this.queryBrandList();
			this.queryMaterialList(true)
		})
	};

	submitSelMulBrand = () => {
		let {brandList, searchParams} = this.state;
		if (!searchParams.brandId) return false;

		let newArray = searchParams.brandId.split(',');
		brandList = brandList.filter(item => newArray.indexOf(item.brandId.toString()) >= 0);
		this.setState({
			canMulBrand: false,
			brandList,
			showBrandTag: true
		}, () => {
			this.queryMaterialList(true)
		})
	};

	changeShowType = (value) => {
		cookie.save('isg', value);
		this.setState({
			showType: value
		});
	};

	render() {
		const {typeMore, brandMore, canMulBrand, showBrandTag, showType, expandIndex, areaData, searchKeyWord, materialList, materialCount, searchParams, navPath, brandList, loading} = this.state;
		let searchValue = this.props.router.query.keyword || (navPath[3] && navPath[3].name) || (navPath[2] && navPath[2].name) || (navPath[1] && navPath[1].name);
		let pageTitle = this.props.router.query.keyword || (navPath[3] && navPath[3].name) || (navPath[2] && navPath[2].name) || (navPath[1] && navPath[1].name) || '现货直采';

		return (
			<Layout title={pageTitle} searchKey={this.props.router.query.typeId} menuIndex='buy'>
				<section className="resultMenu">
					{/*路径*/}
					<aside style={{position: 'relative'}}>
						<Breadcrumb separator={<IconFont type='iconfont-jiantou2' className="h6" style={{verticalAlign: 'unset'}} />}
						            className='text-grey ptb1'>
							<Breadcrumb.Item href="/">首页</Breadcrumb.Item>
							{
								navPath.map((item, index) => {
									let content = '';
									if (item.name)
										item.name === '现货直采' ?
											content = <Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>
											:
											content = <Breadcrumb.Item className="bread-item" key={index}>
												<div className="break-item-name">{item.name} <IconFont type="iconfont-xiajiantou" className="text-lightgrey" /></div>
												<ul className="bread-item-list">
													{
														navPath[index - 1] && navPath[index - 1].list.map((subItem, key) => {
															return <li key={key}><a href={`/search/material?typeId=${index.toString() + subItem.id}`}>{subItem.name}</a></li>
														})
													}
												</ul>
											</Breadcrumb.Item>;
									return content
								})
							}
							{
								searchKeyWord ?
									<Breadcrumb.Item>搜索"<span className="text-info">{this.props.router.query.keyword}</span>"</Breadcrumb.Item>
									:
									null
							}
						</Breadcrumb>
					</aside>
					{/*品牌标签*/}
					{
						showBrandTag ?
							<div className="select-brand">
								品牌：
								{
									brandList && brandList.map((item, index) => {
										return <Fragment key={index}><i key={index}>{item.name}</i>{index === brandList.length - 1 ? '' : '，'}</Fragment>
									})
								}
								<IconFont type='iconfont-guanbi' onClick={this.removeSelBrand} />
							</div>
							:
							null
					}
					<aside className="search-condition-panel">
						{/*分类*/}
						<div className={`search-condition-item ${typeMore ? 'expand' : ''}`}>
							{
								navPath.length && navPath[navPath.length - 1].list ?
									<Fragment>
										<label className="title">分类：</label>
										<ul className="categoryDetail">
											<li className={searchParams.oneId === '' ? 'active' : ''}>不限</li>
											{
												navPath[navPath.length - 1].list.map((item, index) => {
													return (
														<li key={index} className={item.id === searchParams.oneId ? 'active' : ''}>
															<a href={`/search/material?typeId=${navPath.length.toString() + item.id}`}>{item.name}</a>
														</li>
													)
												})
											}
										</ul>
										<label className={`more ${ navPath[navPath.length - 1].list.length > 12 ? '' : 'hide'}`}>
											<Button className={`${typeMore ? 'hide' : ''}`} onClick={() => this.setState({typeMore: true})}>
												<i>展开</i>
												<IconFont type="iconfont-xiajiantou" />
											</Button>
											<Button className={`${typeMore ? '' : 'hide'}`} onClick={() => this.setState({typeMore: false})}>
												<i>收起</i>
												<IconFont type="iconfont-xiangshang" />
											</Button>
										</label>
									</Fragment>
									:
									null
							}
						</div>
						{/*品牌*/}
						<div className={`search-condition-item ${brandMore || canMulBrand ? 'expand' : ''}`}>
							<label className="title">品牌：</label>
							{
								canMulBrand ?
									//多选品牌
									<div className="multiple">
										<ul className="categoryDetail">
											{
												brandList && brandList.map((item, index) => {
													return (
														<li key={index}>
															<Checkbox value={item.brandId} onChange={this.selMulBrand} className="h6">{item.name}</Checkbox>
														</li>
													)
												})
											}
										</ul>
										<div className="mt1 text-center">
											<Button type='primary' size="small" onClick={this.submitSelMulBrand} ghost>确定</Button>
											<span className="prl2" />
											<Button size="small" onClick={() => {
												this.setState({
													canMulBrand: false
												})
											}}>取消</Button>
										</div>
									</div>
									:
									//单选品牌
									<ul className="categoryDetail">
										<li className={searchParams.brandId ? '' : 'active'}>
											<span className="text-darkgrey">不限</span>
										</li>
										{
											brandList && brandList.map((item, index) => {
												return (
													<li key={index}>
														<span onClick={() => this.changeSubClassId(item.brandId, item.name)}>{item.name}</span>
													</li>
												)
											})
										}
									</ul>
							}
							<label className={`more ${brandList.length > 12 ? 'show' : 'hide'}`}>
								{
									!canMulBrand ?
										<Fragment>
											<Button onClick={() => {
												this.setState({brandMore: true})
											}}
											        className={`${brandMore ? 'hide' : ''}`}
											>
												<IconFont type="iconfont-add" />
												<i>更多</i>
											</Button>
											<Button onClick={() => {
												this.setState({brandMore: false})
											}}
											        className={`${brandMore ? '' : 'hide'}`}
											>
												<IconFont type="iconfont-add" />
												<i>收起</i>
											</Button>
										</Fragment>
										:
										null
								}
							</label>
							<label className={`more ${!canMulBrand ? 'show' : 'hide'}`}>
								<Button onClick={() => {
									this.setState({canMulBrand: true})
								}}>
									<IconFont type="iconfont-add" />
									<i>多选</i>
								</Button>
							</label>
						</div>
					</aside>
					{/*排序/起订量/所在地区*/}
					<aside className="sort-wrapper">
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
								className={`item ${searchParams.sort === 5 || searchParams.sort === 6 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(searchParams.sort === 5 ? 6 : 5)}
							>
								价格<i className={`iconfont ${searchParams.sort !== 5 ? 'iconfont-jiantou_xiangshang_o' : 'iconfont-jiantou_xiangxia_o'}`} />
							</li>
							<li
								className={`item ${searchParams.sort === 3 || searchParams.sort === 4 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(searchParams.sort === 3 ? 4 : 3)}
							>
								距离<i className={`iconfont ${searchParams.sort !== 4 ? 'iconfont-jiantou_xiangshang_o' : 'iconfont-jiantou_xiangxia_o'}`} />
							</li>
							<li>
								<label className="text-muted">起订量：</label>
								<Input style={{width: '65px', height: '25px', background: '#f5f5f5'}} ref={this.intStartSale} onKeyPress={this.onStartSaleChange} />
								<label className="text-darkgrey"> 以下</label>
							</li>
						</ul>
						<ul className="sort-content">
							<li className="area">
								<Cascader options={areaData}
								          fieldNames={this.fieldNames}
								          onChange={this.areaChange}
								          expandTrigger='hover'
								>
									{/*已经选择城市，显示选择的城市，没有选择城市，显示全部地区*/}
									<a href="#">{searchParams.city ? searchParams.city : '全部地区'}</a>
								</Cascader>
							</li>
							<li className="show-type">
								<a
									className={`${showType === 'img' ? 'text-primary' : 'text-muted'}`}
									onClick={() => this.changeShowType('img')}
								><Icon type="appstore" theme="filled" /> 大图
								</a>
							</li>
							<li className="show-type">
								<a
									className={`${showType === 'list' ? 'text-primary' : 'text-muted'}`}
									onClick={() => this.changeShowType('list')}
								><IconFont type="iconfont-fenleisvg" /> 列表
								</a>
							</li>
							<li className="total">
								共{materialCount}件商品
							</li>
						</ul>
					</aside>
					{/*----商品详情---*/}
					<MaterialGoodsList
						isLoading={loading}
						materialList={materialList}
						addCollectPro={this.addCollectPro}
						showType={showType}
						searchKeyWord={searchValue}
					/>
					{/*---分页---*/}
					<aside className="mt2 text-right">
						<Pagination
							showQuickJumper={<Button type="primary">确定</Button>}
							current={searchParams.pageNum + 1}
							total={materialCount}
							pageSize={searchParams.pageSize}
							onChange={this.onPageChange.bind(this)}
						/>
					</aside>
					<aside className="mt4">
						<RecentView />
					</aside>
				</section>
			</Layout>

		)
	}
}

export default withRouter(MaterialSearch)



