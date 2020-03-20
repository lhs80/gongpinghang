// 账户设置-设置新密码
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {withRouter} from 'next/router'
import {Icon, Row, Steps, Col, Form, Button, Input} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {checkPhone, checkRepeat} from 'config/regular'
import {sendSmsCode, validateSmsCode, modifyAccountFun} from 'server'
import md5 from 'blueimp-md5'
import './style.less'

const FormItem = Form.Item;
const {Content} = Layout;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class NewPassWord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmDirty: false,
			phoneVal: this.props.router.query.phone//this.props.match.params.phone
		};
	}

	checkPassword = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('password')) {
			callback('两次密码输入不一致，请重新输入!');
		} else {
			callback();
		}
	};
	checkConfirm = (rule, value, callback) => {
		const form = this.props.form;
		const phoneVal = this.props.router.query.phone;
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 6) {
				callback('请输入6~20位密码，可以为数字、字母或符号')
			}
			//校验数字是否递增或者递减
			if (value.length >= 6 && checkRepeat(value)) {
				callback('密码强度较弱，请重新设置');
				return;
			}
			if (value.length >= 6 && value === phoneVal) {
				callback('密码不能和登录账号完全一致');
			}
			if (this.state.confirmDirty) {
				form.validateFields(['confirm'], {force: true});
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('密码格式不正确')
		}
		callback();
	};
	handleConfirmBlur = (e) => {
		const value = e.target.value;
		this.setState({confirmDirty: this.state.confirmDirty || !!value});
	}

	/*-------注册完成----*/
	handleSubmit(e) {
		const {phoneVal} = this.state;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let params = {
				mobile: this.props.router.query.phone,
				password: md5(values.password),
			};
			if (!err) {
				modifyAccountFun(params).then(res => {
					if (res.result === 'success') {
						// this.props.history.push(`/makePassWord`);
						Router.push('/account/set-user/makeover-passWord')
					}
				});
			}
		});
	}

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
			<Layout title="设置新密码" mainMenuIndex={'setting'} menuIndex={'4'}>
				<section className="bg-white p4" style={{height: '766px'}}>
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							修改密码
						</h1>
					</Row>
					<Row>
						<Col span={18} offset={3}>
							<Steps current={1} className="mt3 settingStep">
								<Step title="手机号验证" status="process" />
								<Step title="设置新密码" />
								<Step title="完成" />
							</Steps>
						</Col>
					</Row>
					<Form onSubmit={this.handleSubmit.bind(this)} style={{width: '516px', margin: '98px auto 0'}} className=" myForm">
						<FormItem
							{...formItemLayout}
							label="设置密码"
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
							label="确认密码"
						>
							{getFieldDecorator('confirm', {
								rules: [{
									required: true, message: '再次输入密码'
								}, {
									validator: this.checkPassword,
								}],
							})(
								<Input type="password" placeholder="请再次输入密码" size="large" maxLength="20" onBlur={this.handleConfirmBlur} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '130px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="bg-primary-linear border-radius" style={{height: '50px'}}>完成</Button>
							</div>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const NewPassWordForm = Form.create()(NewPassWord);
export default withRouter(NewPassWordForm)
