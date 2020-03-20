import React, {Component, Fragment} from 'react';
import {Button, Modal, Input, message} from 'antd'
import {bindCardFun, unBindCardFun} from 'payApi'
import {sendSmsCode} from 'server'
import {unzeronumber} from 'config/regular'
import './bank-style.less'

let msgBox = null;

class BankCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			money: 0,
			smsCode: '',
			errorMsg: ''
		}
	}

	//填写打款金额
	inputValidateMomey = () => {
		let self = this;
		Modal.confirm({
			okText: '确定',
			cancelText: '取消',
			icon: null,
			width: '560px',
			onOk() {
				if (!self.state.money || !unzeronumber.test(self.state.money)) {
					self.setState({
						errorMsg: '请输入正确的打款金额！'
					})
				} else {
					let params = {
						cardNo: self.props.info.cardNo,
						account: self.state.money,
						bkMerNo: self.props.info.bkMerNo,
						seqNo: self.props.info.seqNo,
						userCode: self.props.userInfo.userCode
					};
					bindCardFun(params).then(res => {
						if (res.result === 'success') {
							message.success('绑卡成功！').then(() => this.props.reload());
						} else {
							if (!msgBox) {
								msgBox = message.error(res.msg, 0.5, () => {
									msgBox = null;
								});
							}
						}
					})
				}
			},
			content: (
				<div className="prl3">
					<h3 className="text-center">填写打款金额</h3>
					<h5 className="text-grey mt6"><label className="prl2">开户银行</label><span>{this.props.info.bankName}</span></h5>
					<h5 className="text-grey mt4"><label className="prl2">银行账户</label><span>{this.props.info.cardNo}</span></h5>
					<h5 className="text-grey mt3">
						<label className="prl2">打款金额</label>
						<span><Input placeholder="请输入打款金额" size="large" style={{width: '300px'}} onChange={this.setMoney} /></span>
					</h5>
					<h5 className="text-primary prl5">{this.state.errorMsg}</h5>
				</div>
			)
		})
	};

	//解绑
	unBindCard = () => {
		let self = this;
		let data = {
			mobile: self.props.mobile
		};
		sendSmsCode(data).then(res => {
			if (res.result === 'success') {
				message.success('验证码已发送！');
				Modal.confirm({
					okText: '确定',
					cancelText: '取消',
					icon: null,
					width: '560px',
					onOk() {
						let params = {
							cardNo: self.props.info.cardNo,
							bkMerNo: self.props.info.bkMerNo,
							seqNo: self.props.info.seqNo,
							mobile: self.props.mobile,
							smsCode: self.state.smsCode
						};

						unBindCardFun(params).then(res => {
							if (res.result === 'success') {
								message.success('解绑成功！').then(() => self.props.reload())
							} else {
								message.error(res.msg)
							}
						})
					},
					content: (
						<div className="prl3">
							<h3 className="text-center">银行卡解绑</h3>
							<h5 className="text-grey mt4">已向您的手机号*****发送了验证码，请输入验证码完成解除银行卡：</h5>
							<h5 className="text-grey mt3">
								<label className="prl2">短信验证码</label>
								<span><Input placeholder="请输入短信验证码" size="large" style={{width: '300px'}} onChange={this.setSmsCode} /></span>
							</h5>
						</div>
					)
				})
			}
		});
	};

	//设置打款金额
	setMoney = (e) => {
		this.setState({
			money: e.target.value
		})
	};

	//设置短信验证码
	setSmsCode = (e) => {
		this.setState({
			smsCode: e.target.value
		})
	};

	maskBankNo = (value) => {
		let maskNo = value.substring(value.length - 4, value.length);
		return maskNo.padStart(value.length, '*').replace(/\s/g, '').replace(/(.{4})/g, '$1 ');
	};

	render() {
		const {info} = this.props;
		const CardButtons = () => {
			let content = '';
			switch (info && info.status) {
				case 0:
					content = <Fragment>
						<h5 className="text-muted mt1">已提交卡号信息，等待打款</h5>
					</Fragment>;
				case 1:
					content = <Fragment>

						<Button type="primary" size="large" ghost style={{height: '40px', width: '120px'}} onClick={this.inputValidateMomey}>去填写</Button>
						<h5 className="text-muted mt1">已打款，请填写打款金额以完成认证</h5>
					</Fragment>;
				case 2:
					content = <Fragment>
						<Button type="default" size="large" style={{height: '40px', width: '120px'}} disabled={this.props.isOnlyOne()}
						        onClick={this.unBindCard}>解除绑定</Button>
					</Fragment>;
			}
			return content;
		};
		return (
			<aside className="bank-card-wrapper">
				<div className={`cover ${info && info.cardType && info.cardType === '0' ? 'person' : 'company'}`}>
					<h4 className="text-white">{info && info.bankName ? info.bankName : ''}</h4>
					<h3 className="text-white mt2">{info && info.cardNo ? this.maskBankNo(info.cardNo) : ''}</h3>
					<h6 className="text-white mt3">{info && info.cardType && info.cardType === '0' ? '个人银行卡' : '企业对公账户'}</h6>
				</div>
				<div className="text-center mt2">
					<CardButtons />
				</div>
			</aside>
		);
	}
}

export default BankCard;
