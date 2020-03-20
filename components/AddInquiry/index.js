import React, {Fragment} from 'react'
import {isInquiryFun} from 'server'
import {Button, Modal, message, Icon} from 'antd';
import cookie from 'react-cookies';
import {iconUrl} from 'config/evn'
import Router from 'next/router'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let timerStart = undefined;
export default class AddInquiry extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModalKind: 0,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest'
		}
	};

	changeType = (type) => {
		this.setState({
			showModalKind: type
		})
	};

	/**
	 * 添加询价单
	 * */
	addInquirySheet = (e) => {
		e.stopPropagation();
		//没选择常购材料去询价
		if (this.props.ids && this.props.ids.length === 0) {
			this.setTime('请选择常购材料！');
			return false;
		}
		//用户是否登录
		if (this.state.userCode && this.state.userCode !== 'guest') {
			//已登录
			isInquiryFun(this.state.userCode).then(res => {
				//已认证
				if (res.data.isAuthPri) {
					let closeShop = -1;
					if (this.props.shopInfo) {
						closeShop = this.props.shopInfo.findIndex(shop => {
							return shop.shopState === '0'
						});
					}
					if (closeShop >= 0) {
						this.changeType(4);
					} else {
						Router.push({pathname: '/enquiry/add', query: {...this.props.urlParams}})
					}
				} else {
					//未认证
					this.changeType(5);
				}
			});
		} else {
			Router.push({pathname: '/login/index'});
		}
	};

	/*
* 倒计时
* */
	setTime = (msg) => {
		clearTimeout(timerStart);
		timerStart = setTimeout(function () {
			message.error(msg, 0.5)
		}, 500)
	};

	/**
	 * 去购买询价次数
	 * */
	goToBuy() {
		Router.push('/account/custom-center/buy-now')
	}

	closeModal = () => {
		this.setState({
			showModalKind: 0
		})
	};

	render() {
		const {showModalKind} = this.state;
		const {children} = this.props;
		return (
			<Fragment>
				{
					children ?
						<div className={this.props.class} onClick={(e) => this.addInquirySheet(e)}>
							{children}
						</div>
						:
						<Button type={this.props.type} size={this.props.size} className={this.props.class} onClick={(e) => this.addInquirySheet(e)}
						        style={this.props.style}>
							{this.props.icon ? <IconFont type={this.props.icon} className={this.props.iconClass} /> : ''}
							{this.props.text}
						</Button>
				}
				{/*已注册商家的提示*/}
				<Modal visible={showModalKind === 1}
				       okText='我知道了'
				       onCancel={this.closeModal}
				       centered={true}
				       footer={[<Button key="submit" type="primary" onClick={this.closeModal}>我知道了</Button>]}>
					<h2 className="text-center ptb4 mt4">您已成为商家用户，不可使用询价功能！</h2>
				</Modal>
				{/*存在已下架的店铺*/}
				<Modal visible={showModalKind === 4}
				       okText='继续'
				       cancelText='取消'
				       onOk={this.props.goToInquiry}
				       onCancel={this.closeModal}
				       centered={true}
				>
					<h2 className="text-center ptb4 mt4">询价单中存在已被下架的商家，继续操作将会删除已被下架的商家，是否继续？</h2>
				</Modal>
				{/*未认证的提示*/}
				<Modal visible={showModalKind === 5}
				       okText='立即认证'
				       cancelText='晚点再说'
				       onOk={() => Router.push({pathname: '/account/set-user/company-auth'})}
				       onCancel={this.closeModal}
				       centered={true}
				>
					<h2 className="text-center ptb2">请先完成企业实名认证</h2>
					<h6 className="text-center text-muted">认证之后可享受询价下单、线上支付、担保交易等权益</h6>
				</Modal>
			</Fragment>
		)
	}
}
