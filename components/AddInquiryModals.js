import React from 'react'
import {Button, Modal} from 'antd';
import {payByAlipayFun} from 'server'
import cookie from 'react-cookies';
import Link from 'next/link';

export default class AddInquiryModals extends React.Component {

	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
	}

	/**
	 * 去购买询价次数
	 * */
	goToBuy() {
		window.location.href = '/account.html#/buynow'
	}

	render() {
		return (
			<aside>
				{/*已注册商家的提示*/}
				<Modal visible={this.props.showType === 1}
				       okText='我知道了'
				       onCancel={this.props.closeModal}
				       centered={true}
				       footer={[<Button key="submit" type="primary" onClick={this.props.closeModal}>我知道了</Button>]}>
					<h2 className="text-center ptb4 mt4">您已成为商家用户，不可使用询价功能！</h2>
				</Modal>
				{/*企业没有询价次数的提示*/}
				<Modal visible={this.props.showType === 2}
				       okText='去购买'
				       cancelText='暂不购买'
				       onOk={this.goToBuy}
				       onCancel={this.props.closeModal}
				       centered={true}
				>
					<h2 className="text-center mt4">
						您的询价次数已用完，是否购买？
					</h2>
					<h5 className="mt3 text-center">询价价格：<span className="text-primary">2元/次</span></h5>
				</Modal>
				{/*个人没有询价次数的提示*/}
				<Modal visible={this.props.showType === 3}
				       okText='去购买'
				       cancelText='取消'
				       onOk={this.goToBuy}
				       onCancel={this.props.closeModal}
				       centered={true}
				>
					<h2 className="text-center ptb4 mt4">您的询价次数不足，是否去购买次数！</h2>
					<h5 className="text-center">完成
						<span className="text-info" onClick={() => window.location.href = `/account.html#/company/error`} style={{cursor: 'pointer'}}>企业认证</span>
						，每天享有20次免费询价机会哦！
					</h5>
				</Modal>
				{/*存在已下架的店铺*/}
				<Modal visible={this.props.showType === 4}
				       okText='继续'
				       cancelText='取消'
				       onOk={this.props.goToInquiry}
				       onCancel={this.props.closeModal}
				       centered={true}
				>
					<h2 className="text-center ptb4 mt4">询价单中存在已被下架的商家，继续操作将会删除已被下架的商家，是否继续？</h2>
				</Modal>
			</aside>
		)
	}
}
