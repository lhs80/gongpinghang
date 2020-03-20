// 账户设置
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Form, Button, Input, Avatar, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {sendSmsCode, validateSmsCode, registerFun, userCodeFun} from 'server'
import './style.less'

const FormItem = Form.Item;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ChangePassWord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			phoneVal: '',
			phone: '',
			imgUrl: '',
			isShowSend: false,
			codeTip: '发送验证码',
			count: '60'
		}
	}

	componentDidMount() {
		this.getUserInfo();
	}

	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};
	getUserInfo = () => {
		let params = {
			userCode: this.state.userCode
		}
		/*----获取用户的手机号码-头像---*/
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				let mobile = res.data.mobile;
				let len = mobile.length;
				let mobileVal = mobile.substring(0, 3) + '******' + mobile.substring(len - 2, len);
				this.setState({
					phone: mobile,
					phoneVal: mobileVal,
					imgUrl: res.data.headUrl,
				})
			}
		})
	};
	/*-------表单提交---*/
	handleSubmit = (e) => {
		const {phone} = this.state;
		e.preventDefault();
		const form = this.props.form;
		let userCode = form.getFieldValue('userCode');
		let data = {
			mobile: phone,
			verifyCode: userCode
		};
		this.props.form.validateFields((err, values) => {
			if (!err) {
				/*-----验证码校验----*/
				validateSmsCode(data).then(res => {
					if (res.result === 'success') {
						/*---提交表单---*/
						Router.push({pathname: '/account/set-user/new-passWord', query: {phone: phone}});
						// this.props.history.push(`/newPassWord/${phone}`);
					} else {
						form.setFields({
							userCode: {
								value: values.userCode,
								errors: [new Error(res.msg)],
							},
						});
					}
				});
			}
		});
	};

	/*---发送验证码---*/
	codeBtn() {
		let params = {
			mobile: this.state.phone
		};
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
	}

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
		const {getFieldDecorator} = this.props.form;
		const {phoneVal, imgUrl} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 8},
			},
			wrapperCol: {
				xs: {span: 16},
			},
		};
		return (
			<Layout title="更改密码" menuIndex={'4'} mainMenuIndex="setting">
				<section className="bg-white p4" style={{height: '766px'}}>
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							修改密码
						</h1>
					</Row>
					<Row>
						<Col span={18} offset={3}>
							<Steps current={0} className="mt3 settingStep">
								<Step title="手机号验证" />
								<Step title="设置新密码" />
								<Step title="完成" />
							</Steps>
						</Col>
					</Row>
					<section className="text-center mt6">
                                <span className="show setUser">
                                    {
	                                    imgUrl ?
		                                    <Avatar src={baseUrl + imgUrl} size={100} />
		                                    :
		                                    <Avatar src="/static/images/default-header.png" size={100} />
                                    }
                                </span>
						<h2 className="mt2 h0">{phoneVal}</h2>
					</section>
					<Form onSubmit={this.handleSubmit} style={{width: '440px', margin: 'auto'}} className="mt4 myForm">
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
											? <Button size="large" type="primary" htmlType="button" block className="h5" ghost disabled
											          style={{height: '50px'}}>{this.state.count}s</Button>
											: <Button size="large" type="primary" htmlType="button" block className="h5"
											          ghost onClick={this.codeBtn.bind(this)} style={{height: '50px'}}>{this.state.codeTip}</Button>
									}
								</Col>
							</Row>
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '118px'}} className="mt2">
								<Button type="primary" size="large" htmlType="submit" block className="bg-primary-linear border-radius" style={{height: '50px'}}>下一步</Button>
							</div>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const ChangePassWordForm = Form.create()(ChangePassWord);
export default ChangePassWordForm
