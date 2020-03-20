// 深度认证第一步
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Form, Button, Input, Upload, Modal} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {picUploadFun, autherInfoFun, userCodeFun, companyNameRegisterFun} from 'server'
import {validateBlank, validateCredit} from 'config/regular'
import './style.less'

const FormItem = Form.Item;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DepthAuther extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			imageUrl: '',
			//headImgUrl: '',
			headImgUrl: '',
			previewVisible: false,
			previewImage: '',
			fileList: [],
			//isAuthCom: this.props.match.params.id,
			isAuthCom: '',
			isAuthPri: '',
			companyNick: false,
			cridetDisable: false,
			businessLicense: false,
			bankNum: '',
			companyName: '',
			cridetNum: '',
			bankNick: '',
			bankBranch: '',
			flag: 0,//1初级2深度失败法人3深度认证代理人
		};
		this.beforeUpload = this.beforeUpload.bind(this);
	}

	componentDidMount() {
		const {userCode} = this.state;
		this.getUserInfo();
		let depthStep = cookie.load(userCode + 'depthStep1');
		if (depthStep) {
			this.setState({
				headImgUrl: depthStep.licenseImageUrl,
				bankNum: depthStep.bank_id,
				companyName: depthStep.company_name,
				cridetNum: depthStep.license_no,
				bankNick: depthStep.bank_name,
				bankBranch: depthStep.subbranch_name
			})
		} else {
			/*----初级认证获取信息----*/
			this.getAutherInfoFun();
		}
	}

	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	/*----营业执照上传-----*/
	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	beforeUpload(file) {
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		/*return isLt2M;*/
		this.getBase64(file, (imageUrl) => {
			this.setState({
				imageUrl,
				loading: false
			});
			if (imageUrl) {
				let u = imageUrl.substring(imageUrl.indexOf(',') + 1, imageUrl.length);
				/*--提交图片---*/
				let params = {
					file: imageUrl,
					type: 'auther'
				};
				picUploadFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							imageUrl: baseUrl + res.msg,
							headImgUrl: baseUrl + res.msg,
						});
					}
				});
			}
		});
	}

	/*---图片上传成功---*/
	handleChange = ({fileList}) => this.setState({fileList});
	/*-------表单提交---*/
	handleSubmit = (e) => {
		const {fileList, headImgUrl} = this.state;
		let userCode = this.state.userCode;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let depthStep1 = {
					company_name: values.companyName,
					license_no: values.cridetCard,
					licenseImageUrl: headImgUrl,
					bank_name: values.bankName,
					bank_id: values.bankNum,
					subbranch_name: values.bankBranch,
				};
				cookie.save(userCode + 'depthStep1', depthStep1);
				this.props.history.push(`/depthAuthert`)
			}
		});
	};
	checkDepthCompanyName = (rule, value, callback) => {
		if (value && value.indexOf(' ') === -1 && value.length >= 6 && !this.state.companyName) {
			companyNameRegisterFun(value).then(res => {
				if (res.result === 'success') {
					if (res.data == null) {
						callback();
					} else if (res.data.isAuthCom === 1 || res.data.isAuthCom === 2) {
						/*-----初级高级认证成功-----*/
						callback('该公司已经认证，不可重复认证');
					} else if (res.data.isAuthCom === 3 || res.data.isAuthCom === 4) {
						/*---初级高级认证失败----*/
						callback();
					} else {
						/*----认证中----*/
						callback('该公司正在认证审核中');
					}
				}
			});
		} else if (value && value.length < 6) {
			callback('公司名称长度为6-25个字符');
		} else if (value && value.indexOf(' ') !== -1) {
			callback('企业名称格式不正确')
		}
		else {
			callback();
		}
	}

	getAutherInfoFun = () => {
		autherInfoFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					companyName: res.data.companyName,
					cridetNum: res.data.licenseNo,
					headImgUrl: res.data.licenseImageUrl,
					bankNum: res.data.bankId,
					bankNick: res.data.bankName,
					bankBranch: res.data.subbranchName
				})
			}
		})
	};

	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (Number(res.data.isAuthPri) === 1) {
				this.setState({
					companyNick: true,
					cridetDisable: true,
				})
			}
			this.setState({
				isAuthPri: res.data.isAuthPri,
				isAuthCom: res.data.isAuthCom,
			})
		})
	}

	render() {
		const {getFieldDecorator} = this.props.form;
		const {
			imageUrl, companyNick, cridetDisable, headImgUrl, businessLicense, bankNum, companyName,
			cridetNum, bankNick, bankBranch
		} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 11},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 13},
			},
		};
		return (

			<Layout title="深度认证">
				<section className="bg-white" style={{height: '974px', paddingTop: '40px'}}>
					<Row style={{paddingLeft: '80px'}}>
						<h1 className="h0">
							企业深度认证
						</h1>
					</Row>
					<Row style={{paddingRight: '70px'}}>
						<Col span={21} offset={2}>
							<Steps current={0} className="mt3 settingStep">
								<Step title="填写企业信息" />
								<Step title="完善管理人信息" />
								<Step title="提交信息待审核" />
								<Step title="等待收款，回填金额" />
								<Step title="完成认证" />
							</Steps>
						</Col>
					</Row>
					<Form onSubmit={this.handleSubmit} style={{width: '554px', margin: 'auto'}} className="mt5 myForm depthFormFirst">
						<FormItem
							{...formItemLayout}
							label="企业名称"
						>
							{getFieldDecorator('companyName', {
								initialValue: companyName,
								rules: [
									{required: true, message: '请输入企业名称'},
									{validator: this.checkDepthCompanyName}
								],
								validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入企业名称" size="large" disabled={companyNick} maxLength={25} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="营业执照注册号/统一社会信用代码"
						>
							{getFieldDecorator('cridetCard', {
								initialValue: cridetNum,
								rules: [{required: true, message: '营业执照注册号/统一社会信用代码'},
									{validator: validateCredit}],
								//validateTrigger: ['onBlur']
							})(
								<Input type="text" placeholder="请输入18位信用代码" size="large" disabled={cridetDisable} maxLength={18} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="营业执照/多合一营业执照"
							className="businessLicence"
						>
							{getFieldDecorator('businessLicence', {
								initialValue: headImgUrl,
								rules: [{required: true, message: '请上传多合一营业执照'},
								],
							})(
								<div>
									<Upload
										className="avatar-uploader"
										name="avatar"
										showUploadList={false}
										action=""
										beforeUpload={this.beforeUpload}
										onChange={this.handleChange}
									>
										{
											headImgUrl ?
												<img src={headImgUrl} alt="" className="avatarAuther" /> :
												<div className="autherPic text-center">
													<Icon type="plus" className="avatar-uploader-trigger large mt2" />
													<p className="mt1">点击上传</p>
												</div>
										}
									</Upload>
									<div className="show authDescript">
										<p style={{color: '#316ccb', cursor: 'pointer'}} className="mt2"
										   onClick={() => this.setState({businessLicense: true})}>查看示例</p>
										<p className="h6">组织机构等非企业单位，请上传登记执照支持.jpg .jpeg .png格式，大小不超过4M</p>
									</div>
								</div>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="对公银行账号"
						>
							{getFieldDecorator('bankNum', {
								initialValue: bankNum,
								rules: [
									{required: true, message: '对公银行账号不能为空'},
									{validator: validateBlank}],
							})(
								<Input type="text" placeholder="请填写对公银行账号" size="large" maxLength={30} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="对公银行名称"
						>
							{getFieldDecorator('bankName', {
								initialValue: bankNick,
								rules: [
									{required: true, message: '银行名称不能为空'},
									{validator: validateBlank}],
							})(
								<Input type="text" placeholder="如：中国建设银行" size="large" maxLength={40} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="对公开户支行"
						>
							{getFieldDecorator('bankBranch', {
								initialValue: bankBranch,
								rules: [
									{required: true, message: '开户支行不能为空'},
									{validator: validateBlank}],
							})(
								<Input type="text" placeholder="请填写完整的开户支行如：深圳高新园支行" size="large" maxLength={40} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '254px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="h3 mt3" style={{height: '50px'}}>完成</Button>
							</div>
						</FormItem>
					</Form>
					<Modal visible={businessLicense}
					       okText='确认'
					       centered
					       onCancel={() => {
						       this.setState({businessLicense: false})
					       }}
					       className="seacrhExample"
					>
						<div className="text-center">
							<img src="images/businessLicense.png" alt="" />
						</div>
					</Modal>
				</section>
			</Layout>
		)
	}
}

const DepthAutherForm = Form.create()(DepthAuther);
export default DepthAutherForm
