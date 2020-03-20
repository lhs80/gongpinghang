import React from 'react'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/index'
import {Row, Col, Button, Input, Select, Table, Pagination, Dropdown, Menu, Icon, List} from 'antd'
import {iconUrl} from 'config/evn'

import {
	getPriceListFun,
	getPriceCity,
	queryYearFun,
	materialTypeListFun
} from 'server'
import './price.less'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MaterialIndex extends React.Component {
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
			}, {
				title: '含税价(元)',
				dataIndex: 'unitPrice',
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
			materialName: '',//this.props.match.params.keyword,
			city: '',
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
		let searchCond = JSON.parse(window.localStorage.getItem('searchCond'));
		this.setState({
			issue: searchCond.issue,
			province: searchCond.province,
			materialName: searchCond.keyWord
		});
		this.getAllArea()
	}

	/**
	 * 省市区数据
	 * */
	getAllArea() {
		let tempProvinces = [], tempCities = [];
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
					this.setState({
						provinces: tempProvinces,
						cities: tempCities,
						city: JSON.parse(window.localStorage.getItem('searchCond')).city
					}, () => {
						this.queryYear(this.state.city, 1)
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
			start: this.state.curPage
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
	queryYear = (cityId, type) => {
		queryYearFun(cityId).then(res => {
			if (res.result === 'success') {
				this.setState({
					issueList: res.data
				}, () => {
					let tempIssueName = this.state.issueList.filter(item => item.id === this.state.issue);
					this.setState({
						issue: this.state.issueList[0].id,
						issueName: (type ? tempIssueName[0].period : this.state.issueList[0].period) || '选择期次'
					});
					this.materialTypeList(this.state.issue)
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
					materialsClassification: res.data[0].id
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
			this.queryYear(this.state.city, 0)
		});
	};

	handleChangecity = (value) => {
		this.setState({
			city: value.key
		}, () => {
			this.queryYear(this.state.city, 0)
		});
	};

	keyWordChange = (e) => {
		this.setState({
			materialName: e.target.value || ''
		})
	};

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
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
			this.getPriceList();
		})
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

	render() {
		const {provinces, cities} = this.state;
		const provinceOptions = provinces.map((province, index) => <Select.Option value={index} key={index}>{province}</Select.Option>);
		const cityOptions = cities.map((city, index) => <Select.Option value={city.cityid} key={index}>{city.city}</Select.Option>);
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
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" menuIndex={'price'}>
				<section style={{minHeight: '610px'}} className="bg-white">
					<div><img src='/static/images/bg-price.png' alt="" style={{width: '100%'}} /></div>
					{/*询价列表*/}
					<aside>
						<Row className="p2" type='flex' align="middle">
							<Col span={4}>
								<Dropdown overlay={menu}>
									<h1>
										<b>{this.state.issueName ? this.state.issueName : '选择期次'}</b>
										<IconFont type="iconfont-triangle-bottom" className="iconfont-triangle-bottom h0 text-muted" />
									</h1>
								</Dropdown>
							</Col>
							<Col span={12}>
								<label className="h5" style={{marginRight: '10px'}}>查询</label>
								<Input style={{width: '160px'}}
								       defaultValue={this.state.materialName}
								       size="large"
								       placeholder="请输入材料名称"
								       // suffix={
									     //   this.state.materialName ?
										   //     <IconFont type="iconfont-guanbi" style={{color: 'rgba(0,0,0,.45)'}} onClick={this.delSearch} />
										   //     : null
								       // }
								       allowClear={true}
								       onChange={this.keyWordChange}
								       value={this.state.materialName}
								/>
								<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginLeft: '24px', width: '100px'}}
								        onClick={this.getPriceList}>查询</Button>
							</Col>
							<Col span={8} className="text-right">
								<span className="h5 prl1">城市</span>
								<Select style={{width: 100}} onChange={this.handleChangeprovince} size="large" value={this.state.province}>
									{provinceOptions}
								</Select>
								<Select labelInValue style={{width: 100, marginLeft: '8px'}} onChange={this.handleChangecity} size="large"
								        value={{key: this.state.city}}>
									{cityOptions}
								</Select>
							</Col>
						</Row>
						{(() => {
							if (this.state.priceList.length > 0 && this.userCode !== 'guest') {
								return (
									<div className="prl2">
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
														       Router.push({pathname: '/price/detail', query: {id: record.id}})
													       // window.location.href = `/#/pricedetail/${record.id}`;
													       else
														       Router.push('/login/index')
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
							} else if (this.state.priceList.length > 0 && this.userCode === 'guest') {
								return (
									<div className="prl2">
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
														       window.location.href = `/#/pricedetail/${record.id}`;
													       else
														       window.location.href = `/account.html#/login/${encodeURIComponent(window.location.href)}`
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
			</Layout>
		)
	}
}

export default withRouter(MaterialIndex)
