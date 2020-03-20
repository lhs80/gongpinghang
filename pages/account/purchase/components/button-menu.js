import React, {Component} from 'react';
import Router, {withRouter} from 'next/router'
import {Button, message, Input, Modal, Upload, Icon, Row, Col} from 'antd';
import {addExecptionToOrder, cancelExecptionToOrder, cancelOrderFun, confirmGoodReceive, orderPayFun, picUploadFun} from 'server';
import {baseUrl, iconUrl} from 'config/evn'
import Link from 'next/dist/client/link';

const {TextArea} = Input;
const {confirm} = Modal;
let modal = null;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

function ModalContent(props) {
	const {loading, amount, imageUrl} = props;
	const uploadButton = (
		<Icon type={loading ? 'loading' : 'plus'} />
	);

	return (
		<div className='avatar-uploader '>
			<h4>支付金额：<span className="text-primary">￥<i className="h3">{amount}</i></span></h4>
			<Row type="flex" align="middle" className="mt2">
				<Col span={10}>
					<Upload
						className="mt1"
						showUploadList={false}
						customRequest={props.uploadImage}
						beforeUpload={props.beforeUpload}
					>
						{imageUrl ? <img src={baseUrl + imageUrl} alt="avatar" style={{width: '100px'}} /> : uploadButton}
					</Upload>
				</Col>
				<Col span={14}>
					<div className="show authDescript h6">
						<p style={{marginBottom: '0'}}>图片所有信息需清晰可见，内容真实有效</p>
						<p>支持.jpg .jpeg .png格式，大小不超过4M</p>
					</div>
				</Col>
			</Row>
		</div>
	)
}

class ButtonMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cancelReason: '',
			imageUrl: '',
			loading: false,
			visible: false
		}
	}

	//取消订单
	cancelOrder = (e, orderId) => {
		e.stopPropagation();
		confirm({
			okText: '提交',
			cancelText: '取消',
			title: '确认取消此订单？',
			content: <TextArea placeholder="请输入取消原因(限50个字)" rows={2} maxLength="10" onChange={this.reasonChange} />,
			onOk: () => {
				let params = {
					orderId: orderId,
					cancelReason: this.state.cancelReason
				};
				cancelOrderFun(params).then(res => {
					this.props.reload();
				}).catch(error => {
					message.error(error)
				});
			}
		});
	};

	//取消订单原因变化 重新赋值
	reasonChange = (e) => {
		this.setState({
			cancelReason: e.target.value
		});
	};

	//申请异常
	applicationException = (e, orderId) => {
		e.stopPropagation();
		confirm({
			okText: '提交',
			cancelText: '取消',
			title: '提交异常信息',
			content: <TextArea placeholder="请输入取消原因(限50个字)" rows={2} maxLength="10" onChange={this.execptionReasonChange} />,
			onOk: () => {
				let params = {
					orderId: orderId,
					reason: this.state.execptionReason
				};
				addExecptionToOrder(params).then(res => {
					message.success('提交成功，待卖家处理异常.');
					this.props.reload();
				}).catch(error => {
					// message.error(error)
				});
			}
		});
	};

	execptionReasonChange = (e) => {
		this.setState({
			execptionReason: e.target.value
		})
	};

	//撤消申请异常
	cancelApplicationException = (e, orderId) => {
		e.stopPropagation();
		confirm({
			okText: '提交',
			cancelText: '取消',
			title: '确定要撤消异常？',
			onOk: () => {
				let params = {
					orderId: orderId,
				};
				cancelExecptionToOrder(params).then(res => {
					this.props.reload();
				}).catch(error => {
					message.error(error)
				});
			}
		});
	};

	//确认收货
	confirmReceive = (e, orderId) => {
		e.stopPropagation();
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
					this.props.reload();
				}).catch(error => {
					// message.error(error)
				});
			}
		});
	};

	//去评价
	gotoRate = (e, orderId) => {
		e.stopPropagation();
		Router.push({pathname: '/account/purchase/rate', query: {id: orderId}})
	};

	//选择支付方式
	selPayType = (e, orderId, merchNo, shopMerchNo) => {
		e.stopPropagation();
		const radioStyle = {
			height: '110px',
			width: '443px'
		};
		confirm({
			okText: '确定',
			cancelText: '取消',
			title: '请选择支付方式',
			width: '560px',
			supportServerRender: true,
			forceRender: true,
			visible: this.state.showPayTypeDlg,
			content:
				<div className="ptb6">
					<Button type="primary" style={radioStyle} onClick={() => this.onLinePay(orderId)} disabled={!merchNo && !shopMerchNo}>
						<div className="h0">线上支付</div>
						<div className="h5">支持快捷支付、支付宝扫码支付、微信扫码支付、企业网银支付</div>
						{
							!shopMerchNo ?
								<div className="text-primary mt1"><IconFont type="iconfont-alert-warning" />您尚未开通线上支付功能</div>
								:
								!merchNo ?
									<div className="text-primary mt1"><IconFont type="iconfont-alert-warning" />该商户尚未开通线上支付功能</div>
									:
									''
						}
					</Button>
					<Button type="primary" style={radioStyle} className="mt2" onClick={(e) => this.pay(e)}>
						<div className="h0">线下汇款</div>
						<div className="h5">线下转账汇款的，请联系商家索要银行账户信息，并上传汇款凭证</div>
					</Button>
				</div>,
			onOk:
			this.payOrder
		})
		;
	};

	pay = (e, orderId) => {
		e.stopPropagation();
		const {imageUrl} = this.state;
		modal = confirm({
			okText: '支付完成',
			cancelText: '取消',
			title: '请上传支付凭证',
			width: '480px',
			supportServerRender: true,
			forceRender: true,
			content: <ModalContent loading={this.state.loading}
			                       amount={this.props.amount}
			                       imageUrl={imageUrl}
			                       uploadImage={this.uploadImage}
			                       beforeUpload={this.beforeUpload} />,
			onOk: this.payOrder
		});
	};

	//去线上支付
	onLinePay = (orderId) => {
		Modal.destroyAll();
		Router.push({pathname: '/account/purchase/confirm-pay', query: {id: orderId}})
	};

	beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('仅支持JPG/PNG!');
		}
		const isLt4M = file.size / 1024 / 1024 < 4;
		if (!isLt4M) {
			message.error('图片大小不超过4MB!');
		}

		return isJpgOrPng && isLt4M;
	};

	//图片转base64格式
	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	uploadImage = (file) => {
		this.getBase64(file.file, imageFile => {
			let params = {
				type: 'order',
				file: imageFile
			};
			picUploadFun(params).then(res => {
				if (res.result === 'success')
					this.setState({
						imageUrl: res.msg
					}, () => {
						modal.update({
							content: <ModalContent loading={this.state.loading}
							                       amount={this.props.amount}
							                       imageUrl={this.state.imageUrl}
							                       uploadImage={this.uploadImage}
							                       beforeUpload={this.beforeUpload} />
						});
					})
			})
		});
	};

	payOrder = () => {
		if (!this.state.imageUrl) {
			message.error('请先上传支付凭证！');
			return false;
		}
		let params = {
			orderId: this.props.item.orderId,
			paymentEvidence: this.state.imageUrl
		};
		orderPayFun(params).then(res => {
			Router.push({pathname: '/account/purchase/detail', query: {id: this.props.item.orderId}});
			this.props.reload();
		}).catch(error => {
			message.error(error)
		});
	};


	//我要分期
	fenqi = () => {
		if (!msgBox)
			msgBox = message.info('尚未上线，敬请期待！', 0.2, () => {
				msgBox = null;
			});
	};

	todoPay = (e, id) => {
		e.stopPropagation();
		Router.push({pathname: '/pay/index', query: {id: id}});
		// Router.push({pathname: '/account/purchase/confirm-pay', query: {id: id}});
	};

	render() {
		const {item, type, isBatch} = this.props;
		const buttons = type === 'detail' ?
			<div className="button-list">
				{
					item && item.status && item.status === 2 ?
						<Button type='primary' size="large" className="bg-primary-linear border-radius"
						        onClick={(e) => this.todoPay(e, item.orderId)}>支付订单</Button>
						:
						''
				}
				{
					item && item.status && (item.status === 1 || item.status === 2) ?
						<Button type="primary" size="large"
						        className="bg-blue-linear border-radius"
						        onClick={(e) => this.cancelOrder(e, item.orderId)}>取消订单</Button>
						:
						''
				}
				{
					item && item.status && (item.status === 2) ?
						<Button type="primary" size="large"
						        className="bg-primary-linear border-radius"
						        onClick={this.fenqi}>我要分期</Button>
						:
						''
				}
				{
					item && item.status && item.type !== 3 && (item.status === 3 || item.status === 4 || item.status === 5) ?
						<Button type="primary" size="large"
						        className="bg-blue-linear  border-radius"
						        onClick={(e) => this.applicationException(e, item.orderId)}>
							申请异常
						</Button>
						:
						''
				}
				{
					isBatch === 0 && item && item.status && item.status === 4 && !item.isBatch ?
						<Button type="primary" size="large" className="bg-primary-linear  border-radius"
						        onClick={(e) => this.confirmReceive(e, item.orderId)}>
							确认收货
						</Button>
						:
						''
				}
				{
					item && item.status && item.status === 8 ?
						<Button type="primary" size="large" className="bg-blue-linear  border-radius"
						        onClick={(e) => this.cancelApplicationException(e, item.orderId)}>
							取消申请
						</Button>
						:
						''
				}
				{
					item && item.status && item.type !== 3 && item.status === 5 ?
						<Button type="primary" size="large" className="bg-primary-linear  border-radius"
						        onClick={(e) => this.gotoRate(e, item.orderId)}>
							去评价
						</Button>
						:
						''
				}
			</div>
			:
			<div>
					{
					item && item.status && item.status === 2 ?
						<Button type="primary" onClick={(e) => this.todoPay(e, item.orderId)}>支付订单</Button>
						:
						''
				}
				{
					item && item.status && (item.status === 1 || item.status === 2) ?
						<Button type='link' className="text-muted" onClick={(e) => this.cancelOrder(e, item.orderId)}>取消订单</Button>
						:
						''
				}
				{item && item.status && item.type !== 3 && (item.status === 3 || item.status === 4 || item.status === 5) ?
					<Button type='link' className="text-danger" onClick={(e) => this.applicationException(e, item.orderId)}>
						申请异常
					</Button>
					:
					''
				}
				{
					item && item.status && item.status === 4 && !item.isBatch ?
						<Button type='link'
						        className="text-primary"
						        onClick={(e) => this.confirmReceive(e, item.orderId)}>
							确认收货
						</Button>
						:
						''
				}
				{
					item && item.status && item.type !== 3 && item.status === 5 ?
						<Button type='link'
						        className="text-muted"
						        onClick={(e) => this.gotoRate(e, item.orderId)}>
							去评价
						</Button>
						:
						''
				}
				{
					item && item.status && item.status === 8 ?
						<Button type='link'
						        className="text-muted"
						        onClick={(e) => this.cancelApplicationException(e, item.orderId)}>
							取消申请
						</Button>
						:
						''
				}
			</div>;
		return (buttons)
	}
}

export default withRouter(ButtonMenu);
