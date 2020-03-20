import React from 'react'
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/index'
import {Row, Col, Card, Input, Icon, Pagination, Select} from 'antd'
import {
	bookParentTypeFun,
	bookSecondTypeFun,
	bookListFun,
	timestampToTime,
	bookAddFavourFun,
	bookCancelFavourFun,
	getAreaCityFun,
	queryBooksByCityFun
} from 'server'
import cookie from 'react-cookies';
import {iconUrl} from 'config/evn'
import './book.less'

const Search = Input.Search;
const {Meta} = Card;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class BookIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			childIsShowSearchSuggest: false,
			curParentType: '',//this.props.match.params.type,
			curSecondType: -1,
			curPage: 0,
			city: '',
			province: '',
			parentType: [],
			secondType: [],
			bookList: [],
			cityData: [],
			cities: [],
			provinces: [],
			pagination: {
				current: 1,
				defaultPageSize: 16,
				total: 0,
				onChange: this.onCurPageChange
			}
		}
	}

	componentDidMount() {
		this.getBookParentType();
		this.queryCurCityByAmap();
	}


	componentDidUpdate(prevProps) {
		if (prevProps.router.query.type !== this.props.router.query.type) {
			this.getBookParentType();
			this.queryCurCityByAmap();
		}
	}

	/**
	 * 一级分类
	 * */
	getBookParentType = () => {
		this.setState({
			curParentType: this.props.router.query.type
		}, () => {
			bookParentTypeFun().then(res => {
				if (res.result === 'success') {
					if (this.state.curParentType) {
						this.setState({
							parentType: res.data,
						}, () => {
							this.getBookSecondType();
						})
					} else {
						this.setState({
							parentType: res.data,
							curParentType: res.data[0].id
						}, () => {
							this.getBookSecondType();
						})
					}
				}
			})
		});

	};

	/**
	 * 一级分类改变
	 * */
	parentTypeChange = (id) => {
		this.setState({
			curPage: 0,
			pagination: {
				current: 1,
			},
			curParentType: id
		}, () => {
			this.getBookSecondType();
		})
	};

	/**
	 * 二级分类
	 * */
	getBookSecondType = () => {
		bookSecondTypeFun(this.state.curParentType).then(res => {
			if (res.result === 'success') {
				this.setState({
					secondType: res.data,
					curSecondType: res.data[0].bookTypeId
				}, () => {
					this.getBookList();
				})
			}
		})
	};

	/**
	 * 二级分类改变
	 * */
	secondTypeChange = (id) => {
		this.setState({
			curPage: 0,
			pagination: {
				current: 1,
			},
			curSecondType: id
		}, () => {
			this.getBookList();
		})
	};

	/**
	 * 书籍列表
	 **/
	getBookList = () => {
		bookListFun(this.state.curSecondType, this.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					bookList: res.data.list,
					pagination: {
						total: res.data.count
					}
				})
			}
		})
	};

	/**
	 * 页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		window.scrollTo(0, 0);
		this.setState({
			curPage: page - 1
		}, () => {
			if (this.state.curSecondType === -1)
				this.getBookListByCity(this.state.province + this.state.city);
			else
				this.getBookList();
		});
	};

	/**
	 * 添加收藏
	 **/
	addCollect = (e, id) => {
		e.preventDefault();
		if (this.userCode !== 'guest') {
			bookAddFavourFun(id, this.userCode).then(res => {
				if (res.result === 'success') {
					this.getBookList();
				}
			})
		} else
			Router.push({pathname: '/login/index', query: {redirectUrl: ''}})
		// window.location.href = `/account.html#/login//${encodeURIComponent(window.location.href)}`
	};

	/**
	 * 取消收藏
	 **/
	cancelCollect = (e, id) => {
		e.preventDefault();
		if (this.userCode !== 'guest') {
			bookCancelFavourFun(id, this.userCode).then(res => {
				if (res.result === 'success') {
					this.getBookList();
				}
			})
		} else
			Router.push({pathname: '/login/index', query: {redirectUrl: '/book/index'}})
	};

	/**
	 * 全局搜索
	 **/
	onSearch = (value) => {
		if (value)
			Router.push({pathname: '/book/search', query: {keyword: value}})
		// window.location.href = `/#/booksearch/${value}`
	};

	/**
	 * 自动定位当前城市
	 * */
	queryCurCityByAmap = () => {
		let self = this;
		let citysearch = new AMap.CitySearch();
		//自动获取用户IP，返回当前城市
		citysearch.getLocalCity(function (status, result) {
			if (status === 'complete' && result.info === 'OK') {
				if (result && result.city && result.bounds) {
					self.setState({
						province: result.province,
						city: result.city
					}, () => {
						self.getAllArea();
					});
				}
			}
		});
	};

	/**
	 * 省市区数据
	 * */
	getAllArea() {
		let tempProvinces = [], tempCities = [], tempCityId = '';
		getAreaCityFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					cityData: res.data,
				}, () => {
					this.state.cityData.map((item, index) => {
						tempProvinces.push(item);
						if (item.provinceName === this.state.province) {
							tempCities = item.cities;
							tempCities.unshift({cityName: '省级发文', cityId: '11111'})
						}
					});
					tempCities.forEach((item, index) => {
						if (item.cityName === this.state.city) {
							tempCityId = item.cityId;
							return false;
						}
					});
					this.setState({
						provinces: tempProvinces,
						cities: tempCities,
						city: tempCityId
					});
				});
			}
		});
	}

	/**
	 * 省份改变添加城市数据
	 * */
	handleChangeprovince = (value) => {
		const {cityData} = this.state;
		let curProvince = cityData.filter((item => item.provinceId === value.key));
		let tempCityData = curProvince[0].cities;
		tempCityData.unshift({cityName: '省级发文', cityId: '11111'});
		this.setState({
			province: value.label,
			cities: tempCityData
		});
	};

	/**
	 * 城市数据改变
	 * */
	handleChangecity = (value) => {
		this.setState({
			curPage: 0,
			pagination: {
				current: 1,
			},
			curSecondType: -1,
			city: value.label
		}, () => {
			if (value.label === '省级发文')
				this.getBookListByCity(this.state.province + value.label);
			else
				this.getBookListByCity(value.label);
		})
	};

	/**
	 * 根据城市查书籍列表
	 **/
	getBookListByCity = (city) => {
		queryBooksByCityFun(this.userCode, city, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					bookList: res.data.list,
					pagination: {
						total: res.data.count,
					}
				})
			}
		})
	};

	onLink = () => {
		if (this.userCode !== 'guest')
			Router.push({pathname: '/book/collect'});
		else
			Router.push({pathname: '/login/index', query: {redirectUrl: '/book/index'}})
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	/**
	 * 子组件中调用,显示对应的提示框
	 * */
	showTipOfInquiry = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	render() {
		const {parentType, curParentType, secondType, curSecondType, bookList} = this.state;
		const {provinces, cities} = this.state;
		const provinceOptions = provinces.map((province, index) => <Select.Option value={province.provinceId}
		                                                                          key={index}>{province.provinceName}</Select.Option>);
		const cityOptions = cities.map((city, index) => <Select.Option value={city.cityId}
		                                                               key={index}>{city.cityName}</Select.Option>);
		return (
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" className="page-content linear-bgcolor">
				<section>
					<aside className="book-search-panel">
						<div className="page-content-wrapper maxWidth">
							<label className="text-white">查询：</label>
							<Search
								placeholder="按名称或编号搜索"
								onSearch={value => this.onSearch(value)}
								enterButton="查询"
								style={{width: '255px'}}
							/>
						</div>
					</aside>
					<aside className="book-content bg-white">
						<div>
							{parentType.map((item, index) => {
								return (
									<span key={index}
									      style={{width: `${100 / parentType.length}%`, display: 'inline-block', cursor: 'pointer'}}
									      className={`h3 ptb2 text-center ${item.id === curParentType ? 'bg-white text-primary' : 'bg-lightgrey text-darkgrey'}`}
									      onClick={() => this.parentTypeChange(item.id)}
									>{item.name}</span>
								)
							})}
						</div>
						<div className="mt3 book-panel">
							<div className="left">
								{secondType.map((item, index) => {
									return (
										<h4 key={index}
										    className={`ptb1 text-center ${index !== 0 ? 'mt2' : ''} ${item.bookTypeId === curSecondType ? 'text-white bg-primary' : 'bg-white text-darkgrey'}`}
										    onClick={() => this.secondTypeChange(item.bookTypeId)}
										>{item.name}（{item.count}）</h4>
									)
								})}
							</div>
							<div className="right" style={{}}>
								<div className={`text-right ${curParentType === 17 ? 'block' : 'hide'}`}>
									<span className="h6 prl1">城市</span>
									<Select labelInValue style={{width: 100}} onChange={this.handleChangeprovince} size="default"
									        value={{key: this.state.province}}>
										{provinceOptions}
									</Select>
									<Select labelInValue style={{width: 100, marginLeft: '8px'}} onChange={this.handleChangecity}
									        size="default"
									        value={{key: this.state.city}}>
										{cityOptions}
									</Select>
								</div>
								<Row gutter={20} className="mt1">
									{
										bookList.map((item, index) => {
											return (
												<Col span={12} key={index} className={`${index > 1 ? 'mt2' : ''}`}>
													<Link href={{pathname:'/book/content',query:{id:item.postId,type:curParentType}}}>
														<Card>
															<Meta
																avatar={
																	item.flag ?
																		<div className="text-center" onClick={(e) => this.cancelCollect(e, item.postId)}>
																			<h6 className='flag active'><IconFont type="iconfont-collection-b" /></h6>
																			<h5 className="text-muted">已收藏</h5>
																		</div>
																		:
																		<div className="text-center" onClick={(e) => this.addCollect(e, item.postId)}>
																			<h6 className="flag"><IconFont type="iconfont-collection-b" /></h6>
																			<h5 className="text-muted">收藏</h5>
																		</div>
																}
																title={<div className="text-darkgrey text-ellipsis h3"
																            style={{marginTop: '2px'}}>{item.bookName}</div>}
																description={<div className="text-muted h6"
																                  style={{marginTop: '9px'}}>编号：{item.number} 发表时间：{timestampToTime(item.crawlTime)}</div>}
															/>
														</Card>
													</Link>
												</Col>
											)
										})
									}
								</Row>
							</div>
							<div onClick={this.onLink} className="btn-book-collect">
								<h3 className="text-primary"><IconFont type="iconfont-collection-b" /></h3>
								<h5 className="text-white mt1">我的收藏</h5>
							</div>
						</div>
						<div className="prl3 ptb2">
							<Pagination
								{...this.state.pagination}
								showQuickJumper
								hideOnSinglePage={false}
								className="mt6"
								style={{textAlign: 'right', marginBottom: '30px'}}
								onChange={this.onCurPageChange}
							/>
						</div>
					</aside>
				</section>
			</Layout>
		)
	}
}

export default withRouter(BookIndex)
