//找回密码
import React, {Component} from 'react'
import {Form, Input, Row, Col, Button, message, Layout} from 'antd'
import {checkPhone, checkRepeat} from 'config/regular';
import {phoneValidate, sendSmsCode, validateSmsCode, modifyAccountFun} from 'server'
import md5 from 'blueimp-md5'
import './style.less'

const FormItem = Form.Item;

class SetPassWord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			confirmDirty: false,
			disabled: true,
			loading: false,
			isShowSend: false,
			count: 60,
			codeTip: '发送验证码',
			showCheck: 'none',
			tip: 'none',
			passWord: false
		};
		this.checkConfirm = this.checkConfirm.bind(this);
		this.checkPassword = this.checkPassword.bind(this);
	}

	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	}
	/*----点击logo跳转到首页----*/
	jumpHome = () => {
		window.location.href = `/`
	};
	/*---个人手机号----*/
	grPhone = (rule, value, callback) => {
		const form = this.props.form;
		if (value && isNaN(value)) {
			this.props.form.setFields({
				userPhone: {
					value: value.replace(/\D/g, ''),
					errors: [new Error('请输入正确的手机号码')],
				},
			});
		} else if (value && !checkPhone(value)) {
			callback('请输入正确的手机号码');
		} else if (this.state.passWord) {
			form.validateFields(['password'], {force: true});
		} else {
			callback();
		}
	}

	/*---个人验证码---*/
	codeBtn() {
		const form = this.props.form;
		let phoneVal = form.getFieldValue('userPhone');
		let userCode = form.getFieldValue('userCode');
		let params = {
			mobile: phoneVal
		};
		/*---是否被注册---*/
		phoneValidate(params).then(res => {
			if (res.result !== 'success') {
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
			} else {
				form.setFields({
					userPhone: {
						value: phoneVal,
						errors: [new Error('账号不存在')],
					},
				});
			}
		});
	}

	checkPassword(rule, value, callback) {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('password')) {
			callback('两次密码输入不一致，请重新输入!');
		} else {
			callback();
		}
	}

	checkConfirm(rule, value, callback) {
		const form = this.props.form;
		const mobile = this.props.form.getFieldValue('userPhone');
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 6) {
				callback('请输入6~20位密码，可以为数字、字母或符号')
			}
			//校验数字是否递增或者递减
			if (value.length >= 6 && checkRepeat(value)) {
				callback('密码强度较弱，请重新设置');
				return;
			}
			if (value.length >= 6 && value === mobile) {
				callback('密码不能和登录账号完全一致');
			}
			if (this.state.confirmDirty) {
				form.validateFields(['confirm'], {force: true});
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('密码格式不正确')
		}
		callback();
		this.setState({
			passWord: true
		})
	}

	handleConfirmBlur = (e) => {
		const value = e.target.value;
		this.setState({confirmDirty: this.state.confirmDirty || !!value});
	}
	/*----表单提交-----*/
	handleSubmit = (e) => {
		e.preventDefault();
		const form = this.props.form;
		let mobile = form.getFieldValue('userPhone');
		let passWord = form.getFieldValue('password');
		let setCode = form.getFieldValue('userCode');
		let self = this;
		let data = {
			mobile: mobile,
			verifyCode: setCode
		};
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let param = {
					mobile: values.userPhone,
					password: md5(values.password),
				};
				/*------校验验证码----*/
				validateSmsCode(data).then(res => {
					if (res.result === 'success') {
						self.setState({
							tip: 'block'
						});
						let timer = setTimeout(() => {
							self.setState({
								tip: 'none'
							});
							/*---符合结果后提交----*/
							modifyAccountFun(param).then(res => {
								if (res.result === 'success') {
									this.props.history.push(`/login`)
								}
							});

						}, 3000);
					} else {
						form.setFields({
							userCode: {
								value: values.userCode,
								errors: [new Error('请输入正确的验证码')],
							},
						});
						this.setState({
							tip: 'none'
						});
					}
				});
			}
		});
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

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
		const phoneError = getFieldError('phone');
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 6},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 14},
			},
		};
		return (
			<Layout title="找回密码" className="register-wrapper">
				<p className="successTip resultTip" style={{display: this.state.tip}}>操作成功</p>
				<header className="registLogo">
					<div className="icon-logo baImg" onClick={this.jumpHome.bind(this)} style={{cursor: 'pointer'}} />
				</header>
				<section>
					<Form className="registerForm mt8" onSubmit={this.handleSubmit} style={{paddingTop: '60px'}}>
						<h2 className="text-center large text-darkgrey">找回密码</h2>
						<div className="userWrapper mt5">
							<FormItem
								{...formItemLayout}
								label="手机号码"
								className="form-item"
							>
								{getFieldDecorator('userPhone', {
									rules: [
										{required: true, message: '请输入手机号'},
										{validator: this.grPhone}
									]
								})(
									<Input placeholder="请输入手机号" size="large" maxLength={11} />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="短信验证码"
								className="form-item"
							>
								<Row gutter={10}>
									<Col span={14}>
										{getFieldDecorator('userCode', {
											rules: [{required: true, message: '请输入手机验证码!'}],
										})(
											<Input className="sendItem" placeholder="请输入短信验证码" size="large" maxLength={4} />
										)}
									</Col>
									<Col span={10}>
										{
											this.state.isShowSend
												? <Button size="large" type="primary" htmlType="button" block className="regSendCode" ghost>{this.state.count}s</Button>
												: <Button size="large" type="primary" htmlType="button" block className="regSendCode"
												          disabled={getFieldError('userPhone') || !this.props.form.getFieldValue('userPhone')}
												          ghost onClick={this.codeBtn.bind(this)}>{this.state.codeTip}</Button>
										}
									</Col>
								</Row>
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="设置新密码"
								className="form-item"
							>
								{getFieldDecorator('password', {
									rules: [{
										required: true, message: '请输入6~20位密码，可以为数字、字母或符号',
									}, {
										validator: this.checkConfirm,
									}],
								})(
									<Input type="password" placeholder="请设置6-20位密码" maxLength="20" size="large" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="再次输入新密码"
								className="form-item"
							>
								{getFieldDecorator('confirm', {
									rules: [{
										required: true, message: '再次输入密码'
									}, {
										validator: this.checkPassword,
									}]
								})(
									<Input type="password" placeholder="请再次输入密码" size="large" maxLength="20" onBlur={this.handleConfirmBlur} />
								)}
							</FormItem>
							<FormItem className="OkBtn">
								<div className="regItem">
									<Button type="primary" htmlType="submit" size="large" block className="regPassword mt2">完成</Button>
								</div>
							</FormItem>
						</div>
					</Form>
				</section>
			</Layout>
		);
	}
}

const passWord = Form.create()(SetPassWord);
export default passWord
