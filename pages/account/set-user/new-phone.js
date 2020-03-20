// 账户设置
import React from 'react'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Form, Button, Input, message, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {checkPhone} from 'config/regular'
import cookie from 'react-cookies';
import {sendSmsCode, validateSmsCode, registerFun, updateMobileFun, phoneValidate} from 'server'
import './style.less'

const FormItem = Form.Item;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class NewPhone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isShowSend: false,
			codeTip: '发送验证码',
			count: '60',
			oldMobile: '',// this.props.match.params.mobile,
			sellerUser: true,
			tipModal: false,
		}
	}

	/*---手机号----*/
	grPhone = (rule, value, callback) => {
		if (value && isNaN(value)) {
			this.props.form.setFields({
				userPhone: {
					value: value.replace(/\D/g, ''),
					errors: [new Error('请输入正确的手机号码')],
				},
			});
		} else if (value && !checkPhone(value)) {
			callback('请输入正确的手机号码');
		} else if (value === this.props.router.query.oldMobile) {
			callback('该账号已被使用')
		} else {
			callback();
		}
	};

	/*---验证码---*/
	codeBtn() {
		const form = this.props.form;
		let phoneVal = form.getFieldValue('userPhone');
		let userCode = form.getFieldValue('userCode');
		let params = {
			mobile: phoneVal
		};
		/*---是否被注册---*/
		phoneValidate(params).then(res => {
			if (res.result === 'success') {
				this.sendSmsCodeInfo();
			} else {
				if (res.result === 'error' && res.data) {
					form.setFields({
						userPhone: {
							value: phoneVal,
							errors: [new Error('您已注册请直接登录')],
						},
					});
				} else if (res.result === 'error' && !res.data) {
					this.setState({
						tipModal: true
					});
				}

			}
		});
	}

	sendSmsCodeInfo = () => {
		const form = this.props.form;
		let phoneVal = form.getFieldValue('userPhone');
		let params = {
			mobile: phoneVal
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
	replacePhone = () => {
		this.setState({
			tipModal: false
		}, () => {
			this.sendSmsCodeInfo();
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
	/*------表单提交------*/
	handleSubmit = (e) => {
		e.preventDefault();
		const form = this.props.form;
		// const {oldMobile} = this.state;
		const oldMobile = this.props.router.query.mobile;
		let mobile = form.getFieldValue('userPhone');
		let userCode = form.getFieldValue('userCode');
		let data = {
			mobile: mobile,
			verifyCode: userCode
		};
		this.props.form.validateFields((err, values) => {
			if (!err) {
				/*-----验证码校验----*/
				validateSmsCode(data).then(res => {
					if (res.result === 'success') {
						/*---提交表单---*/
						let params = {
							mobile: mobile,
							oldMobile: oldMobile,
						};
						updateMobileFun(params).then(res => {
							if (res.result === 'success') {
								Router.push('/account/set-user/makeover-phone')
								// this.props.history.push(`/makePhone`)
							} else {
								message.error(res.msg);
							}
						})
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
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
		const {phoneVal, imgUrl} = this.state;
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
			<Layout title="设置新手机号" mainMenuIndex={'setting'} menuIndex={'3'}>
				<section className="bg-white p4" style={{height: '766px'}}>
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							更改手机号
						</h1>
					</Row>
					<Row>
						<Col span={18} offset={3}>
							<Steps current={1} className="mt3 settingStep">
								<Step title="手机号验证" status="process" />
								<Step title="输入新手机号" />
								<Step title="完成" />
							</Steps>
						</Col>
					</Row>
					<Form onSubmit={this.handleSubmit} style={{width: '510px', margin: '98px auto 0'}} className="myForm">
						<FormItem
							{...formItemLayout}
							label="手机号码"
						>
							{getFieldDecorator('userPhone', {
								rules: [
									{required: true, message: '请输入11位新的手机号'},
									{validator: this.grPhone}
								]
							})(
								<Input placeholder="请输入11位新的手机号" size="large" maxLength={11} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="短信验证码"
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
											? <Button size="large" type="primary" htmlType="button" block className="h5" ghost
											          style={{height: '50px'}}>{this.state.count}s</Button>
											: <Button size="large" type="primary" htmlType="button" block className="h5"
											          disabled={getFieldError('userPhone') || !this.props.form.getFieldValue('userPhone')}
											          ghost onClick={this.codeBtn.bind(this)} style={{height: '50px'}}>{this.state.codeTip}</Button>
									}
								</Col>
							</Row>
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '118px'}} className="mt2">
								<Button type="primary" size="large" htmlType="submit" block className="bg-primary-linear border-radius" style={{height: '50px'}}>提交</Button>
							</div>
						</FormItem>
					</Form>
				</section>
				<Modal visible={this.state.tipModal}
				       okText='暂不更换'
				       cancelText='更换'
				       closable={false}
				       onOk={this.replacePhone}
				       onCancel={() => this.setState({tipModal: false})}
				       centered={true}
				       className="tipModal"
				>
					<h3 className="text-center prl4">该手机号已注册为商家,注册为买家用户后</h3>
					<h3 className="text-center prl4 mt3">将不能发布询价,建议您更换手机号注册</h3>
				</Modal>
			</Layout>
		)
	}
}

const NewPhoneForm = Form.create()(NewPhone);
export default withRouter(NewPhoneForm)
