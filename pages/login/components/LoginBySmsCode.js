//验证码登录
import React from 'react'
import Router, {withRouter} from 'next/router';
import {Button, Col, Form, Icon, Input, Row, Divider} from 'antd';
import Link from 'next/link';
import cookie from 'react-cookies' //操作cookie
import {checkPhone} from 'config/regular'
import {loginIn, sendSmsCode, phoneValidate} from 'server'
import axios from 'config/http'

const FormItem = Form.Item;
let captchaIns = null;

class LoginBySmsCode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mobile: '',
			captchaCode: '',
			count: 60,
			isSmsSended: false,
			tipText: '发送验证码'
		};
	}

	componentDidMount() {
		this.initCaptcha();
	}

	initCaptcha = () => {
		let self = this;
		if (initNECaptcha) {
			initNECaptcha({
				captchaId: '1f7484c06f8846d3b0aa324f6e59bbec',
				element: '#captcha',
				mode: 'bind',
				onReady: function (instance) {
					// 验证码一切准备就绪，此时可正常使用验证码的相关功能
				},
				onVerify: function (err, data) {
					/**
					 * 第一个参数是err（Error的实例），验证失败才有err对象
					 * 第二个参数是data对象，验证成功后的相关信息，data数据结构为key-value，如下：
					 * {
					 *   validate: 'xxxxx' // 二次验证信息
					 * }
					 **/
					if (err) return  // 当验证失败时，内部会自动refresh方法，无需手动再调用一次
					let params = {
						mobile: self.props.form.getFieldValue('mobile'),
						verifyCode: self.props.form.getFieldValue('captchaCode'),
						validate: data.validate
					};
					loginIn(params).then(res => {
						if (res.result === 'success') {
							axios.defaults.headers.clientId = res.data.clientId;
							axios.defaults.headers.userCode = res.data.userCode;
							let params = {
								token: res.data.token,
								userCode: res.data.userCode,
								clientId: res.data.clientId
							};

							const expires = new Date();
							expires.setDate(expires.getDate() + 3);

							cookie.save('ZjsWeb', params, {expires, path: '/'});

							const {router} = self.props;
							let url = router.query.redirectUrl ? decodeURIComponent(router.query.redirectUrl) : '/index';
							if (router.query.key) {
								let query = {};
								query[router.query.key] = router.query.value;
								Router.push({pathname: url, query: query});
								return false;
							} else if (router.query.value) {
								url = url + '?' + router.query.value;
							}
							Router.push(url);

							// Router.push('/')
						} else {
							if (res.msg === '账户不存在！') {
								self.props.form.setFields({
									mobile: {
										value: self.props.form.getFieldValue('mobile'),
										errors: [new Error(res.msg)],
									},
								});
							} else {
								self.props.form.setFields({
									captchaCode: {
										value: self.props.form.getFieldValue('captchaCode'),
										errors: [new Error(res.msg)],
									},
								});
							}
							captchaIns && captchaIns.refresh()
						}
					});
				}
			}, function onload(instance) {
				// 初始化成功
				captchaIns = instance
			}, function onerror(err) {
				// 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
			})
		}

	};

	handleSubmitByCode = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				captchaIns && captchaIns.verify();
			}
		});
	};

	SendSmsCodeFun() {
		let params = {
			mobile: this.props.form.getFieldValue('mobile')
		};
		sendSmsCode(params).then(res => {
			if (res.result === 'success') {
				this.setTime();
				this.setState({
					isSmsSended: true,
				});
			}
		})
	}

	setTime() {
		let self = this;
		if (this.state.isSmsSended) return;
		let count = this.state.count;
		const timer = setInterval(function () {
			self.setState({
				count: (--count),
			});
			if (count === 0) {
				clearInterval(timer);
				self.setState({
					isSmsSended: false,
					count: 60,
					tipText: '重新发送'
				})
			}
		}, 1000);
	}

	/*---个人手机号----*/
	grPhone = (rule, value, callback) => {
		if (value && isNaN(value)) {
			this.props.form.setFields({
				mobile: {
					value: value.replace(/\D/g, ''),
					errors: [new Error('请输入正确的手机号码')],
				},
			});
		} else if (value && !checkPhone(value)) {
			callback('请输入正确的手机号码');
		} else {
			//判断手机号码是否注册
			let params = {
				mobile: value
			};
			phoneValidate(params).then(res => {
				if (res.msg === '01')
					callback();
				else
					callback('该手机号码未注册');
			})
		}
	};


	render() {
		//接收页面参数
		const {getFieldDecorator, getFieldError} = this.props.form;

		const BtnGroup = this.state.isSmsSended
			?
			<Button size="large" type="link" className="btn-sendCode">重新发送{this.state.count}s</Button>
			:
			<Button size="large" type="link" className="btn-sendCode"
			        disabled={getFieldError('mobile') || !this.props.form.getFieldValue('mobile')}
			        onClick={this.SendSmsCodeFun.bind(this)}>{this.state.tipText}</Button>;
		return (
			<Form onSubmit={this.handleSubmitByCode} className="login-form">
				<FormItem>
					{getFieldDecorator('mobile', {
						rules: [
							{required: true, message: '请输入手机号'},
							{validator: this.grPhone},
						]
					})(
						<Input maxLength={11} size="large" placeholder="请输入手机号" />
					)}
				</FormItem>
				<FormItem>
					<Row gutter={10}>
						<Col span={24}>
							{getFieldDecorator('captchaCode', {
								rules: [{required: true, message: '请输入手机验证码!', whitespace: true,}],
							})(
								<Input maxLength={4} size="large" placeholder="请输入手机验证码" suffix={BtnGroup} />
							)}
						</Col>
					</Row>
				</FormItem>
				<Button size="large" block type="primary" htmlType="submit" className="login-form-button bg-primary-linear">登录</Button>
				<div className="mt2 text-right prl1">
					<Link href='/regist/setNewPassWord'><a>忘记密码</a></Link>
					<Divider type="vertical" />
					<Link href='/regist/home'><a>注册</a></Link>
				</div>
			</Form>
		)
	}
}


LoginBySmsCode = Form.create()(LoginBySmsCode);
export default withRouter(LoginBySmsCode);
