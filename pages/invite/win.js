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

class InviteWin extends Component {
	constructor(props) {
		super(props);
		this.columns = [
			{
				title: '招标标题',
				dataIndex: '',
				width: 400,
				render: (record) => {
					return <div>
						<i className="bg-primary h6 text-white border-radius"
						   style={{padding: '0 3px'}}>{this.resolveInvitationStatus(record.invitationStatus, record.winning, 1)}
						</i>
						<i style={{marginLeft: '5px'}}>{record.title}</i>
					</div>
				}
			},
			{
				width: 400,
				title: '中标单位',
				dataIndex: '',
				render: (record) => {
					return <div>{this.resolveInvitationStatus(record.invitationStatus, record.winning)}</div>
				}
			},
			{
				width: 250,
				title: '公告日期',
				render: (record) => {
					return <span>{moment(record.modifyTime ? record.modifyTime : record.createTime).format('YYYY-MM-DD')}</span>
				}
			},
			{
				title: '操作',
				key: 'action',
				render: (record, text) => <Button type="primary"
				                                  size="large"
				                                  className="bg-primary-linear border-radius"
				                                  onClick={() => {
					                                  Router.push({pathname: '/invite/win-detail', query: {id: record.invitationId}})
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
				status: 5,
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

	resolveInvitationStatus = (type, companyName, column) => {
		switch (type) {
			case 1:
				return column === 1 ? '中' : companyName;
			case 2:
				return column === 1 ? '中' : companyName;
			case 3:
				return column === 1 ? '中' : companyName;
			case 4:
				return column === 1 ? '止' : '投标终止';
			case 5:
				return column === 1 ? '流' : '流标';
			case 6:
				return column === 1 ? '废' : '废标'
		}
	};

	render() {
		const {list, areaData, searchParams, dataTotal} = this.state;
		return (
			<Layout title='招标大厅' menuIndex={'invite'}>
				<Row className="inquiry-search-panel" type="flex" align="middle">
					<Col span={12}>
						<i>所在地区：</i>
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
					<Col span={12} className="text-right">
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
					<Pagination defaultCurrent={1} total={dataTotal} pageSize={20} onChange={this.pageChange} />
				</div>
			</Layout>
		);
	}
}

export default withRouter(InviteWin);
