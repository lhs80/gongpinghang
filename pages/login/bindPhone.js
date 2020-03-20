import React from 'react'
import Layout from 'components/Layout/login'
import cookie from 'react-cookies' //操作cookie
import md5 from 'blueimp-md5'
import {Button, Col, Form, Icon, Input, Row} from 'antd';
import {validatePhone} from 'config/regular'
import {bindMobileFun, sendSmsCode} from 'server'
import {iconUrl} from 'config/evn'

const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class BindPhone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mobile: '',
			verifyCode: '',
			count: 60,
			isSmsSended: false,
			tipText: '发送验证码'
		};
	}

	componentDidMount() {
		if (cookie.load('ZjsWeb')) {
			window.location.href = '/';
		}
	}

	/*
	* 提交表单
	*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					// todo
					thirdAccount: '406509766',//第三方账号
					nickName: '舍得',//第三方昵称
					headUrl: 'www.baidu.com',//第三方头像
					mobile: values.mobile,//手机号
					password: md5(values.password),
					verifyCode: values.verifyCode,
				};
				bindMobileFun(params).then(res => {
					if (res.result === 'success') {
						if (res.msg === '0') {
							cookie.save('ZjsWeb', res.data, {path: '/'});
							let url = this.props.history.location.search;
							window.location.href = url.split('=')[1];
						}
					} else {
						if (res.msg === '短信验证码错误或已失效') {
							this.props.form.setFields({
								verifyCode: {
									value: values.verifyCode,
									errors: [new Error('短信验证码错误或已失效。')],
								},
							});
						} else if (res.msg === '该第三方账户已绑定过userCode') {
							this.props.form.setFields({
								mobile: {
									value: values.mobile,
									errors: [new Error('该手机号已被绑定。')],
								},
							});
						}
					}
				})
			}
		})
	};

	/*
	*发送短信
	* */
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
	};

	/*
	* 倒计时
	* */
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

	render() {
		//接收页面参数
		const {getFieldDecorator, getFieldError} = this.props.form;

		const formItemLayout = {
			labelCol: {span: 6},
			wrapperCol: {span: 18},
		};

		const BtnGroup = this.state.isSmsSended
			?
			<Button size="large" type="primary" htmlType="button" className="btn-sendCode" block
			        ghost>重新发送{this.state.count}s</Button>
			:
			<Button size="large" type="primary" htmlType="button" className="btn-sendCode" block
			        disabled={getFieldError('mobile') || !this.props.form.getFieldValue('mobile')}
			        ghost onClick={this.SendSmsCodeFun.bind(this)}>{this.state.tipText}</Button>;

		return (
			<Layout title="账号绑定" className="login-layout login-layout-bg">
				<section className="login-content">
					<p className="login-bind-title">账号绑定</p>
					<Form onSubmit={this.handleSubmit} className="login-bind-form" hideRequiredMark={true}>
						<FormItem label="手机号"  {...formItemLayout} colon={false}>
							{getFieldDecorator('mobile', {
								rules: [
									{required: true, message: '请输入您的手机号码'},
									{validator: validatePhone}
								],
							})(
								<Input size="large" placeholder="请输入手机号" />
							)}
						</FormItem>
						<FormItem label="输入密码" {...formItemLayout} colon={false}>
							{getFieldDecorator('password', {
								rules: [{required: true, message: '请输入密码!'}],
							})(
								<Input size="large" type="password" placeholder="请输入登录密码" />
							)}
						</FormItem>
						<FormItem label="短信验证码" {...formItemLayout} colon={false}>
							<Row gutter={10}>
								<Col span={14}>
									{getFieldDecorator('verifyCode', {
										rules: [{required: true, message: '请输入短信验证码!'}],
									})(
										<Input size="large" type="text" placeholder="请输入短信验证码" />
									)}
								</Col>
								<Col span={10}>
									{BtnGroup}
								</Col>
							</Row>
						</FormItem>
						<FormItem className="text-center">
							<Row>
								<Col span={6} />
								<Col span={18}>
									<Button size="large" block type="primary" htmlType="submit" className="bind-form-submit">绑定</Button>
								</Col>
							</Row>
							<Row>
								<Col span={6} />
								<Col span={18}>
									<h5 className="text-center mt2"><a href="" className="text-primary">没有账号?请注册</a></h5>
								</Col>
							</Row>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

export default BindPhone = Form.create()(BindPhone);
