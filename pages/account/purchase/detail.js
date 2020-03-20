import React, {Component, Fragment} from 'react';
import Router, {withRouter} from 'next/router';
import Link from 'next/link'
import Layout from 'components/Layout/account'
import {confirmGoodReceive, queryOrderDetail} from 'server'
import ButtonMenus from './components/button-menu'
import {Avatar, Button, Col, message, Row, Table, Input, Icon, Modal, Statistic} from 'antd';
import {baseUrl, iconUrl} from 'config/evn';
import moment from 'moment'
import './style.less'
import cookie from 'react-cookies';
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
const {Column} = Table;
const {confirm} = Modal;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const {Countdown} = Statistic;

class OrderDetail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			detail: {},
			showPaymentEvidence: false,
			showConnect: 'none',
			toUserCode: ''
		}
	}

	componentDidMount() {
		this.getOrderDetail();
	}

	componentDidUpdate(prevProps) {
		if (this.props.router.query.id !== prevProps.router.query.id)
			this.getOrderDetail()
	}

	getOrderDetail = () => {
		let params = {
			orderId: this.props.router.query.id
		};
		queryOrderDetail(params).then(res => {
			this.setState({
				detail: res.data
			})
		}).catch(error => {
			// message.error(error)
		})
	};

	//查看凭证
	showPayProve = (url) => {
		confirm({
			content: <img src="http://192.168.199.240/api/app/uploadImg/seller/shop_1562637609850.png" alt="" />,
		});
	};

	//确认收货
	confirmReceive = (invoiceId) => {
		confirm({
			okText: '提交',
			cancelText: '取消',
			title: '是否确认收货？',
			onOk: () => {
				let params = {
					orderId: this.state.detail.orderId,
					invoiceId: invoiceId
				};
				confirmGoodReceive(params).then(res => {
					Router.push({pathname: '/account/purchase/delivery-detail', query: {id: invoiceId}})
				}).catch(error => {
					message.error(error)
				});
			}
		});
	};

	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};
	connectCustomer = (e) => {
		e.stopPropagation();
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block',
				toUserCode: this.state.detail.shopUserCode
			})
		} else {
			Router.push('/login/index');
		}
	};

	render() {
		const {detail} = this.state;
		let menuIndex = detail.type && detail.type === 1 ? 'inquiry' : detail.type === 2 ? 'enquiry' : 'sample';

		return (
			<Layout title="订单详情" mainMenuIndex="home" menuIndex={menuIndex}>
				<Fragment>
					<aside className="purchase-detail-info">
						<div className="purchase-detail-main-title">
							当前订单状态：<span className="text-primary">{detail.statusName || ''}
							{
								detail.status === 8 ?
									detail.exceptionStatus === 0 ? '(待处理)' : detail.exceptionStatus === 1 ? '(已确认)' : '(已拒绝)'
									:
									''
							}
						</span>
						</div>
						<div className="purchase-detail-sub-title mt4">买家信息</div>
						<div className="purchase-detail-sub-content">
							<div className="item"><label>买家昵称：</label><span>{detail.nickName}</span></div>
							{/*<div className="item"><label>买家身份：</label><span>{detail.buyerIdentity}</span></div>*/}
							<div className="item">
								<label>收货信息：</label>
								<span>
									<i>{detail.consigneeProvince}{detail.consigneeCity}{detail.consigneeArea}
										{detail.consigneeAddress}</i>
									<i className="text-muted"> ({detail.consigneeName}收)</i>
									<i className="text-muted">{detail.consigneePhone}</i>
								</span>
							</div>
							{
								detail.invoiceType ?
									<div className="item">
										<label>收票地址：</label>
										<span>
											<i>{detail.invoiceConsigneeProvince}{detail.invoiceConsigneeCity}
												{detail.invoiceConsigneeArea}{detail.invoiceConsigneeAddress}</i>
											<i className="text-muted"> ({detail.invoiceConsigneeName}收)</i>
											<i className="text-muted">{detail.invoiceConsigneePhone}</i>
										</span>
									</div>
									:
									null
							}

							<div className="item">
								<label>买家备注：</label>
								<span>{detail.orderNote || '无'}</span>
							</div>
							{
								detail.reason
									?
									<div className="item">
										<label>异常原因：</label>
										<span>{detail.reason}</span>
									</div>
									:
									''
							}
							{
								detail.refuseReason
									?
									<div className="item">
										<label>拒绝原因：</label>
										<span>{detail.refuseReason}</span>
									</div>
									:
									''
							}
						</div>
						{
							detail.status === 5 && detail.type !== 3 ?
								<div className='purchase-detail-info-flag text-center'>
									<div className='h6'>还剩</div>
									<div className="text-center">
										<Countdown value={detail ? moment(detail.finishTime).add(15, 'days') : ''}
										           format={'D 天 H 时 m 分 s 秒'}
										           valueStyle={{color: '#fff', fontSize: '14px', textAlign: 'center'}}
										           className="text-center" />
									</div>
								</div>
								:
								''
						}
					</aside>
					<aside className="purchase-detail-more-info">
						<div className="purchase-detail-sub-title">商品信息</div>
						<Table
							size="small"
							pagination={false}
							className="purchase-item"
							rowKey={record => record.specsId}
							dataSource={detail.productList}
							footer={() => {
								return (
									<Row>
										<Col span={8} />
										<Col span={6}>
											<span className="text-muted">采购单号：</span>
											<span className="text-black">{detail.orderCode}</span>
										</Col>
										<Col span={10} className="text-right">
											<span className="text-muted">合计：（含运费￥{detail.freight}）</span>
											<small>￥</small>
											<span
												className="h3 text-primary">{detail.orderAmount ? detail.orderAmount +
												detail.freight : 0}</span>
											{detail.status !== 1 && detail.status !== 2 ?
												<span className="prl1">
													<Button type='primary' onClick={() => {
														this.setState({
															showPaymentEvidence: true
														})
													}}>查看凭证</Button>
												</span>
												:
												''
											}
										</Col>
									</Row>
								)
							}}
						>
							<Column
								width={280}
								dataIndex='image'
								title={
									<div>
										<span className='text-ellipsis' style={{display: 'inline-block', maxWidth: '100px'}}
										      title={detail.shopName}>
											<a href={`/shop/home?id=${detail.shopId}`} target="_blank">{detail.shopName}</a>
										</span>
										<IconFont type="iconfont-liaotian" className="text-info h3" style={{
											verticalAlign:
												'baseline'
										}}
										          onClick={(e) => this.connectCustomer(e)} />
									</div>
								}
								render={(text, record) => (
									<div className="product-item-name">
										{
											record.productId ?
												<a href={`/material/detail?id=${record.productId}`} target="_blank">
													<Avatar shape="square"
													        src={record.image ? baseUrl + record.image.split(',')[0]
														        : '../../static/images/defaultHead.png'}
													        size={38} />
												</a>
												:
												<Avatar shape="square"
												        src={record.image ? baseUrl + record.image.split(',')[0] :
													        '../../static/images/defaultHead.png'}
												        size={38} />
										}
										<div style={{marginLeft: '14px'}}>
											{
												record.productId ?
													<a href={`/material/detail?id=${record.productId}`}
													   target="_blank">
														<h5 style={{width: '300px', wordBreak: 'break-word'}}>
															{record.materialBrand} {record.materialName}</h5>
														{
															record.optionalAttribute ?
																<div className="text-lightgrey text-left h6" style={{marginTop: '5px'}}>
																	{record.optionalAttribute}：{record.attributeValue}</div>
																:
																''
														}
													</a>
													:
													<Fragment>
														<h5>{record.materialBrand} {record.materialName}</h5>
														{
															record.optionalAttribute ?
																<div className="text-lightgrey text-left h6" style={{marginTop: '5px'}}>
																	{record.optionalAttribute}：{record.attributeValue}</div>
																:
																''
														}
													</Fragment>
											}
										</div>
									</div>
								)}
							/>
							<Column
								title='品牌'
								dataIndex='materialBrand'
								align='center'
							/>
							<Column
								title='单位'
								dataIndex='materialUnit'
								align='center'
							/>
							<Column
								title='数量'
								dataIndex='quantity'
								align='center'
							/>
							<Column
								title='单价（元）'
								dataIndex='unitPrice'
								align='center'
							/>
							<Column
								title='描述'
								dataIndex='remark'
								align='center'
								render={(text, record) => <span
									className="text-muted">{record.remark || '--'}</span>}
							/>
							<Column
								title='金额（元）'
								align='center'
								render={(text, record) => <span
									className="text-muted">{record.quantity * record.unitPrice}</span>}
							/>
						</Table>
						{detail.isBatch === 1 && detail.invoiceList && detail.invoiceList.length ?
							<div className="purchase-detail-sub-title mt3">发货单列表</div> : ''}
						{
							detail.isBatch === 1 && detail.invoiceList && detail.invoiceList.map((item, index) => {
								return (
									<Table
										size="small"
										pagination={false}
										className="purchase-item"
										rowKey={record => record.specs}
										dataSource={item.invoiceProducts}
										key={index}
									>
										<Column
											width={300}
											dataIndex='invoiceImage'
											title={
												<span>
													<label className="text-muted">发货时间：</label>
													<i>{item.invoiceOutStockTime ? moment
													(item.invoiceOutStockTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</i>
												</span>
											}
											render={(text, record) => (
												<div className="product-item-name">
													<Avatar shape="square"
													        src={record.invoiceImage ? baseUrl +
														        record.invoiceImage.split(',')[0] : '../../static/images/defaultHead.png'}
													        size={38} />
													<div style={{marginLeft: '14px'}}>
														<h5>{record.productName}</h5>
														<div className="text-lightgrey text-left h6"
														     style={{marginTop: '5px'}}>{record.specs}</div>
													</div>
												</div>
											)}
										/>
										<Column
											title={
												<span>发货数量</span>
											}
											dataIndex='invoiceQuantity'
											align='center'
											render={(text, record) =>
												<span>{record.invoiceQuantity}{record.productUnit}</span>
											}
										/>
										<Column
											title='状态'
											dataIndex='invoiceStatus'
											align='center'
											width={100}
											render={(text, record, index) => {
												const obj = {
													children: <span>
													{(() => {
															switch (item.invoiceStatus) {
																case 0:
																	return '待出库';
																case 1:
																	return '已发货';
																case 2:
																	return '已收货'
															}
														}
													)()}
												</span>,
													props: {},
												};

												if (index === 0) {
													obj.props.rowSpan = item.invoiceProducts.length;
												} else {
													obj.props.rowSpan = 0;
												}

												return obj;
											}
											}
										/>
										<Column
											title='操作'
											align='center'
											width={100}
											render={(text, record, index) => {
												const obj = {
													children: <div className="button-list">
														{item.invoiceStatus === 1 ?
															<Button type="link" className="text-warning"
															        onClick={() => this.confirmReceive
															        (item.invoiceId)}>确认收货</Button> : ''}
														{
															item.invoiceStatus === 1 || item.invoiceStatus
															=== 2 ?
																<Link
																	href={{
																		pathname:
																			'/account/purchase/delivery-detail', query: {id: item.invoiceId}
																	}}><a
																	className="text-muted">查看详情
																</a>
																</Link>
																:
																''
														}
													</div>,
													props: {},
												};

												if (index === 0) {
													obj.props.rowSpan = item.invoiceProducts.length;
												} else {
													obj.props.rowSpan = 0;
												}

												return obj;
											}
											}
										/>
									</Table>
								)
							})
						}
						<div className="purchase-detail-sub-title mt3">发票信息</div>
						<div className='purchase-detail-sub-content'>
							{
								detail.invoiceType ?
									<Fragment>
										{
											detail.invoiceType ?
												<div><label>发票类型：</label><span>{detail.invoiceType}</span></div>
												:
												null
										}
										{
											detail.invoiceRise
												?
												<div><label>发票抬头：</label><span>{detail.invoiceRise}</span></div>
												:
												null
										}
										{
											detail.creditCode
												?
												<div><label>发票税号：</label><span>{detail.creditCode}</span></div>
												:
												null
										}
										{
											detail.registeredAddress
												?
												<div><label>注册地址：</label><span>{detail.registeredAddress}
</span></div>
												:
												null
										}
										{
											detail.depositBank
												?
												<div><label>开户银行：</label><span>{detail.depositBank}</span></div>
												:
												null
										}
										{
											detail.bankAccount
												?
												<div><label>银行账号：</label><span>{detail.bankAccount}</span></div>
												:
												null
										}
										{
											detail.mobile
												?
												<div><label>电话号码：</label><span>{detail.mobile}</span></div>
												:
												null
										}
									</Fragment>
									:
									<div className="text-black">不开发票</div>
							}
						</div>
						<div className='purchase-detail-sub-title'>订单状态</div>
						<div className="purchase-detail-sub-content">
							<div><label>创建时间：</label><span>{moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss')}</span></div>
							{detail.confirmTime ?
								<div><label>确认订单：</label><span>{moment(detail.confirmTime).format('YYYY-MM-DD HH:mm:ss')}</span>
								</div> : ''}
							{detail.payTime ?
								<div><label>支付订单：</label><span>{moment(detail.payTime).format('YYYY-MM-DD HH:mm:ss')}</span></div> :
								''}
							{detail.closeTime ?
								<div><label>关闭时间：</label><span>{moment(detail.closeTime).format('YYYY-MM-DD HH:mm:ss')}</span></div>
								: ''}
						</div>
						<div className='purchase-detail-sub-title'>物流信息</div>
						<div className="purchase-detail-sub-content">
							{
								detail && detail.invoiceList && detail.invoiceList.length
									?
									detail.invoiceList[0].logisticsName
										?
										<Fragment>
											<div>
												<label>物流名称：</label><span>{detail.invoiceList[0].logisticsName}</span>
											</div>
											<div>
												<label>物流单号：</label><span>{detail.invoiceList[0].logisticsCode}</span>
											</div>
										</Fragment>
										:
										<div><label>备注：</label><span>{detail.invoiceList[0].invoiceRemark || '暂无备注'}</span></div>
									:
									null
							}
						</div>
						<div>
							<ButtonMenus item={detail} type={'detail'} amount={detail.orderAmount + detail.freight}
							             invoiceId={detail.isBatch === 0 ? detail.invoiceList[0] && detail.invoiceList[0].invoiceId : ''}
							             isBatch={detail.isBatch}
							             reload={this.getOrderDetail}
							/>
						</div>
						<Modal visible={this.state.showPaymentEvidence}
						       cancelText='关闭'
						       okButtonProps={{style: {display: 'none'}}}
						       centered={true}
						       closable={false}
						       onCancel={() => {
							       this.setState({
								       showPaymentEvidence: false
							       })
						       }}
						>
							<img src={baseUrl + detail.paymentEvidence} alt='' width='100%' />
						</Modal>
					</aside>
					<ImInfo showConnect={this.state.showConnect} userCode={this.state.toUserCode} closeModal={this.closeModal} />
				</Fragment>
			</Layout>
		);
	}
}

export default withRouter(OrderDetail);
