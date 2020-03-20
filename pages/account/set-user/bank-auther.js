// 个人(银行卡)认证
import React from 'react'
import {withRouter} from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Form, Button, Input} from 'antd';
import {iconUrl} from 'config/evn'
import cookie from 'react-cookies'
import {checkIDNum, checkBank} from 'config/regular'
import {threeElementVerifyFun} from 'server'
import './style.less'

const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});


class BankAuther extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null
		}
	}

	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};
	/*-------表单提交---*/
	handleSubmit = (e) => {
		e.preventDefault();
		const form = this.props.form;
		const {userCode} = this.state;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					userCode: userCode,
					name: values.userName,
					idNumber: values.creditCode,
					bankCard: values.bankCard,
				};
				/*----校验银行卡校验----*/
				threeElementVerifyFun(data).then(res => {
					if (res.result === 'success') {
						this.props.history.push(`/makePersonal`);
					} else {
						if (res.msg === '身份证格式错误，请填写正确的身份证号') {
							this.props.form.setFields({
								creditCode: {
									value: values.creditCode,
									errors: [new Error('身份证格式错误，请填写正确的身份证号')],
								},
							});
						} else if (res.msg === '银行卡号格式错误,请填写正确银行卡号') {
							this.props.form.setFields({
								bankCard: {
									value: values.bankCard,
									errors: [new Error('银行卡号格式错误,请填写正确银行卡号')],
								},
							});
						} else if (res.msg === '实名信息不一致，请检查后重新认证。') {
							this.props.form.setFields({
								userName: {
									value: values.userName,
									errors: [new Error('实名信息不一致，请检查后重新认证。')],
								},
							});
						}
					}
				})
			}
		});
	};
	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};
	bankPhone = (rule, value, callback) => {
		const form = this.props.form;
		if (value && !checkBank(value)) {
			callback('请输入正确的对公银行账号');
		} else {
			callback();
		}
	};

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
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
			<Layout mainMenuIndex={'setting'} menuIndex={'5'} title="个人认证-银行卡认证">
				<section className="bg-white" style={{paddingTop: '40px', height: '766px'}}>
					<p style={{paddingLeft: '80px'}} className="h1 text-grey">个人认证</p>
					<Form style={{width: '540px', margin: 'auto'}} className="mt4 myForm" onSubmit={this.handleSubmit}>
						<FormItem
							{...formItemLayout}
							label="真实姓名"
						>
							{getFieldDecorator('userName', {
								rules: [{
									required: true, message: '请输入您的真实姓名',
								}, {validator: this.userName}],
								//validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入您的真实姓名" size="large" style={{width: '300px'}} maxLength={25} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="身份证号码"
						>
							{getFieldDecorator('creditCode', {
								rules: [
									{required: true, message: '请输入身份证号码',}
									, {validator: checkIDNum}],
								//validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入您本人有效的18位身份证号码" size="large" style={{width: '300px'}} maxLength={18} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="银行卡"
						>
							{getFieldDecorator('bankCard', {
								rules: [
									{required: true, message: '请输入您的银行卡卡号'},
									{validator: this.bankPhone}],
								//validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入您的银行卡号" size="large" style={{width: '300px'}} maxLength={19} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '136px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="h3" style={{height: '50px'}}>提交</Button>
							</div>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const BankAutherForm = Form.create()(BankAuther);
export default BankAutherForm
