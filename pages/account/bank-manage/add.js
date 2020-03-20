/*-----新增收货地址-----*/
import React, {Fragment} from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
// import AddBankCardForCompany from './components/AddCardForCompany'
// import AddBankCardForPerson from './components/AddCardForPerson'
import {Button, Form, message, Modal, Icon, Radio, Divider, Select, Input} from 'antd';
import {iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import {getSqBusinessNoFun, userCodeFun} from 'server'
import {bindCardFun, bindCardSendSmsFun, queryBankDataFun} from 'payApi'
import {validatePhone} from 'config/regular';
import SendSms from 'components/SendSms';

const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

class AddBankCard extends React.Component {
	constructor(props) {
		super(props);
		this.userInfo = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb') : null;
		this.state = {
			companyInfo: {},
			seqNo: '',
			mobile: '',
			isSendSuccess: false
		}
	}

	componentDidMount() {
		this.queryUserInfo();
		this.getBankData()
	}

	/**
	 * 查询用户信息
	 * */
	queryUserInfo() {
		if (this.userInfo.userCode) {
			let params = {
				userCode: this.userInfo.userCode
			};
			userCodeFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						mobile: res.data.mobile
					});
					this.getSqBusinessNo();
				}
			})
		}
	}

	// 获取企业认证信息
	getSqBusinessNo = () => {
		let params = {
			mobile: this.state.mobile
		};
		getSqBusinessNoFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					companyInfo: res.data
				})
			}
		})
	};

	/*-----表单提交----*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				if (this.props.form.getFieldValue('cardType') === '1' || this.state.companyInfo.merchType === 'com')
					this.submitByCompany(values);
				else
					this.submitByPerson(values);
			}
		});
	};

	// 对公账户提交表单---发送绑卡短信验证码
	submitByCompany = (values) => {
		let params = {
			...values,
			bkMerNo: this.state.companyInfo.merchNo,
			cardType: 1,
			userCode: this.userCode
		};
		bindCardSendSmsFun(params).then(res => {
			if (res.result === 'success') {
				Modal.confirm({
					cancelButtonProps: {style: {display: 'none'}},
					title: '提示',
					content:
						<h4>对公账户信息提交成功！请留意打款信息...</h4>,
					okText: '返回',
					icon: <IconFont type="iconfont-wancheng" />,
					onOk: () => {
						Router.replace({pathname: '/account/bank-manage/list'})
					}
				})
			} else {
				this.props.form.setFields({
					cardNo: {
						value: values.cardNo,
						errors: [new Error(res.msg)]
					}
				})
			}
		})
	};

	//个人绑卡发送短信验证码
	sendSmsCode = () => {
		let params = {
			...this.props.form.getFieldsValue(),
			bkMerNo: this.state.companyInfo.merchNo,
			idNo: this.state.companyInfo.legalPersonIdnum,
			cardType: 0,
			custName: this.state.companyInfo.legalPersonName
		};

		bindCardSendSmsFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					seqNo: res.data.seqNo,
					isSendSuccess: true
				});
			} else {
				this.props.form.setFields({
					cardNo: {
						value: this.props.form.getFieldValue('cardNo'),
						errors: [new Error(res.msg)]
					}
				})
			}
		})
	};

	submitByPerson = (values) => {
		let params = {
			...values,
			bkMerNo: this.state.companyInfo.merchNo,
			seqNo: this.state.seqNo,
			userCode: this.userCode
		};

		bindCardFun(params).then(res => {
			if (res.result === 'success') {
				message.success('添加成功！').then(() => Router.push({pathname: '/account/bank-manage/list'}))
			} else {
				if (!msgBox) {
					msgBox = message.error(res.msg, 0.5, () => {
						msgBox = null;
					});
				}
			}
		})
	};

	setSeqNo = (value) => {
		this.setState({
			seqNo: value
		})
	};

	//银行名称数据
	getBankData = () => {
		queryBankDataFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					bankData: res.data
				})
			}
		})
	};

	clearError = () => {
		this.props.form.resetFields();
	};

	render() {
		const {companyInfo, bankData, isSendSuccess} = this.state;
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 6,
				offset: 0,
			},
			wrapperCol: {
				span: 14,
				offset: 0,
			},
		};
		const tips = <div className="text-muted" style={{lineHeight: '20px'}}>
			<p className="mt2">· 点击“提交”后，贵公司该企业银行卡将在24小时之内内收到一笔随机金额用于确认账户的真实性和正确性，请确保您填写无误！</p>
			<p>· 收到短信后，请在“个人中心--账户资料--银行卡管理”页面填写打款金额完成认证</p>
		</div>;
		return (
			<Layout title="新增银行卡" menuIndex={'9'} mainMenuIndex={'setting'}>
				<section className="bg-white p4">
					<div className="h0 mt2 prl2 text-grey">
						<Divider type="vertical" className="bg-primary-linear" style={{height: '30px', width: '4px'}} /> 新增银行卡
					</div>
					<Form {...formItemLayout} className="mt4" onSubmit={this.handleSubmit}>
						{
							companyInfo && companyInfo.merchType !== 'com' ?
								<FormItem label="银行卡类型">
									{getFieldDecorator('cardType', {
										initialValue: '0',
										rules: [
											{required: true, message: '请选择银行卡类型'},
										]
									})(
										<Radio.Group onChange={this.clearError}>
											<Radio value="0">个人银行卡</Radio>
											<Radio value="1">企业对公账户</Radio>
										</Radio.Group>
									)}
								</FormItem>
								:
								null
						}
						{
							this.props.form.getFieldValue('cardType') === '1' || companyInfo.merchType === 'com' ?
								<Fragment>
									<FormItem label="银行开户名">{companyInfo.merchantName || ''}</FormItem>
									<FormItem label="开户银行">
										{getFieldDecorator('bankNo', {
												rules: [
													{required: true, message: '请选择开户银行'},
												]
											}
										)(
											<Select showSearch
											        placeholder="请选择开户银行"
											        size="large"
											        style={{width: '300px'}}
											>
												{
													bankData && bankData.map((bankItem, index) => {
														return <Option value={bankItem.code + '~' + bankItem.value} key={index}>{bankItem.value}</Option>
													})
												}
											</Select>
										)}
									</FormItem>
									<FormItem label="银行账号">
										{getFieldDecorator('cardNo', {
											rules: [
												{required: true, message: '请输入银行账号'},
											]
										})(
											<Input type="text" placeholder="请输入银行账号" size="large" maxLength={30} style={{width: '300px'}} />
										)}
									</FormItem>
									<FormItem wrapperCol={{span: 12, offset: 6}}>{tips}</FormItem>
								</Fragment>
								:
								<Fragment>
									<FormItem label="持卡人姓名(法人)">{companyInfo.legalPersonName || ''}</FormItem>
									<FormItem label="持卡人身份证号(法人)">{companyInfo.legalPersonIdnum || ''}</FormItem>
									<FormItem label="银行卡卡号">
										{getFieldDecorator('cardNo', {
											rules: [
												{required: true, message: '请输入银行卡卡号'},
											]
										})(
											<Input type="text" placeholder="请输入银行卡卡号" size="large" maxLength={20} style={{width: '300px'}} />
										)}
									</FormItem>
									<FormItem label="银行预留手机号">
										{getFieldDecorator('phone', {
											rules: [
												{required: true, message: '请输入银行预留手机号'},
												{validator: validatePhone}
											]
										})(
											<Input type="text" placeholder="请输入银行预留手机号" size="large" maxLength={11} style={{width: '300px'}} />
										)}
									</FormItem>
									<SendSms form={this.props.form} sendSmsCode={this.sendSmsCode} isSendSuccess={isSendSuccess} />
								</Fragment>
						}
						<FormItem className="mt5" wrapperCol={{span: 12, offset: 6}}>
							<Button htmlType="submit" size="large" type="primary" style={{width: '148px'}}>提交</Button>
							<Button htmlType="submit" size="large" type="primary" style={{width: '148px', marginLeft: '4px'}} onClick={() => {
								Router.push('/account/bank-manage/list')
							}}>取消</Button>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const AddBankCardForm = Form.create()(AddBankCard);
export default AddBankCardForm
