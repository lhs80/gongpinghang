// 企业初级认证
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Form, Button, Input, Modal} from 'antd';
import cookie from 'react-cookies'
import {companyNameRegisterFun, primaryCertifyFun} from 'server'
import {iconUrl} from 'config/evn'
import {validateCredit} from 'config/regular'
import './style.less'

const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});


class CompanyPrimary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			firstAuther: 'none',
			visibleSuccess: false,
			visibleError: false
		};
		this.checkCompanyName = this.checkCompanyName.bind(this);
	}

	/*---------校验公司名称是否认证-------*/
	checkCompanyName(rule, value, callback) {
		if (value && value.indexOf(' ') === -1 && value.length >= 6) {
			companyNameRegisterFun(value).then(res => {
				if (res.result === 'success') {
					if (res.data == null) {
						callback();
						this.setState({
							firstAuther: 'none'
						})
					} else if (res.data.isAuthCom === 1 || res.data.isAuthCom === 2) {
						/*-----初级高级认证成功-----*/
						callback('该公司已经认证，不可重复认证');
						this.setState({
							firstAuther: 'block'
						})
					} else if (res.data.isAuthCom === 3 || res.data.isAuthCom === 4) {
						/*---初级高级认证失败----*/
						callback();
						this.setState({
							firstAuther: 'none'
						})
					} else {
						/*----认证中----*/
						callback('该公司正在认证审核中');
						this.setState({
							firstAuther: 'none'
						})
					}
				}
			});
		} else if (value && value.length < 6) {
			callback('公司名称长度为6-25个字符');
		} else if (value && value.indexOf(' ') !== -1) {
			callback('公司名称格式不正确');
		} else {
			callback();
			this.setState({
				firstAuther: 'none'
			})
		}
	};

	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};
	/*----表单提交-----*/
	handleSubmit = (e) => {
		e.preventDefault();
		const {userCode} = this.state;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					userCode: userCode,
					companyName: values.companyName,
					legalName: values.legal,
					licenseNo: values.creditCode
				};
				/*-----企业初级认证提交----*/
				primaryCertifyFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							visibleSuccess: true
						});
					} else {
						this.setState({
							visibleError: true
						});
					}
				});
			}
		});
	};
	/*-----认证成功点击弹窗跳转-----*/
	handleOk = (e) => {
		this.setState({
			visibleSuccess: false,
		});
		this.props.history.push('/companyAuthCom')
	};
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {firstAuther, visibleSuccess, visibleError} = this.state;
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
			<Layout title="企业初级认证" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white" style={{paddingTop: '40px', height: '766px'}}>
					<p style={{paddingLeft: '80px'}} className="h1 text-grey">企业初级认证</p>
					<Form style={{width: '540px', margin: 'auto'}} className="mt4 myForm" onSubmit={this.handleSubmit}>
						<FormItem
							{...formItemLayout}
							label="公司名称"
						>
							{getFieldDecorator('companyName', {
								rules: [{
									required: true, message: '请输入公司名称',
								}, {
									validator: this.checkCompanyName,
								}],
								validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入营业执照上的公司名称" size="large" style={{width: '300px'}} maxLength={25} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="统一社会信用代码"
						>
							{getFieldDecorator('creditCode', {
								rules: [{
									required: true, message: '请输入18位信用代码',
								}, {
									validator: validateCredit,
								}],
								validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入18位信用代码" size="large" style={{width: '300px'}} maxLength={18} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="法定代表人"
						>
							{getFieldDecorator('legal', {
								rules: [
									{required: true, message: '请输入法人姓名'},
									{validator: this.userName}],
								//validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入法人姓名" size="large" style={{width: '300px'}} maxLength={25} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '136px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="h3" style={{height: '50px'}}>提交</Button>
							</div>
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '136px', lineHeight: '20px', display: firstAuther}}>
								如需增加授权人，请填写《企业新增授权人委托书》邮件至zhujiiangshi@civil-data.com,进行添加。详情咨询客服电话：400-893-8990
							</div>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const CompanyPrimaryForm = Form.create()(CompanyPrimary);
export default CompanyPrimaryForm
