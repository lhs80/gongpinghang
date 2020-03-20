//我的收益申请提现
import React from 'react'
import Layout from 'components/Layout/account'
import {Button, Icon, Select, Form, Input} from 'antd';
import {checkBank} from 'config/regular'
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, applicationCashFun} from 'server'
import cookie from 'react-cookies'

const FormItem = Form.Item;
const {Option} = Select;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ApplicationCashForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			userName: '',
			money: 0,
			successTip: 'none',
			errorTip: 'none',
			errorTipText: '',
			disabled: false
		}
	}

	componentDidMount() {
		this.getCurCash();
	}

	/*-----银行卡校验----*/
	bankCardNum = (rule, value, callback) => {
		const form = this.props.form;
		if (value && !checkBank(value)) {
			callback('请输入正确的借记卡卡号');
		}
		callback();
	};
	/*----提现金额校验-----*/
	cashCheck = (rule, value, callback) => {
		if (value && value < 50) {
			callback('提现金额需大于等于50')
		} else if (value && isNaN(value)) {
			//callback("提现金额必须是数字")
			this.props.form.setFields({
				cash: {
					value: value.replace(/\D/g, ''),
				},
			});
		} else if (value && !(/^\d+$/.test(value))) {
			this.props.form.setFields({
				cash: {
					value: value.replace(/\D/g, ''),
				},
			});
		} else if (value > this.state.money) {
			this.props.form.setFields({
				cash: {
					value: this.state.money,
				},
			});
		}
		callback()
	};
	/*-----表单提交----*/
	handleSubmit = (e) => {
		e.preventDefault();
		let self = this;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					bankName: values.openBank,
					money: values.cash,
					userCode: this.userCode,
					name: this.state.userName,
					subbranchName: values.bankBranch,
					bankId: values.bankCard
				};
				applicationCashFun(params).then(res => {
					if (res.result === 'success') {
						self.setState({
							disabled: true,
							successTip: 'block'
						});
						let timer = setTimeout(() => {
							self.setState({
								successTip: 'none'
							}, () => {
								self.props.history.push(`/myIncomeCash`)
							});
						}, 3000);
					} else {
						self.setState({
							errorTip: 'block',
							errorTipText: res.msg
						});
						let timer = setTimeout(() => {
							self.setState({
								errorTip: 'none'
							});
						}, 3000);
					}
				})
			}
		});
	};
	/*------获取当前金额-----*/
	getCurCash = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					userName: res.data.certificationName,
					money: parseInt(res.data.money)
				}, () => {
					if (this.state.money < 50) {
						window.location.href = `/`
					}
				})
			}
		})
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {userName, money, errorTipText, disabled} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 6},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 18},
			},
		};
		return (
			<Layout title="我的收益-申请提现" mainMenuIndex={'home'} menuIndex={'7'}>
				<section className="bg-white p3">
					<p className="applicationTip h0 text-grey mt6">申请提现</p>
					<Form style={{width: '400px', margin: 'auto'}} className="mt3 applicationCash" onSubmit={this.handleSubmit}>
						<FormItem
							{...formItemLayout}
							label="当前现金金额"
						>
							{getFieldDecorator('curCash', {})(
								<p className="h5 text-muted"><span className="large text-grey">{money}</span>元</p>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="提现金额"
						>
							{getFieldDecorator('cash', {
								initialValue: money,
								//validateTrigger: ['onBlur'],
								rules: [
									{required: true, message: '提现金额不小于50元'},
									{validator: this.cashCheck}
								]
							})(
								<Input placeholder="提现金额不小于50元" size="large" style={{height: '50px'}} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="开户人姓名"
						>
							{getFieldDecorator('userName', {})(
								<p className="h5 text-grey" style={{lineHeight: '50px', marginBottom: '0', paddingLeft: '20px'}}>
									{userName}
								</p>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="提现开户行"
						>
							{getFieldDecorator('openBank', {
								rules: [
									{required: true, message: '请选择'},
								],
							})(
								<Select placeholder="请选择" className="openBank" size="large">
									<Option value="中国银行">中国银行</Option>
									<Option value="中国工商银行">中国工商银行</Option>
									<Option value="中国农业银行">中国农业银行</Option>
									<Option value="中国建设银行">中国建设银行</Option>
									<Option value="交通银行">交通银行</Option>
									<Option value="招商银行">招商银行</Option>
									<Option value="中信银行">中信银行</Option>
									<Option value="中国民生银行">中国民生银行</Option>
									<Option value="兴业银行">兴业银行</Option>
									<Option value="江苏银行">江苏银行</Option>
								</Select>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="开户支行"
						>
							{getFieldDecorator('bankBranch', {
								rules: [
									{required: true, message: '请填写您的开户支行'},
								]
							})(
								<Input placeholder="请填写您的开户支行" size="large" style={{height: '50px'}} maxLength={30} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="银行卡号"
						>
							{getFieldDecorator('bankCard', {
								validateTrigger: ['onBlur'],
								rules: [
									{required: true, message: '请填写您的借记卡卡号'},
									{validator: this.bankCardNum}
								]
							})(
								<Input placeholder="请填写您的借记卡卡号" size="large" style={{height: '50px'}}
								       maxLength={19} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '100px', marginBottom: '30px'}}>
								<Button type="primary" size="large" htmlType="submit" block
								        className="bg-primary-linear border-radius" style={{height: '50px'}} disabled={disabled}>
									提交申请
								</Button>
							</div>
						</FormItem>
					</Form>
					<p className="successTip resultTip" style={{display: this.state.successTip}}>提交成功！请等候2-3工作日平台处理</p>
					<p className="resultTip applicationErrorTip" style={{display: this.state.errorTip}}>{errorTipText}</p>
				</section>
			</Layout>
		)
	}
}

const ApplicationCash = Form.create()(ApplicationCashForm);
export default ApplicationCash
