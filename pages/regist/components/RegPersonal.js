import React, {Component} from 'react';
import Router from 'next/router'
import Link from 'next/link'
import {checkPhone} from 'config/regular';
import cookie from 'react-cookies';
import {phoneValidate, sendSmsCode, validateSmsCode, companyRegist, registerFun, getProtocolInfoFun} from 'server'
import {Form, Input, Button, Modal, message, Radio} from 'antd';
import '../style.less';

const FormItem = Form.Item;

class RegPersonal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			content: '',
			title: '',
			/*----个人----*/
			closeBtn: false,
			visible: false,
			tipModal: false,
			loading: false,
			confirmDirty: false,
			isShowSend: false,
			codeTip: '获取验证码',
			count: '60',
			defaultMobile: cookie.load('registInfo') ? cookie.load('registInfo').mobile : '',
			defaultCode: cookie.load('registInfo') ? cookie.load('registInfo').verifyCode : '',
			defaultCompanyName: cookie.load('registInfo') ? cookie.load('registInfo').companyName : ''
		};
	}

	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	componentDidMount() {
		this.getProtocolInfo();
	}

	//获取注册协议
	getProtocolInfo = () => {
		let params = {
			protocolId: 9
		};
		getProtocolInfoFun(params).then(res => {
			this.setState({
				content: res.data.protocolContext,
				title: res.data.protocolName
			})
		})
	};

	//验证用户手机号码是否已注册
	//验证用户手机号码是否已注册成为商户
	validatorMobile = (rule, value, callback) => {
		let params = {
			mobile: value
		};
		phoneValidate(params).then(res => {
			if (res.result === 'error') {
				callback(res.data)
			} else {
				callback();
			}
		})
	};

	//发送短信验证码
	sendSmsCodeInfo = () => {
		const form = this.props.form;
		let mobile = form.getFieldValue('mobile');
		let params = {
			mobile
		};
		if (!mobile) return false;
		sendSmsCode(params).then(res => {
			if (res.result === 'success') {
				message.success('验证码已发送,5分钟之内有效');
				this.setState({
					isShowSend: true,
				}, () => {
					this.countDown()
				});
			}
		})
	};

	countDown = () => {
		let count = 60;
		let countdown = setInterval(CountDown, 1000);
		let self = this;

		function CountDown() {
			self.setState({
				count: count,
				isShowSend: true,

			});
			if (count === 0) {
				self.setState({
					codeTip: '重新发送',
					isShowSend: false,
				});
				clearInterval(countdown);
			}
			count--;
		}
	};

	//提交表单
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					mobile: values.mobile,
					verifyCode: values.verifyCode
				};
				/*-----验证码校验----*/
				validateSmsCode(params).then(res => {
					if (res.result === 'success') {
						let registInfo = {
							mobile: values.mobile,
							// companyType: values.companyType,
							companyName: values.companyName,
							inviteCode: values.inviteCode
						};
						cookie.save('registInfo', registInfo);
						Router.push('/regist/password')
					} else {
						const form = this.props.form;
						form.setFields({
							verifyCode: {
								value: values.verifyCode,
								errors: [new Error(res.msg)],
							},
						});
					}
				});
			}
		});
	};

	// 关闭用户协议窗口
	handleCancel = () => {
		this.setState({visible: false});
	};

	//显示用户协议窗口
	showModal = () => {
		this.setState({visible: true});
	};

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
		const {defaultMobile, defaultCompanyName} = this.state;
		const formItemLayout = {
			labelCol: {
				span: 6,
				offset: 0
			},
			wrapperCol: {
				span: 16,
				offset: 0
			},
		};
		const tailItemLayout = {
			labelCol: {
				span: 0,
				offset: 0
			},
			wrapperCol: {
				span: 24,
				offset: 0
			},
		};
		const BtnGroup = this.state.isShowSend
			? <Button type="link" className="h4">{this.state.count}s</Button>
			: <Button type="link" className="h4"
			          disabled={getFieldError('mobile') || !this.props.form.getFieldValue('mobile')}
			          onClick={this.sendSmsCodeInfo}>{this.state.codeTip}</Button>;
		return (
			<Form onSubmit={this.handleSubmit} {...formItemLayout} >
				<FormItem label="手机号码">
					{getFieldDecorator('mobile', {
						initialValue: defaultMobile,
						validateTrigger: 'onBlur',
						validateFirst: true,
						rules: [
							{required: true, message: '请输入手机号'},
							{pattern: /^1[23456789][0-9]{9}$/, message: '请输入正确的手机号码'},
							{validator: this.validatorMobile}
						]
					})(
						<Input placeholder="请输入手机号" size="large" maxLength={11} />
					)}
				</FormItem>
				<FormItem label="验证码">
					{getFieldDecorator('verifyCode', {
						rules: [{required: true, message: '请输入验证码!'}],
					})(
						<Input placeholder="请输入验证码" size="large" maxLength={4} suffix={BtnGroup} />
					)}
				</FormItem>
				<FormItem label="公司名称">
					{getFieldDecorator('companyName', {
						initialValue: defaultCompanyName,
						rules: [
							// {required: true, message: '请输公司名称'}
						]
					})(
						<Input placeholder="请输入公司名称" size="large" maxLength={30} />
					)}
				</FormItem>

				<FormItem label="邀请码">
					{getFieldDecorator('inviteCode', {
						initialValue: '',
						rules: [
							{required: false, message: '请输邀请码'}
						]
					})(
						<Input placeholder="请输邀请码" size="large" maxLength={6} style={{verticalAlign: 'middle'}} />
					)}
				</FormItem>
				<FormItem {...tailItemLayout} className="text-center">
					<div className="text-grey text-center">注册即视为您同意 <a onClick={this.showModal.bind(this)}>《工品行用户协议》</a></div>
				</FormItem>
				<FormItem className="prl4" {...tailItemLayout}>
					<Button
						type='primary'
						size='large'
						htmlType='submit'
						className="bg-primary-linear border-circle"
						block> 下一步 </Button>
					<div className="text-center"><a href='/login/index' className="text-darkgrey">已有账号？去登录</a></div>
				</FormItem>
				{/*注册协议*/}
				<Modal
					visible={this.state.visible}
					title="工品行用户协议"
					className="regModalAlert"
					onCancel={this.handleCancel}
					closable={this.state.closeBtn}
					centered={true}
					footer={[
						<Button key="back" type="primary" size="large" onClick={this.handleCancel.bind(this)}>关闭</Button>,
					]}
					width='70%'
					bodyStyle={{height: '500px', overflow: 'auto'}}
				>
					<div dangerouslySetInnerHTML={{__html: this.state.content}} />
				</Modal>
			</Form>
		);
	}
}

const RegPersonalForm = Form.create()(RegPersonal);
export default RegPersonalForm
