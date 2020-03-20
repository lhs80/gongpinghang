// 用户中心
import React, {Fragment} from 'react'
import Router, {withRouter} from 'next/router'
import {iconUrl} from 'config/evn'
import {queryOrderDetail} from 'server'
import {getPayInfoForShuangQian} from 'payApi'
import Layout from 'components/Layout/index'
import {Icon, Button, message, Divider} from 'antd'
import cookie from 'react-cookies';
import moment from 'moment'
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

class PayIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			detail: {},
			payChannel: 'weChatPay',
			payDetail: {},
			canSubmit: false
		}
	};

	componentDidMount() {
		this.getOrderDetail();
		this.submit();
	}

	componentDidUpdate(prevProps) {
		if (this.props.router.query.id !== prevProps.router.query.id) {
			this.submit();
			this.getOrderDetail()
		}
	}

	getOrderDetail = () => {
		if (!this.props.router.query.id) return;
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

	submit = () => {
		if (!this.props.router.query.id) return;
		let params = {
			orderId: this.props.router.query.id,
			channel: this.state.payChannel
		};
		getPayInfoForShuangQian(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					payDetail: res.data,
					canSubmit: true
				});
			}
		})
	};

	changePayType = (value) => {
		this.setState({
			payChannel: value
		}, () => {
			this.submit();
		})
	};

	render() {
		const {detail, payChannel, payDetail, canSubmit} = this.state;
		return (
			<Layout title="确认订单">
				<aside className="pay-wrapper">
					<div className="h1 prl2">请选择支付方式后支付</div>
					<div className="common-title"><Divider type="vertical" className="line" />支付信息</div>
					<div className="prl4 mt2 text-grey"><span>应付金额：</span><b className="h3">￥{Number(detail.orderAmount) + Number(detail.freight)}</b></div>
					{/*<div className="prl4 mt1 text-grey">请您在<span*/}
					{/*className="text-primary">{moment((moment().diff(moment(detail.createTime).add(72, 'hours'))).format('DD天MM时SS分')}</span>内完成支付，否则订单会被自动取消*/}
					{/*</div>*/}
					<div className="common-title"><Divider type="vertical" className="line" />选择支付方式</div>
					<ul className="pay-type">
						<li className={`wechat ${payChannel === 'weChatPay' ? 'active' : ''}`} onClick={() => this.changePayType('weChatPay')}>
							<IconFont type="iconfont-weixin" />
							<span className="name">微信</span>
						</li>
						<li className={`alipay ${payChannel === 'aliPay' ? 'active' : ''}`} onClick={() => this.changePayType('aliPay')}>
							<IconFont type="iconfont-alipay" />
							<span className="name">支付宝</span>
						</li>
						<li className={`quick ${payChannel === 'fastpayXy' ? 'active' : ''}`} onClick={() => this.changePayType('fastpayXy')}>
							<IconFont type="iconfont-yinhangqia1" />
							<span className="name">快捷支付</span>
						</li>
						<li className={`company ${payChannel === 'corpBank' ? 'active' : ''}`} onClick={() => this.changePayType('corpBank')}>
							<IconFont type="iconfont-wangyin" />
							<span className="name">企业网银</span>
						</li>
						<li className={`person ${payChannel === 'personalBank' ? 'active' : ''}`} onClick={() => this.changePayType('personalBank')}>
							<IconFont type="iconfont-grwy" />
							<span className="name">个人网银</span>
						</li>
					</ul>
					{/*页脚*/}
					<div className="footer">
						{/*<span className="btn-submit" onClick={this.submit}>确认支付</span>*/}
						<form action={payDetail.actionUrl} method="post" target="_blank">
							<input type="hidden" name="apiContent" value={payDetail.apiContent || ''} />
							<input type="hidden" name="merNo" value={payDetail.merNo || ''} />
							<input type="hidden" name="sign" value={payDetail.sign || ''} />
							<input type="hidden" name="signType" value={payDetail.signType || ''} />
							<input type="hidden" name="timestamp" value={payDetail.timestamp || ''} />
							<input type="hidden" name="version" value={payDetail.version || ''} />
							<input type="hidden" name="notifyUrl" value={payDetail.notifyUrl || ''} />
							<button type="submit" className="btn-submit" disabled={!canSubmit}>确认支付</button>
						</form>
					</div>
				</aside>
			</Layout>
		)
	}
}

export default withRouter(PayIndex)
