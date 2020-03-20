// 招标公告
import React, {Component} from 'react';
import Router from 'next/router'
import Layout from 'components/Layout/index'
import {Table, Divider, Checkbox, Cascader, message, Button, Input, Row, Col, Statistic, Pagination} from 'antd'
import {getAreaCityFun, queryInquiryHallList} from 'server';
import moment from 'moment'
import './style.less'

const {Countdown} = Statistic;

class EnquiryIndex extends Component {
	constructor(props) {
		super(props);
		this.columns = [
			{
				title: '询价单标题',
				dataIndex: 'title',
				width: 300,
			},
			{
				title: '商品种类',
				dataIndex: 'goodCount',
			},
			{
				title: '收货地区',
				dataIndex: '',
				render: (record, text) => {
					return <div>{record.consigneeProvince || ''}-{record.consigneeCity || ''}</div>
				}
			},
			{
				title: '买家身份',
				dataIndex: 'buyerIdentity',
			},
			{
				title: '报价商家数',
				dataIndex: 'quoteCount',
			}, {
				title: '剩余时间',
				width: 200,
				render: (record) => {
					return <Countdown title="倒计时" value={record.validityTime}
					                  format={Math.abs(moment().diff(record.validityTime, 'days')) >= 1 ? 'D 天 H 时 m 分 s 秒' : 'HH:mm:ss'}
					                  valueStyle={{color: '#FFB432', fontSize: '14px'}} />
				}
			}, {
				title: '操作',
				key: 'action',
				render: (record, text) => <Button type="primary"
				                                  size="large"
				                                  className="bg-primary-linear border-radius"
				                                  onClick={() => {
					                                  Router.push({pathname: '/enquiry/detail', query: {id: record.inquirySheetId}})
				                                  }}>查看明细</Button>,
			},
		];
		this.fieldNames = {
			value: 'label', children: 'cities'
		};
		this.state = {
			list: [],
			dataTotal: 0,
			areaData: [],
			searchParams: {
				city: '',
				sort: 0,
				buyerIdentity: 0,
				title: '',
				pageNum: 1
			}
		}
	}

	componentDidMount() {
		this.getAllArea();
		this.getList();
	}

	getList = () => {
		let params = {
			pageSize: '20',
			...this.state.searchParams
		};
		queryInquiryHallList(params).then(res => {
			this.setState({
				list: res.data.list,
				dataTotal: res.data.count
			})
		}).catch(error => {
			message.error(error)
		})
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

	//地区变化
	areaChange = (value) => {
		const {searchParams} = this.state;
		searchParams.province = value[0] === '全部地区' ? '' : value[0];
		searchParams.city = value[1];
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	sort = (index) => {
		const {searchParams} = this.state;
		searchParams.sort = index;
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	changeBuyer = (e) => {
		const {searchParams} = this.state;
		searchParams.buyerIdentity = e.target.checked ? 1 : 0;
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	keyWordChange = (e) => {
		const {searchParams} = this.state;
		searchParams.title = e.target.value;
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	pageChange = (page, pageSize) => {
		const {searchParams} = this.state;
		searchParams.pageNum = page;
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	render() {
		const {list, areaData, searchParams, dataTotal} = this.state;
		return (
			<Layout title='询价大厅' menuIndex={'inquiry'}>
				<Row className="inquiry-search-panel" type="flex" align="middle">
					<Col span={16}>
						<Button type='link' className={`${searchParams.sort === 0 ? 'text-primary' : 'text-black'}`} onClick={() => this.sort(0)}>综合排序</Button>
						<Button type='link' className={`${searchParams.sort === 1 ? 'text-primary' : 'text-black'}`} onClick={() => this.sort(1)}>最新发布</Button>
						<Button type='link' className={`${searchParams.sort === 2 ? 'text-primary' : 'text-black'}`} onClick={() => this.sort(2)}>即将截止</Button>
						<Divider type="vertical" style={{height: '50px', margin: '0 30px'}} />
						<Checkbox onChange={this.changeBuyer} /> 企业买家
						<i style={{marginLeft: '30px'}}>收货地：</i>
						<Cascader
							size="large"
							options={areaData}
							fieldNames={this.fieldNames}
							onChange={this.areaChange}
							expandTrigger='hover'
							placeholder="请选择"
						>
							{/*<a href="#">{searchParams.city ? searchParams.city : '全部地区'}</a>*/}
						</Cascader>
					</Col>
					<Col span={8} className="text-right">
						<Input size="large" placeholder="输入询价单标题/商品名称/规格/型号" onPressEnter={this.getList} onChange={this.keyWordChange}
						       style={{marginTop: '10px', marginRight: '10px', width: '250px'}} allowClear />
						<Button type="primary" size="large" className='bg-primary-linear border-radius'>搜索</Button>
					</Col>
				</Row>
				<div className="bg-white">
					<Table columns={this.columns} dataSource={list} pagination={false} />
				</div>
				<div className="bg-white prl3 text-right ptb2">
					<Pagination defaultCurrent={1} total={dataTotal} hideOnSinglePage={true} pageSize={20} onChange={this.pageChange} />
				</div>
			</Layout>
		);
	}
}

export default EnquiryIndex;
