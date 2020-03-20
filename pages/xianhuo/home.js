import React from 'react'
import {withRouter} from 'next/router';
import {Pagination, Breadcrumb, message, Input, Cascader} from 'antd'
import {
	getMaterialClass,
	getMaterialClassByKeyWord,
	getMaterialList,
	getAreaCityFun
} from 'server'
import MaterialGoodsList from './components/Material-Item/index'
import Layout from 'components/Layout/index';

class MaterialSearch extends React.Component {
	constructor(props) {
		super(props);
		this.intStartSale = React.createRef();
		this.fieldNames = {
			value: 'label', children: 'cities'
		};
		this.state = {
			isShowMaterial: false,
			materialList: [],//材料列表
			materialCount: 0,
			materialClass: [],//材料默认分类列表
			expandIndex: -1,//当前展开的分类index
			searchType: 1,//this.props.match.params.typeId,//0从分类进入;1搜索关键字进入
			searchKeyWord: '',//搜索关键字
			areaData: [],
			searchParams: {
				pageSize: 48,
				pageNum: 0,
				parameter: '',
				oneId: '',
				twoId: '',
				threeId: '',
				city: '',
				province: '',
				startSale: '',
				sort: 0,
				longitude: 0,
				latitude: 0,
				threeType: '0',
				firstName: '',
				secondName: '',
				threeName: ''
			}
		};
	}

