//手机密码登录
import React from 'react'
import {Button, Col, Form, Icon, Input, Row, Divider} from 'antd';
import Link from 'next/link';
import Router, {withRouter} from 'next/router';
import cookie from 'react-cookies' //操作cookie
import md5 from 'blueimp-md5'
import {loginIn} from 'server'
import {validatePhone, checkPhone} from 'config/regular'
import {iconUrl} from 'config/evn'
import axios from 'config/http'

const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let captchaIns = null;

class LoginByPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mobile: '',
			password: '',
			showMobileError: false,
			showPswError: false,
			token: ''
		}
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
					if (err) return; // 当验证失败时，内部会自动refresh方法，无需手动再调用一次
					let params = {
						mobile: self.props.form.getFieldValue('mobile'),
						password: md5(self.props.form.getFieldValue('password')),
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
							let url = router.query.redirectUrl ? decodeURIComponent(router.query.redirectUrl) : '/';
							if (router.query.key) {
								let query = {};
								query[router.query.key] = router.query.value;
								Router.push({pathname: url, query: query});
								return false;
							} else if (router.query.value) {
								url = url + '?' + router.query.value;
							}
							Router.push(url);
						} else {
							if (res.msg === '密码错误！') {
								self.props.form.setFields({
									password: {
										value: md5(self.props.form.getFieldValue('password')),
										errors: [new Error('密码错误')],
									},
								});
							} else if (res.msg === '账户不存在！') {
								self.props.form.setFields({
									mobile: {
										value: self.props.form.mobile,
										errors: [new Error('账户不存在')],
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
				captchaIns = instance
				// 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
			})
		}
	};

	/*
	* 提交表单
	*/
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				captchaIns && captchaIns.verify();
			}
		});
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
			callback();
		}
	};

	render() {
		//接收页面参数
		const {getFieldDecorator} = this.props.form;
		return (
			<Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
				<FormItem>
					{getFieldDecorator('mobile', {
						// validateTrigger: 'onBlur',
						rules: [
							{required: true, message: '请输入手机号码'},
							//{validator: validatePhone}
							{validator: this.grPhone}
						],
					})(
						<Input size="large" maxLength={11} placeholder="请输入手机号" />
					)}
				</FormItem>
				<FormItem>
					{getFieldDecorator('password', {
						validateTrigger: 'onBlur',
						rules: [
							{required: true, message: '请输入密码'},
							{max: 20, message: '密码长度6-20'},
							{min: 6, message: '密码长度6-20'},
						],
					})(
						<Input size="large" maxLength={20} type="password" placeholder="请输入登录密码" />
					)}
				</FormItem>
				<Button size="large" block type="primary" htmlType="submit" id="captcha" className="login-form-button bg-primary-linear">登录</Button>
				<div className="mt2 text-right prl1">
					<Link href='/regist/setNewPassWord'><a>忘记密码</a></Link>
					<Divider type="vertical" />
					<Link href='/regist/home'><a>注册</a></Link>
				</div>
			</Form>
		)
	}
}

LoginByPassword = Form.create()(LoginByPassword);
export default withRouter(LoginByPassword);
