import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/index'
import {
	Row,
	Col,
	Button,
	Input,
	Select,
	Table,
	Pagination,
	Dropdown,
	Menu,
	Icon,
	List,
	Divider,
	message
} from 'antd'
import {iconUrl} from 'config/evn'
import {
	getPriceListFun,
	getPriceCity,
	queryYearFun,
	materialTypeListFun
} from 'server'
import './price.less'
import cookie from 'react-cookies';

let timerStart = undefined;

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MaterialIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.columnsLogin = [
			{
				title: '名称',
				dataIndex: 'materialName',
			}, {
				title: '规格型号',
				dataIndex: 'specification',
			}, {
				title: '单位',
				dataIndex: 'measureUnit',
			}, {
				title: '除税价(元)',
				dataIndex: 'unitSellingPrice',
				render: (text, record) => {
					return record.unitSellingPrice === -1 ? '--' : record.unitSellingPrice
				}
			}, {
				title: '含税价(元)',
				dataIndex: 'unitPrice',
				render: (text, record) => {
					return record.unitPrice === -1 ? '--' : record.unitPrice
				}
			}
		];
		this.columns = [
			{
				title: '名称',
				dataIndex: 'materialName',
			}, {
				title: '规格型号',
				dataIndex: 'specification',
			}, {
				title: '单位',
				dataIndex: 'measureUnit',
			}
		];
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			priceList: [],
			cityData: [],
			cities: [],
			provinces: [],
			materialsClass: [],
			issueList: [],
			materialName: '',
			city: '',
			province: '',
			issue: '',
			issueName: '',
			materialsClassification: '',
			curPage: 0,
			total: 0,
			pagination: {
				defaultPageSize: 16,
				showQuickJumper: true,
				total: 0,
				onChange: this.onCurPageChange
			}
		}
	}

	componentDidMount() {
		this.queryCurCityByAmap();
	}

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
						city: result.city.substring(0, result.city.length - 1)
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
		getPriceCity().then(res => {
			if (res.result === 'success') {
				this.setState({
					cityData: res.data,
				}, () => {
					this.state.cityData.map((item, index) => {
						tempProvinces.push(item.province);
						if (item.province === this.state.province) {
							tempCities = item.cities;
						}
					});
					tempCities.forEach((item, index) => {
						if (item.city === this.state.city) {
							tempCityId = item.cityid;
							return false;
						}
					});
					this.setState({
						provinces: tempProvinces,
						cities: tempCities,
						city: tempCityId
					}, () => {
						this.queryYear(tempCityId)
					});
				});
			}
		});
	}

	/**
	 * 信息价数据
	 * */
	getPriceList = () => {
		let params = {
			materialName: this.state.materialName,
			city: this.state.city,
			issue: this.state.issue,
			materialsClassification: this.state.materialsClassification,
			start: this.state.curPage,
			userCode: this.userCode
		};
		getPriceListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					priceList: res.data.list,
					total: res.data.count,
				})
			}
		})
	};

	/**
	 * 查询信息价期次
	 * */
	queryYear = (cityId) => {
		queryYearFun(cityId).then(res => {
			if (res.result === 'success') {
				this.setState({
					issueList: res.data,
					issue: res.data[0].id,
					issueName: res.data[0].period
				}, () => {
					this.materialTypeList(this.state.issueList[0].id)
				})
			}
		})
	};

	/**
	 * 查询信息价分类
	 * */
	materialTypeList = (id) => {
		materialTypeListFun(id).then(res => {
			if (res.result === 'success') {
				this.setState({
					materialsClass: res.data,
					materialsClassification: ''
				}, () => {
					this.getPriceList()
				})
			}
		})
	};

	/**
	 * 省市联动
	 * */
	handleChangeprovince = (value) => {
		const {cityData} = this.state;
		this.setState({
			province: value,
			cities: cityData[value].cities,
			city: cityData[value].cities[0].cityid
		}, () => {
			this.queryYear(this.state.city)
		});
	};

	handleChangecity = (value) => {
		this.setState({
			city: value.key
		}, () => {
			this.queryYear(this.state.city)
		});
	};

	keyWordChange = (e) => {
		this.setState({
			materialName: e.target.value
		})
	};

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		window.scrollTo(0, 0);
		this.setState({
			curPage: page - 1
		}, () => {
			this.getPriceList();
		});
	};

	/**
	 * 分类变化时重新加载信息价列表
	 **/
	materialTypeChange = (id) => {
		this.setState({
			materialsClassification: id
		}, () => {
			this.getPriceList();
		})
	};

	/**
	 * 期次变化时重新加载信息价列表
	 **/
	materialIssueChange = (id, name) => {
		this.setState({
			issue: id,
			issueName: name
		}, () => {
			this.materialTypeList(id);
			this.getPriceList();
		})
	};

	onSearch = () => {
		let params = {
			issue: this.state.issue,
			province: this.state.provinces[this.state.province] || this.state.province,
			city: this.state.city,
			keyWord: this.state.materialName
		};
		if (this.state.materialName) {
			window.localStorage.setItem('searchCond', JSON.stringify(params));
			Router.push('/price/search')
		} else {
			this.setTime('搜索内容不能为空!');
		}
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
	//删除搜做矿的内容
	delSearch = () => {
		this.setState({
			materialName: ''
		})
	};
	/*
 * 倒计时
 * */
	setTime = (msg) => {
		clearTimeout(timerStart);
		timerStart = setTimeout(function () {
			message.info(msg, 0.5)
		}, 500)
	};

	render() {
		const {provinces, cities} = this.state;
		const provinceOptions = provinces.map((province, index) => <Select.Option value={index}
		                                                                          key={index}>{province}</Select.Option>);
		const cityOptions = cities.map((city, index) => <Select.Option value={city.cityid}
		                                                               key={index}>{city.city}</Select.Option>);
		const menu = (
			<Menu>
				{
					this.state.issueList.length ?
						this.state.issueList.map((item, index) => {
							return (
								<Menu.Item key={index} onClick={() => this.materialIssueChange(item.id, item.period)}>
									<span>{item.period}</span>
								</Menu.Item>
							)
						})
						:
						''
				}
			</Menu>
		);
		return (
			<Layout title={'信息价'} menuIndex={'price'}>
				<div className="bg-white">
					<div><img src='/static/images/bg-price.png' alt="" style={{width: '100%'}} /></div>
					{/*期次*/}
					<section className="bg-white ptb2" style={{overflow: 'hidden'}}>
						<aside className="type-panel">
							<Dropdown overlay={menu}>
								<div className="issue-title">
									<b>{this.state.issueName ? this.state.issueName : '选择期次'}</b>
									<IconFont type="iconfont-triangle-bottom" className="iconfont-triangle-bottom h0 text-muted" />
								</div>
							</Dropdown>
							<div className={`mt4 prl3 ${this.state.materialsClassification === '' ? 'text-primary' : ''}`}
							     style={{cursor: 'pointer'}}
							     onClick={() => this.materialTypeChange('')}
							>
								查看所有分类
							</div>
							<div className="prl3">
								<Divider style={{margin: '12px 0'}} />
							</div>
							<List
								className="prl3 text-darkgrey"
								dataSource={this.state.materialsClass}
								renderItem={item => (
									<List.Item onClick={() => {
										this.materialTypeChange(item.id)
									}}>
                  <span
	                  className={`text-hover ${this.state.materialsClassification === item.id ? 'text-primary' : ''}`}
	                  style={{cursor: 'pointer'}}>
                    {item.type}
                  </span>
									</List.Item>
								)}
							/>
						</aside>
						<aside className="price-panel">
							<Row className="p2">
								<Col span={12}>
									<label style={{marginRight: '10px'}}>查询</label>
									<Input style={{width: '255px'}} size="large" placeholder="请输入材料名称"
									       onChange={this.keyWordChange}
									       allowClear={true}
										// suffix={
										//   this.state.materialName ?
										//     <IconFont type="iconfont-guanbi" style={{color: 'rgba(0,0,0,.45)'}}
										//               onClick={this.delSearch} />
										//     : null
										// }
										     value={this.state.materialName} />
									<Button type="primary"
									        size="large"
									        className="bg-primary-linear border-radius"
									        style={{marginLeft: '24px', width: '100px'}}
									        onClick={this.onSearch}
									>查询</Button>
								</Col>
								<Col span={12} className="text-right">
									<span className="h6 prl1">城市</span>
									<Select style={{width: 100}} onChange={this.handleChangeprovince} size="large"
									        value={this.state.province}>
										{provinceOptions}
									</Select>
									<Select labelInValue style={{width: 100, marginLeft: '8px'}} onChange={this.handleChangecity}
									        size="large"
									        value={{key: this.state.city}}>
										{cityOptions}
									</Select>
								</Col>
							</Row>
							{(() => {
								if (this.state.priceList.length > 0 && this.userCode !== 'guest') {
									return (
										<div>
											<Table ref="table"
											       hideDefaultSelections={true}
											       className="mt2 text-muted"
											       rowKey={record => record.id}
											       columns={this.columnsLogin}
											       pagination={false}
											       dataSource={this.state.priceList}
											       onRow={(record) => {
												       return {
													       onClick: (event) => {
														       if (this.userCode !== 'guest')
															       Router.push({pathname: '/price/detail', query: {id: record.id}});
														       else
															       Router.push({pathname: '/login/index'});
													       }
												       };
											       }}
											/>
											<div className="mt3 text-right">
												<Pagination {...this.state.pagination} total={this.state.total} />,
											</div>
										</div>
									)
								} else if (this.state.priceList.length > 0 && this.userCode === 'guest') {
									return (
										<div>
											<Table ref="table"
											       hideDefaultSelections={true}
											       className="mt2 text-muted"
											       rowKey={record => record.id}
											       columns={this.columns}
											       pagination={false}
											       dataSource={this.state.priceList}
											       onRow={(record) => {
												       return {
													       onClick: (event) => {
														       if (this.userCode !== 'guest')
															       Router.push({pathname: '/price/detail', query: {id: record.id}});
														       // window.location.href = `/#/pricedetail/${record.id}`;
														       else
															       Router.push({pathname: '/login/index'});
														       // window.location.href = `/account.html#/login/${encodeURIComponent(window.location.href)}`
													       }
												       };
											       }}
											/>
											<div className="mt3 text-right">
												<Pagination {...this.state.pagination} total={this.state.total} />,
											</div>
										</div>
									)
								} else {
									return (
										<aside className="text-center ptb6">
											<div><img src='/static/images/icon-nodata.png' alt="" /></div>
											<h3 className="mt3 text-muted">没有相关信息！</h3>
										</aside>
									)
								}
							})()}
						</aside>
					</section>
				</div>
			</Layout>
		);
	}
}