	componentDidMount() {
		this.getAllArea();
		this.queryMaterialClass();//分类
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
						self.queryMaterialList();
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

	//从分类进入页面时，查询默认材料分类
	queryMaterialClass() {
		getMaterialClass({threeType: ''}).then(res => {
			this.setState({
				materialClass: res.data
			}, () => {
				const {searchParams} = this.state;
				if (!res.data[0]) return false;
				// searchParams.oneId = res.data[0].oneId;
				this.setState({
					searchParams,
				}, () => {
					this.getCityMap();
				})
			});
		}).catch(error => {
			message.error(error);
		})
	}

	//查询材料列表
	queryMaterialList(init) {
		const {searchParams} = this.state;
		if (init) {
			searchParams.pageNum = 0;
			this.setState({
				searchParams,
			})
		}
		getMaterialList(searchParams).then(res => {
			this.setState({
				isShowMaterial: true,
				materialList: res.data.list || [],
				materialCount: res.data.count || 0
			})
		}).catch(error => {
			message.error(error);
		})
	}

	//改变分类Id
	changeFirstClassId(id, name) {
		const {searchParams} = this.state;
		if (searchParams.oneId === id) return;
		if (!id) {
			searchParams.oneId = '';
			searchParams.twoId = '';
			searchParams.threeId = '';
		} else {
			searchParams.oneId = id;
		}
		this.setState({
			searchParams,
			expandIndex: -1,
			firstName: name,
			secondName: '',
			threeName: ''
		}, () => {
			this.queryMaterialList(true);
		})
	}

	//改变品类Id
	changeSecondClassId(id, name) {
		const {searchParams} = this.state;
		if (searchParams.twoId === id) return;
		searchParams.twoId = searchParams.twoId > 0 && searchParams.twoId === id ? -1 : id;
		this.setState({
			searchParams,
			secondName: name,
			threeName: '',
			// expandIndex: -1
		}, () => {
			this.queryMaterialList(true);
		});
	}

	//改变品名Id
	changeSubClassId(id, name) {
		const {searchParams} = this.state;
		if (searchParams.threeId === id) return;
		searchParams.threeId = searchParams.threeId > 0 && searchParams.threeId === id ? -1 : id;
		this.setState({
			searchParams,
			threeName: name,
			// expandIndex: -1,
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
		if (e.nativeEvent.keyCode === 13) { //e.nativeEvent获取原生的事件对像
			const {searchParams} = this.state;
			searchParams.startSale = this.intStartSale.current.input.value;
			this.setState({
				searchParams
			}, () => {
				this.queryMaterialList()
			})
		}
	};

	render() {
		const {materialClass, expandIndex, areaData, searchKeyWord, materialList, materialCount, searchParams, threeName, secondName, firstName} = this.state;
		//过滤二级品类
		const secondMaterialList = materialClass.filter(item => item.oneId === searchParams.oneId)[0] || [];
		//过滤三级品名
		const subMaterialList = secondMaterialList.list ? secondMaterialList.list.filter(item => item.twoId === searchParams.twoId)[0] : [];
		//共多少页
		const pageTotal = Math.ceil(materialCount / searchParams.pageSize);
		return (
			<Layout title='现货直采' searchType={'p'} searchKey={this.props.router.query.keyword} menuIndex={'buy'}>
				<section className="resultMenu">
					<Breadcrumb separator=">" className='text-lightgrey ptb1'>
						<Breadcrumb.Item>首页</Breadcrumb.Item>
						<Breadcrumb.Item>现货直采</Breadcrumb.Item>
					</Breadcrumb>
					{/*类目与品牌*/}
					<aside className="search-condition-panel">
						{/*分类*/}
						<div className="search-condition-item">
							<label className="title">分类：</label>
							<ul className="categoryDetail">
								<li className={searchParams.oneId ? '' : 'active'}>
									<a className="text-darkgrey" onClick={() => this.changeFirstClassId('')}>不限</a>
								</li>
								{
									materialClass && materialClass.map((item, index) => {
										return (
											<li key={index} className={item.oneId === searchParams.oneId ? 'active' : ''}>
												<a className="text-darkgrey" onClick={() => this.changeFirstClassId(item.oneId, item.oneName)}>{item.oneName}</a>
											</li>
										)
									})
								}
							</ul>
							<label className={`more ${materialClass && materialClass.length > 19 ? '' : 'hide'}`}>
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
						{/*品类*/}
						<div className={`search-condition-item ${expandIndex === 2 ? 'expand' : ''}`}>
							<label className="title">品类：</label>
							<ul className="categoryDetail">
								<li className={searchParams.twoId ? '' : 'active'}>
									<a className="text-darkgrey" onClick={() => this.changeSecondClassId('')}>不限</a>
								</li>
								{
									searchParams.oneId >= 0 && secondMaterialList && secondMaterialList.list && secondMaterialList.list.map((item, index) => {
										return (
											<li key={index} className={item.twoId === searchParams.twoId ? 'active' : ''}>
												<a className="text-darkgrey" onClick={() => this.changeSecondClassId(item.twoId, item.twoName)}>{item.twoName}</a>
											</li>
										)
									})
								}
							</ul>
							<label
								className={`more ${secondMaterialList && secondMaterialList.list && secondMaterialList.list.length > 19 ? '' : 'hide'}`}>
										<span className={`${expandIndex === 2 ? 'hide' : 'show'}`}
										      onClick={() => this.setState({expandIndex: 2})}>
											<i>展开</i>
											<i className="iconfont iconfont-xiajiantou h6" />
										</span>
								<span className={`${expandIndex === 2 ? 'show' : 'hide'}`} onClick={() => this.setState({expandIndex: -1})}>
													<i>收起</i>
													<i className="iconfont iconfont-xiangshang h6" />
										</span>
							</label>
						</div>
						{/*品名*/}
						<div className={`search-condition-item ${expandIndex === 3 ? 'expand' : ''}`}>
							<label className="title">品名：</label>
							<ul className="categoryDetail">
								<li className={searchParams.threeId ? '' : 'active'}>
									<a onClick={() => this.changeSubClassId('')} className="text-darkgrey">不限</a>
								</li>
								{
									searchParams.twoId > 0 && subMaterialList && subMaterialList.list && subMaterialList.list.map((item, index) => {
										return (
											<li key={index} className={item.threeId === searchParams.threeId ? 'active' : ''}>
												<a onClick={() => this.changeSubClassId(item.threeId, item.threeName)} className="text-darkgrey">{item.threeName}</a>
											</li>
										)
									})
								}
							</ul>
							<label className={`more ${subMaterialList && subMaterialList.list && subMaterialList.list.length > 19 ? '' : 'hide'}`}>
										<span className={`${expandIndex === 3 ? 'hide' : 'show'}`} onClick={() => this.setState({expandIndex: 3})}>
											<i>展开</i>
											<i className="iconfont iconfont-xiajiantou h6" />
										</span>
								<span className={`${expandIndex === 3 ? 'show' : 'hide'}`} onClick={() => this.setState({expandIndex: -1})}>
												<i>收起</i>
												<i className="iconfont iconfont-xiangshang h6" />
										</span>
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
								className={`item ${searchParams.sort === 3 || searchParams.sort === 4 ? 'acitve' : ''}`}
								onClick={() => this.changeSortType(searchParams.sort === 3 ? 4 : 3)}
							>
								距离<i className={`iconfont ${searchParams.sort !== 4 ? 'iconfont-jiantou_xiangshang_o' : 'iconfont-jiantou_xiangxia_o'}`} />
							</li>
						</ul>
						<ul className="sort-content">
							<li>
								<label className="text-lightgrey">起订量：</label>
								<Input style={{width: '70px'}} ref={this.intStartSale} onKeyPress={this.onStartSaleChange} />
								<label className="text-darkgrey"> 以下</label>
							</li>
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
									total={materialCount}
									pageSize={searchParams.pageSize}
									onChange={this.onPageChange.bind(this)}
								/>
							</li>
						</ul>
					</aside>
					{/*----商品列表---*/}
					{
						this.state.isShowMaterial ?
							<MaterialGoodsList history={this.props.history} materialList={materialList}
							                   searchKeyWord={searchKeyWord || threeName || secondName || firstName} />
							:
							''
					}
					{/*---分页---*/}
					<aside className="mt2 text-right">
						<Pagination
							showQuickJumper
							current={searchParams.pageNum + 1}
							total={materialCount || 0}
							pageSize={searchParams.pageSize}
							onChange={this.onPageChange.bind(this)}
							showTotal={() => `${searchParams.pageSize}条/页 共计 ${materialCount} 条 当前页：${searchParams.pageNum + 1}/${pageTotal}`}
						/>
					</aside>
				</section>
			</Layout>

		)
	}
}

export default withRouter(MaterialSearch)



