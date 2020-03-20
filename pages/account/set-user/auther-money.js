// 深度认证填写金额
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Form, Button, Input, Upload, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {checkMoneyFun} from 'server'
import './style.less'

const FormItem = Form.Item;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class AutherMoney extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			imageUrl: '',
			headImgUrl: '',
			previewVisible: false,
			previewImage: '',
			fileList: [],
			mobile: ''
		};
	}

	/*-----表单提交-----*/
	handleSubmit = (e) => {
		e.preventDefault();
		const form = this.props.form;
		const {userCode} = this.state;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				/*-----判断对公打款的金额是否正确-----*/
				let money = values.bankMoney;
				checkMoneyFun(userCode, money).then(res => {
					if (res.result === 'success') {
						this.props.history.push(`/depthAuthComOver/success`)
					} else {
						if (res.result === 'error') {
							let verifyCount = res.data ? res.data.verifyCount : null;
							if (verifyCount && verifyCount > 0) {
								form.setFields({
									bankMoney: {
										value: values.bankMoney,
										errors: [new Error('打款金额验证失败,您还剩余' + verifyCount + '次机会')],
									},
								});
							} else {
								this.props.history.push(`/depthAuthComOver/error`)
							}
						}
					}
				})
			}
		});
	};
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	render() {
		const {getFieldDecorator} = this.props.form;
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
			<Layout title="等待收款，回填金额" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white" style={{height: '899px', paddingTop: '40px'}}>
					<Row style={{paddingLeft: '70px'}}>
						<h1 className="h0">
							企业深度认证
						</h1>
					</Row>
					<Row style={{paddingRight: '70px'}}>
						<Col span={21} offset={2}>
							<Steps current={3} className="mt3 settingStep">
								<Step title="填写企业信息" status="process" />
								<Step title="完善管理人信息" status="process" />
								<Step title="提交信息待审核" status="process" />
								<Step title="等待收款，回填金额" />
								<Step title="完成认证" />
							</Steps>
						</Col>
					</Row>
					<section style={{width: '490px', margin: '108px auto 0'}}>
						<Form onSubmit={this.handleSubmit} style={{width: '400px', margin: 'auto'}} className="mt4 depthForm">
							<FormItem
								{...formItemLayout}
								label="到账金额"
							>
								{getFieldDecorator('bankMoney', {
									rules: [{
										required: true, message: '请输入对公账户收到的金额',
									}],
								})(
									<Input type="text" placeholder="请输入对公账户收到的金额" size="large" style={{height: '50px'}} />
								)}
							</FormItem>
							<FormItem>
								<div style={{width: '300px', marginLeft: '102px'}} className="mt5">
									<Button type="primary" size="large" htmlType="submit" block className="h3" style={{height: '50px'}}>确认</Button>
								</div>
							</FormItem>
						</Form>
					</section>
				</section>
			</Layout>
		)
	}
}

const AutherMoneyForm = Form.create()(AutherMoney);
export default AutherMoneyForm
