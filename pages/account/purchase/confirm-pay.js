import React, {Component, Fragment} from 'react';
import Router, {withRouter} from 'next/router';
import Layout from 'components/Layout/confirm'
import {queryOrderDetail} from 'server'
import {getPayInfoForShuangQian} from 'payApi'
import {Row, Col, Button} from 'antd'
import './style.less'

class OrderDetail extends Component {
	constructor(props) {
		super(props);
		this.state = {
			detail: {},
			payDetail: {},
			showPaymentEvidence: false,
			showConnect: 'none',
			toUserCode: '',
			canGoToNext: false
		}
	}

	componentDidMount() {
		this.getOrderDetail();
		this.getPayDetail();
	}

	componentWillUpdate(prevProps) {
		const {query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.getOrderDetail();
			this.getPayDetail();
		}
	}

	getOrderDetail = () => {
		if (!this.props.router.query.id) return false;
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

	getPayDetail = () => {
		if (!this.props.router.query.id) return false;
		let params = {
			orderId: this.props.router.query.id
		};
		getPayInfoForShuangQian(params).then(res => {
			this.setState({
				payDetail: res.data
			}, () => {
				this.setState({
					canGoToNext: true
				})
			});
		}).catch(error => {
			// message.error(error)
		})
	};

	render() {
		const {detail, payDetail} = this.state;
		let menuIndex = detail.type && detail.type === 1 ? 'inquiry' : detail.type === 2 ? 'enquiry' : 'sample';

		return (
			<Layout title="订单详情" mainMenuIndex="home" menuIndex={menuIndex}>
				<Fragment>
					<aside className="purchase-detail-info prl3">
						<h2>以下信息确认无误后，请点击“下一步”去支付</h2>
						<div className="purchase-detail-sub-title mt4">订单金额</div>
						<div className="prl5 ptb3 mt3" style={{background: '#FFFAF0'}}>
							<h5>共计<span className="h3">{detail.productList ? detail.productList.length : 0}</span>种商品</h5>
							<div className="item mt4"><label className='text-muted'>商品总价：</label><span className="text-grey">￥{detail.orderAmount || 0}</span>
							</div>
							<Row className="mt1">
								<Col span={12}>
									<div className="item"><label className="text-muted">运费：</label><span className="text-grey">￥{detail.freight || 0}</span></div>
								</Col>
								<Col span={12} className="text-right">
									<div className="item">
										<label className="text-muted">订单总金额：</label>
										<span className="text-primary h0">￥{(detail.orderAmount + detail.freight) || 0}</span>
									</div>
								</Col>
							</Row>
						</div>
						<div className="purchase-detail-sub-title mt4">买家信息</div>
						<div className="purchase-detail-sub-content">
							<div className="item"><label>买家昵称：</label><span>{detail.nickName}</span></div>
							<div className="item">
								<label>收货信息：</label>
								<span>
									<i>{detail.consigneeProvince}{detail.consigneeCity}{detail.consigneeArea}{detail.consigneeAddress}</i>
									<i className="text-muted"> ({detail.consigneeName}收)</i>
									<i className="text-muted">{detail.consigneePhone}</i>
								</span>
							</div>
							<div className="item">
								<label>买家备注：</label>
								<span>{detail.orderNote || '无'}</span>
							</div>
							<div className="item"><label>商家：</label><span>{detail.buyerIdentity}</span></div>
							<div className="item"><label>采购编号：</label><span>{detail.orderCode}</span></div>
						</div>
					</aside>
					<form action={payDetail.actionUrl} method="post" target="_blank">
						<input type="hidden" name="apiContent" value={payDetail.apiContent || ''} />
						<input type="hidden" name="merNo" value={payDetail.merNo || ''} />
						<input type="hidden" name="sign" value={payDetail.sign || ''} />
						<input type="hidden" name="signType" value={payDetail.signType || ''} />
						<input type="hidden" name="timestamp" value={payDetail.timestamp || ''} />
						<input type="hidden" name="version" value={payDetail.version || ''} />
						<input type="hidden" name="notifyUrl" value={payDetail.notifyUrl || ''} />
						<div className="text-center ptb6 bg-white">
							<button type="submit" className="ant-btn bg-primary-linear ant-btn-submit ant-btn-lg bg-primary-linear text-white" size="large"
							        style={{width: '128px'}} disabled={!this.state.canGoToNext}>下一步
							</button>
						</div>
					</form>
				</Fragment>
			</Layout>
		);
	}
}

export default withRouter(OrderDetail);
