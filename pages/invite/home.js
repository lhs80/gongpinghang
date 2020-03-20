// 扫标公告
import React, {Component} from 'react';
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/invite'
import {Table, Divider, Select, Cascader, message, Button, Input, Row, Col, Statistic, Pagination} from 'antd'
import {inviteListFun} from 'inviteApi';
import {getAreaCityFun} from 'server';
import moment from 'moment'
import './style.less'

const {Countdown} = Statistic;
const {Option} = Select;

class EnquiryIndex extends Component {
	constructor(props) {
		super(props);
		this.columns = [
			{
				title: '招标标题',
				dataIndex: '',
				width: 300,
				render: (record) => {
					return <div>
						<i className="bg-primary text-white border-radius h6" style={{padding: '0 4px'}}>
							{
								record.modifyTime ?
									'变'
									:
									'招'
							}
						</i>
						<i style={{marginLeft: '5px'}}>{record.title}</i>
					</div>
				}
			},
			{
				title: '招标单位',
				dataIndex: '',
				render: (record) => {
					return <div>
						<i>{record.companyName}</i>
						<i className="text-primary"> (已认证)</i>
					</div>
				}
			},
			{
				title: '所在地区',
				dataIndex: '',
				render: (record, text) => {
					return <div>{record.projectProvince || ''}-{record.projectCity || ''}</div>
				}
			},
			{
				title: '公告日期',
				render: (record) => {
					return <span>{moment(record.modifyTime ? record.modifyTime : record.createTime).format('YYYY-MM-DD')}</span>
				}
			},
			{
				title: '截标时间',
				width: 200,
				render: (record) => {
					if (record.invitationStatus === 1)
						return <Countdown title="倒计时" value={record.endTime}
						                  format={Math.abs(moment().diff(record.endTime, 'days')) >= 1 ? 'D 天 H 时 m 分 s 秒' : 'HH 时 mm 分 ss 秒'}
						                  valueStyle={{color: '#FFB432', fontSize: '14px'}} />
					else if (record.invitationStatus === 2 || record.invitationStatus === 3)
						return <div>已截标</div>;
					else if (record.invitationStatus === 4)
						return <div>投标终止</div>;
					else if (record.invitationStatus === 5)
						return <div>流标</div>;
					else if (record.invitationStatus === 6)
						return <div>废标</div>;
				}
			}, {
				title: '操作',
				key: 'action',
				render: (record, text) =>
					<Button type="primary"
					        size="large"
					        className="bg-primary-linear border-radius"
					        onClick={() => {
						        Router.push({pathname: '/invite/detail', query: {id: record.invitationId}})
					        }}>查看详情</Button>,
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
				invitationType: '',
				city: '',
				province: '',
				status: '',
				pageSize: 20,
				pageNum: 0
			}
		}
	}

	componentDidMount() {
		this.getAllArea();
		this.getList();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.keyword !== this.props.router.query.keyword) {
			this.getAllArea();
			this.getList();
		}
	}

	getList = () => {
		let params = {
			...this.state.searchParams,
			bidsParams: this.props.router.query.keyword || ''
		};
		inviteListFun(params).then(res => {
			this.setState({
				list: res.data.list,
				dataTotal: res.data.count
			})
		}).catch(error => {
			console.log(error)
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

	changeType = (index) => {
		const {searchParams} = this.state;
		searchParams.invitationType = index;
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

	//改变招标状态
	changeStatus = (value) => {
		const {searchParams} = this.state;
		searchParams.status = value;
		this.setState({
			searchParams
		}, () => {
			this.getList();
		})
	};

	render() {
		const {list, areaData, searchParams, dataTotal} = this.state;
		return (
			<Layout title='招标大厅' menuIndex={'invite'}>
				<Row className="inquiry-search-panel" type="flex" align="middle">
					<Col span={12}>
						<i>招标状态：</i>
						<Select defaultValue={''} style={{width: 120}} onChange={this.changeStatus}>
							<Option value="">全部</Option>
							<Option value="1">招标中</Option>
							<Option value="2">已开标</Option>
							<Option value="3">已定标</Option>
							<Option value="4">异常</Option>
						</Select>
						<Divider type="vertical" style={{height: '50px', margin: '0 30px'}} />
						<i style={{marginLeft: '30px'}}>所在地区：</i>
						<Cascader
							options={areaData}
							fieldNames={this.fieldNames}
							onChange={this.areaChange}
							expandTrigger='hover'
							placeholder="请选择"
						>
							{/*<a href="#">{searchParams.city ? searchParams.city : '全部地区'}</a>*/}
						</Cascader>
					</Col>
					<Col span={12} className="text-right" onChange={this.changeType}>
						<Button type='link' className={`${searchParams.invitationType === '' ? 'text-primary' : 'text-black'}`}
						        onClick={() => this.changeType('')}>所有招标</Button>
						<Button type='link' className={`${searchParams.invitationType === 0 ? 'text-primary' : 'text-black'}`}
						        onClick={() => this.changeType(0)}>采购招标</Button>
						<Button type='link' className={`${searchParams.invitationType === 1 ? 'text-primary' : 'text-black'}`}
						        onClick={() => this.changeType(1)}>施工分包</Button>
						<Button type='link' className={`${searchParams.invitationType === 2 ? 'text-primary' : 'text-black'}`}
						        onClick={() => this.changeType(2)}>设备租赁</Button>
						<Button type='link' className={`${searchParams.invitationType === 3 ? 'text-primary' : 'text-black'}`}
						        onClick={() => this.changeType(3)}>劳务分包</Button>
					</Col>
				</Row>
				<div className="bg-white">
					<Table columns={this.columns} dataSource={list} pagination={false} locale={{emptyText: '暂无数据'}} />
				</div>
				<div className="bg-white prl3 text-right ptb2">
					<Pagination defaultCurrent={1} total={dataTotal} pageSize={searchParams.pageSize} onChange={this.pageChange} />
				</div>
			</Layout>
		);
	}
}

export default withRouter(EnquiryIndex);
