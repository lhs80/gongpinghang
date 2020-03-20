import React, {Component} from 'react';
import {withRouter} from 'next/router'
import Layout from 'components/Layout/account'
import PurchaseItem from './components/PurchaseListItem'
import {Tabs, DatePicker, Input, Select, Button, Table, Avatar, Icon, Row, Col, Modal, message, Pagination} from 'antd'
import {baseUrl, iconUrl} from 'config/evn';
import './style.less'
import {queryPurchaseList} from 'server'
import cookie from 'react-cookies';
import Router from 'next/router';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const {TabPane} = Tabs;
const {RangePicker} = DatePicker;
const {Option} = Select;

class PurchaseHome extends Component {
	constructor(props) {
		super(props);

		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			this.state = {
				purchaseList: {},
				pageTotal: 0,
				searchParams: {
					status: 0,
					parameter: '',
					shopName: '',
					startTime: '',
					endTime: '',
					pageNum: 1,
					pageSize: 15,
				}
			}
	}

	componentDidMount() {
		this.getPurchaseList();
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.type !== prevProps.router.query.type || query.status !== prevProps.router.query.status) {
			this.getPurchaseList();
		}
	}

	componentWillUnmount() {
		this.setState({
			purchaseList: []
		})
	}


	getPurchaseList = () => {
		if (!this.props.router.query.type) return false;

		const {searchParams} = this.state;
		searchParams.status = this.props.router.query.status || searchParams.status || '0';
		this.setState({
			searchParams
		});
		let params = {
			userCode: this.userCode,
			orderType: this.props.router.query.type,
			...this.state.searchParams
		};

		queryPurchaseList(params).then(res => {
			this.setState({
				purchaseList: res.data,
				pageTotal: res.data.count
			})
		}).catch(error => {
			message.error(error)
		})
	}

	//状态改变重新赋值
	selAnotherState = (value) => {
		const {searchParams} = this.state;
		searchParams.status = value;
		this.setState({
			searchParams
		})
	};

	//搜索关键字变化时重新赋值
	keyWordChange = (e) => {
		const {searchParams} = this.state;
		searchParams.parameter = e.target.value;
		this.setState({
			searchParams
		})
	};

	//店铺名称变化时重新赋值
	shopNameChange = (e) => {
		const {searchParams} = this.state;
		searchParams.shopName = e.target.value;
		this.setState({
			searchParams
		})
	};

	//时间范围变化时重新赋值
	onChange = (date, dateString) => {
		const {searchParams} = this.state;
		searchParams.startTime = dateString[0];
		searchParams.endTime = dateString[1];
		this.setState({
			searchParams
		})
	};

	//页码改变时重新赋值
	pageNumChange = (page, pageSize) => {
		const {searchParams} = this.state;
		searchParams.pageNum = page;
		this.setState({
			searchParams
		}, () => {
			this.getPurchaseList()
		})
	};

	stateChange = (key) => {
		Router.push({pathname: '/account/purchase/home', query: {type: this.props.router.query.type, status: key}})
	};

	reload = () => {
		this.getPurchaseList();
	};

	render() {
		const {purchaseList, pageTotal, searchParams} = this.state;
		const {router} = this.props;
		let menuIndex = router.query.type && router.query.type === '1' ? 'inquiry' : router.query.type === '2' ? 'enquiry' : 'sample';

		return (
			<Layout mainMenuIndex={'home'} menuIndex={menuIndex} title="我的采购单">
				<aside className="bg-white ptb4">
					<div className="purchase-main-title">{(() => {
						switch (router.query.type) {
							case '1':
								return '询价订单';
							case '2':
								return '商城订单';
							case '3':
								return '寄样订单';
						}
					})()}</div>
					<Tabs activeKey={router.query.status || '0'} onChange={this.stateChange} className="custom-tabs" animated={false}>
						<TabPane tab="全部" key="0">
							<div className="search-panel">
								<label className="text-muted">创建时间</label>
								<span className="item"><RangePicker onChange={this.onChange} style={{width: 180}} /></span>
								<label className="text-muted">商家</label>
								<span className="item"><Input placeholder="请输入商家名称" onChange={(e) => this.shopNameChange(e)} /></span>
								<label className="text-muted">关键词</label>
								<span className="item"><Input placeholder="请输入商品或采购编号" onChange={(e) => this.keyWordChange(e)} /></span>
								<label className="text-muted">状态</label>
								<span className="item">
                <Select defaultValue="0" style={{width: 120}} onChange={this.selAnotherState}>
										<Option value="0">全部</Option>
										<Option value="1">待卖家确认</Option>
	                {
		                router.query.type !== '3'
			                ?
			                <Option value="2">待买家支付</Option> :
			                ''
	                }
	                <Option value="3">待卖家发货</Option>
										<Option value="4">待买家收货</Option>
	                {
		                router.query.type !== '3'
			                ?
			                <Option value="5">评价订单</Option>
			                :
			                ''
	                }
	                <Option value="6">交易完成</Option>
										<Option value="7">已关闭</Option>
	                {
		                router.query.type !== '3'
			                ?
			                <Option value="8">异常订单</Option>
			                :
			                ''
	                }
                </Select>
              </span>
								<span><Button type="primary" className='bg-primary-linear' onClick={() => this.getPurchaseList()}>查询</Button></span>
							</div>
							<div className="prl4">
								{
									pageTotal > 0 ?
										purchaseList.list.map((item, index) => {
											return (
												<PurchaseItem item={item} key={item.orderId} orderType={router.query.type} reload={this.getPurchaseList} />
											)
										})
										:
										<div className="text-center mt4" style={{marginBottom: '46px'}}>
                      <span className="show">
                          <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                      </span>
											<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
										</div>
								}
							</div>
						</TabPane>
						{
							router.query.type !== '3' ?
								<TabPane tab="待付款" key="2">
									<div className="prl4">
										{
											pageTotal > 0 ?
												purchaseList.list.map((item, index) => {
													return (
														<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
														              reload={this.getPurchaseList} />
													)
												})
												:
												<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
													<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
												</div>
										}
									</div>
								</TabPane>
								:
								''
						}
						<TabPane tab="待发货" key="3">
							<div className="prl4">
								{
									pageTotal > 0 ?
										purchaseList.list.map((item, index) => {
											return (
												<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
												              reload={this.reload} />
											)
										})
										:
										<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
											<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
										</div>
								}
							</div>
						</TabPane>
						<TabPane tab="待收货" key="4">
							<div className="prl4">
								{
									pageTotal > 0 ?
										purchaseList.list.map((item, index) => {
											return (
												<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
												              reload={this.reload} />
											)
										})
										:
										<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
											<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
										</div>
								}
							</div>
						</TabPane>
						{
							router.query.type !== '3' ?
								<TabPane tab="待评价" key="5">
									<div className="prl4">
										{
											pageTotal > 0 ?
												purchaseList.list.map((item, index) => {
													return (
														<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
														              reload={this.reload} />
													)
												})
												:
												<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
													<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
												</div>
										}
									</div>
								</TabPane>
								:
								''
						}
						<TabPane tab="已完成" key="6">
							<div className="prl4">
								{
									pageTotal > 0 ?
										purchaseList.list.map((item, index) => {
											return (
												<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
												              reload={this.reload} />
											)
										})
										:
										<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
											<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
										</div>
								}
							</div>
						</TabPane>
						<TabPane tab="已关闭" key="7">
							<div className="prl4">
								{
									pageTotal > 0 ?
										purchaseList.list.map((item, index) => {
											return (
												<PurchaseItem item={item} key={index} orderType={router.query.type}
												              reload={this.reload} />
											)
										})
										:
										<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
											<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
										</div>
								}
							</div>
						</TabPane>
						{
							router.query.type !== '3' ?
								<TabPane tab="异常订单" key="8">
									<div className="prl4">
										{
											pageTotal > 0 ?
												purchaseList.list.map((item, index) => {
													return (
														<PurchaseItem item={item} key={item.orderId} orderType={router.query.type}
														              reload={this.reload} />
													)
												})
												:
												<div className="text-center mt4" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" width="140px" />
                                            </span>
													<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
												</div>
										}
									</div>
								</TabPane>
								:
								''
						}
					</Tabs>
					<div className="text-right p4">
						<Pagination defaultCurrent={1}
						            total={pageTotal}
						            pageSize={searchParams.pageSize}
						            onChange={this.pageNumChange}
						            hideOnSinglePage
						/>
					</div>
				</aside>
			</Layout>
		);
	}
}

export default withRouter(PurchaseHome)
