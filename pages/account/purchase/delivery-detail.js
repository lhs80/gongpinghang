import React, {Component, Fragment} from 'react';
import {withRouter} from 'next/router';
import Layout from 'components/Layout/account'
import {confirmGoodReceive, queryDeliveryOrderDetail} from 'server'
import ButtonMenus from './components/button-menu'
import {Avatar, Button, Col, message, Row, Table, Input, Icon, Modal} from 'antd';
import {baseUrl, iconUrl} from 'config/evn';
import moment from 'moment'
import './style.less'
import dynamic from 'next/dynamic'
import cookie from 'react-cookies';

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
const {Column} = Table;
const {TextArea} = Input;
const {confirm} = Modal;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class OrderDetail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			detail: {},
			showConnect: 'none',
			toUserCode: ''
		}
	}

	componentDidMount() {
		this.getOrderDetail();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.router.query.id !== prevProps.router.query.id)
			this.getOrderDetail()
	}

	getOrderDetail = () => {
		let params = {
			invoiceId: this.props.router.query.id
		};
		queryDeliveryOrderDetail(params).then(res => {
			this.setState({
				detail: res.data
			})
		}).catch(error => {
			// message.error(error)
		})
	};


	//确认收货
	confirmReceive = (orderId) => {
		confirm({
			okText: '提交',
			cancelText: '取消',
			title: '是否确认收货？',
			onOk: () => {
				let params = {
					orderId: orderId,
					invoiceId: this.props.invoiceId
				};
				confirmGoodReceive(params).then(res => {
					this.props.getList();
				}).catch(error => {
					// message.error(error)
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
		return (
			<Layout title="发货单详情" mainMenuIndex={'home'} menuIndex={'enquiry'}>
				<Fragment>
					<aside className="purchase-detail-info">
						<div className="purchase-detail-main-title">
							发货单状态：<span className="text-primary">{(() => {
								switch (detail.invoiceStatus) {
									case 0:
										return '待出库';
									case 1:
										return '已发货';
									case 2:
										return '已收货'
								}
							}
						)()}</span>
						</div>
						<div className="purchase-detail-sub-title mt4">买家信息</div>
						<div className="purchase-detail-sub-content">
							<div><label>买家昵称：</label><span>{detail.nickName}</span></div>
							<div>
								<label>收货信息：</label>
								<span>
									<i>{detail.consigneeAddress}</i>
									<i className="text-muted"> ({detail.consigneeName}收)</i>
									<i className="text-muted">{detail.consigneePhone}</i>
								</span>
							</div>
							<div><label>商家：</label><span>{detail.shopName || '无'}</span></div>
							<div><label>发货时间：</label><span>{moment(detail.invoiceOutStockTime).format('YYYY-MM-DD HH:mm:ss')}</span></div>
							{detail.invoiceStatus === 2 ?
								<div><label>收货时间：</label><span>{moment(detail.receiveTime).format('YYYY-MM-DD HH:mm:ss')}</span></div> : ''}
						</div>
					</aside>
					<aside className="purchase-detail-more-info">
						<div className="purchase-detail-sub-title">商品信息</div>
						<Table
							size="small"
							pagination={false}
							className="purchase-item"
							rowKey={record => record.invoiceId}
							dataSource={detail.invoiceProducts}
						>
							<Column
								width={280}
								dataIndex='invoiceImage'
								title={
									<div>
										<span className='text-ellipsis' style={{display: 'inline-block', maxWidth: '100px'}}
										      title={detail.shopName}> {detail.shopName}</span>
										<IconFont type="iconfont-liaotian" className="text-info h3" style={{verticalAlign: 'baseline'}}
										          onClick={(e) => this.connectCustomer(e)} />
									</div>
								}
								render={(text, record) => (
									<div className="product-item-name">
										<Avatar shape="square"
										        src={record.invoiceImage ? baseUrl + record.invoiceImage : '/static/images/nologin.png'}
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
						</Table>
						<div className="purchase-detail-sub-title mt3">物流信息</div>
						<div className="purchase-detail-sub-content">
							<div><label>物流名称：</label><span>{detail.logisticsName || '无'}</span></div>
							<div><label>物流单号：</label><span>{detail.logisticsCode || '无'}</span></div>
							<div><label>备注：</label><span>{detail.invoiceRemark || '无'}</span></div>
						</div>
						<div className="purchase-detail-sub-title mt3">发票信息</div>
						<div className="purchase-detail-sub-content">
							<div><label>发票类型：</label><span>{detail.invoiceType || '无'}</span></div>
							<div><label>发票抬头：</label><span>{detail.invoiceRise || '无'}</span></div>
							<div><label>发票税号：</label><span>{detail.creditCode || '无'}</span></div>
						</div>
						{
							detail.invoiceStatus === '1' ?
								<div>
									<Button type="primary" size="large" className="bg-primary-linear">确认收货</Button>
								</div>
								:
								''
						}
					</aside>
					<ImInfo showConnect={this.state.showConnect} userCode={this.state.toUserCode} closeModal={this.closeModal} />
				</Fragment>
			</Layout>
		);
	}
}

export default withRouter(OrderDetail);
