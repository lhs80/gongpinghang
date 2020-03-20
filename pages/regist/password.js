//设置密码
import React, {Component} from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/login'
import {Form, Input, Row, Button, message} from 'antd'
import CommonFooter from 'components/CommonFooter'
import RegModal from './components/RegModal'
import cookie from 'react-cookies';
import {loginIn, registerFun} from 'server'
import {checkRepeat} from 'config/regular';
import md5 from 'blueimp-md5'
import axios from 'config/http'
import './style.less'

const FormItem = Form.Item;
let captchaIns = null;

class SetPassWord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmDirty: false,
			isShow: 'none',
			mobile: cookie.load('registInfo') ? cookie.load('registInfo').mobile : null,
			companyName: cookie.load('registInfo') ? cookie.load('registInfo').companyName : null,
			// companyType: cookie.load('registInfo') ? cookie.load('registInfo').companyType : null,
			inviteCode: cookie.load('registInfo') ? cookie.load('registInfo').inviteCode : null,
		};
		this.checkConfirm = this.checkConfirm.bind(this);
		this.checkPassword = this.checkPassword.bind(this);
	}

	checkPassword(rule, value, callback) {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('password')) {
			callback('两次密码输入不一致，请重新输入!');
		} else {
			callback();
		}
	}

	componentDidMount() {
		this.initCaptcha();
	}

	initCaptcha = () => {
		let self = this;
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
					mobile: self.state.mobile,
					// companyType: self.state.companyType,
					companyName: self.state.companyName,
					password: md5(self.props.form.getFieldValue('password')),
					source: 3,
					validate: data.validate,
					inviteCode: self.state.inviteCode
				};
				registerFun(params).then(res => {
					if (res.result === 'success') {
						axios.defaults.headers.clientId = res.data.clientId;
						axios.defaults.headers.userCode = res.data.userCode;
						let registData = {
							token: res.data.token,
							userCode: res.data.userCode
						};
						const expires = new Date();
						expires.setDate(expires.getDate() + 3);
						cookie.save('ZjsWeb', registData, {expires, path: '/'});
						/*弹窗是否完善资料*/
						self.setState({
							isShow: 'block'
						});
					} else {
						message.error(res.msg)
					}
				});
			}
		}, function onload(instance) {
			// 初始化成功
			captchaIns = instance
		}, function onerror(err) {
			// 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
		})
	};

	handleConfirmBlur = (e) => {
		const value = e.target.value;
		this.setState({confirmDirty: this.state.confirmDirty || !!value});
	};

	checkConfirm(rule, value, callback) {
		const form = this.props.form;
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 6) {
				callback('请输入6~20位密码，可以为数字、字母或符号')
			}
			//校验数字是否递增或者递减
			if (value.length >= 6 && checkRepeat(value)) {
				callback('密码强度较弱，请重新设置');
				return;
			}
			if (value.length >= 6 && value === this.state.mobile) {
				callback('密码不能和登录账号完全一致');
			}
			if (this.state.confirmDirty) {
				form.validateFields(['confirm'], {force: true});
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('密码格式不正确')
		}
		callback();
	}

	/*-------注册完成----*/
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				captchaIns && captchaIns.verify();
			}
		});
	}

	/*----返回上一步----*/
	lastStep() {
		Router.push('/regist/home');
	}

	render() {
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: {span: 8},
			},
			wrapperCol: {
				xs: {span: 16},
			},
		};
		return (
			<Layout className="register-wrapper" title="注册">
				<section className="regFormWrapper">
					<Form className="registerForm" onSubmit={this.handleSubmit.bind(this)}>
						<div className="lineForm">
							<span className="cur" />
							<span className="cur" />
							<span />
						</div>
						<h2 className="mt6 text-center large text-darkgrey">请注册</h2>
						<div className="userWrapper mt5">
							<FormItem
								{...formItemLayout}
								label="设置密码"
								className="form-item"
							>
								{getFieldDecorator('password', {
									rules: [{
										required: true, message: '请输入6~20位密码，可以为数字、字母或符号',
									}, {
										validator: this.checkConfirm,
									}],
									validateTrigger: ['onChange'],
								})(
									<Input type="password" placeholder="请设置6-20位密码" maxLength={20} size="large" style={{lineHeight: '20px'}} />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="确认密码"
								className="form-item"
							>
								{getFieldDecorator('confirm', {
									rules: [{
										required: true, message: '再次输入密码'
									}, {
										validator: this.checkPassword,
									}],
								})(
									<Input type="password" placeholder="请再次输入密码" size="large" maxLength={20} onBlur={this.handleConfirmBlur}
									       style={{lineHeight: '20px'}} />
								)}
							</FormItem>
							<FormItem>
								<div className="regItem text-center" style={{marginLeft: '50px', marginRight: '50px', marginTop: '80px'}}>
									<Button type="primary" htmlType="submit" size="large" block className="bg-primary-linear border-circle" style={{height: '50px'}}
									        id="captcha">注册完成</Button>
									<a href="javascript:;" className="lastStep" onClick={this.lastStep.bind(this)}>上一步</a>
								</div>
							</FormItem>
						</div>
					</Form>
				</section>
				<RegModal isShow={this.state.isShow} history={this.props.history} />
			</Layout>
		);
	}
}

const password = Form.create()(SetPassWord);
export default password
