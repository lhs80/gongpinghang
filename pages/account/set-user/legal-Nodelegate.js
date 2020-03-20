/*------非法人代表-----*/
// 深度认证第二步
import React from 'react'
import {Icon, Layout, Row, Steps, Col, Form, Button, Input, Upload, Modal, Radio, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {checkIDNum} from 'config/regular'
import {picUploadFun, autherInfoFun, dapthCertifyFun, userCodeFun} from 'server'
import {checkPhone} from 'config/regular'
import './style.less'

const FormItem = Form.Item;


class LegalNDelegate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			imageUrl: '',
			headImgUrl: '',
			previewVisible: false,
			previewImage: '',
			fileList: [],
			/*----代理人图片---*/
			agentUrl: '',
			/*---申请表图片-----*/
			applicationUrl: '',
			mobile: '',
			nameDisable: false,
			submitOk: false,
			holdPic: false,
			IDsides: false,
			isAuthCom: '',
			isAuthPri: '',
			/*----form提交时确认信息----*/
			licenseImageUrl: '',
			companyName: '',
			creditCode: '',
			bankCard: '',
			bankName: '',
			bankBranch: '',
			/*---当前组件的form信息----*/
			legalName: '',
			legalID: '',
			agentName: '',
			agentID: '',
			agentPhone: '',
			flag: 0,//1初级2深度失败法人3深度认证代理人

		};
		this.beforeUpload = this.beforeUpload.bind(this);
	}

	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	/*----法人身份证上传-----*/
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
				let u = imageUrl.substring(imageUrl.indexOf(',') + 1, imageUrl.length)
				/*--提交图片---*/
				let params = {
					file: imageUrl,
					type: 'auther'
				};
				picUploadFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							imageUrl: baseUrl + res.msg,
							headImgUrl: baseUrl + res.msg
						});
					}
				});
			}
		});
	}

	/*----代理人身份证上传------*/
	uploadAgent = (file) => {
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		/*return isLt2M;*/
		this.getBase64(file, (agentUrl) => {
			this.setState({
				agentUrl,
				loading: false
			});
			if (agentUrl) {
				let u = agentUrl.substring(agentUrl.indexOf(',') + 1, agentUrl.length)
				/*--提交图片---*/
				let params = {
					file: agentUrl,
					type: 'auther'
				};
				picUploadFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							agentUrl: baseUrl + res.msg
						});
					}
				});
			}
		});
	}
	/*-----申请表上传-----*/
	uploadApplicationImg = (file) => {
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		/*return isLt2M;*/
		this.getBase64(file, (applicationUrl) => {
			this.setState({
				applicationUrl,
				loading: false
			});
			if (applicationUrl) {
				let u = applicationUrl.substring(applicationUrl.indexOf(',') + 1, applicationUrl.length);
				/*--提交图片---*/
				let params = {
					file: applicationUrl,
					type: 'auther'
				};
				picUploadFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							applicationUrl: baseUrl + res.msg
						});
					}
				});
			}
		});
	}
	/*---图片上传成功---*/
	handleChange = ({fileList}) => this.setState({fileList});
	/*----手机号码校验-----*/
	/*---手机号----*/
	grPhone = (rule, value, callback) => {
		const form = this.props.form;
		if (value && !checkPhone(value)) {
			callback('请输入正确的手机号码');
		} else {
			callback();
		}
	};
	/*-------表单提交---*/
	handleSubmit = (e) => {
		let userCode = this.state.userCode;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = cookie.load(userCode + 'depthStep1');
				this.setState({
					companyName: data.company_name,
					creditCode: data.license_no,
					bankCard: data.bank_id,
					bankName: data.bank_name,
					bankBranch: data.subbranch_name,
					licenseImageUrl: data.licenseImageUrl,
					legalName: values.legalName,
					legalID: values.legalID,
					agentName: values.agentName,
					agentID: values.agentID,
					agentPhone: values.agentPhone,
					submitOk: true
				})
			}
		});
	};
	/*-----提交成功确认弹窗-----*/
	handleOk = () => {
		const {
			imageUrl, headImgUrl, agentUrl, applicationUrl, licenseImageUrl, legalName, legalID, agentName, agentID, agentPhone, bankName, bankCard, bankBranch, companyName
			, creditCode, userCode, isAuthCom
		} = this.state;
		let status = 'add';
		if (isAuthCom === 4) status = 'modify';
		let params = {
			option: status,
			agentImageUrl: agentUrl,//代理人身份证正反面
			authorizationImageUrl: applicationUrl,//企业申请表
			licenseImageUrl: licenseImageUrl,//营业执照
			legalImageUrl: '',//法人手持身份证(没有字段)
			legalIdImageUrl: headImgUrl,//法人正反身份证
			agentInfo: {
				legal_name: legalName,
				legal_id: legalID,
				agent_name: agentName,
				agent_id: agentID,
				agent_mobile: agentPhone,
			},
			bankInfo: {
				bank_name: bankName,
				bank_id: bankCard,
				subbranch_name: bankBranch,
				subbranch_province: '',
				subbranch_city: ''
			},
			companyInfo: {
				email: '',
				company_name: companyName,
				license_no: creditCode,
				resource_id: userCode,
			}
		};
		dapthCertifyFun(params).then(res => {
			if (res.result === 'success') {
				message.success('提交成功');
			}
			if (res.result === 'error') {
				message.error(res.msg);
			}
		})
	};

	/*-----上一步跳回深度认证第一步----*/
	lastStepAuther = () => {
		const form = this.props.form;
		let userCode = this.state.userCode;
		let agentInfo = {
			legalName: form.getFieldValue('legalName'),
			legalID: form.getFieldValue('legalID'),
			legalIDPic: this.state.headImgUrl,
			agentName: form.getFieldValue('agentName'),
			agentID: form.getFieldValue('agentID'),
			agentPhone: form.getFieldValue('agentPhone'),
			agentUrl: this.state.agentUrl,
			applicationImg: this.state.applicationUrl,
		}
		cookie.save(userCode + 'agentInfo', agentInfo)
		this.props.history.push(`/depthAuther`)
	};
	userName = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 1) {
				callback('请输入1-15个字符，限中英文或数字')
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};

	componentDidMount() {
		this.getUserInfo();
		/*----如果初级认证把法人名字写入并不可修改-----*/
		/*----根据userCode获取法人代理人手机号码----*/
		if (cookie.load(this.state.userCode + 'agentInfo')) {
			this.getAgentInfo();
		} else {
			this.getAutherInfoFun();
		}
	}

	getAutherInfoFun = () => {
		autherInfoFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				if (this.state.flag === 1) {
					this.setState({
						nameDisable: true
					})
				}
				this.setState({
					legalName: res.data.legalName,
					legalID: res.data.legalId,
					headImgUrl: res.data.legalIdImageUrl,
					applicationUrl: res.data.authorizationImageUrl,
					agentUrl: res.data.agentImageUrl,
					agentName: res.data.agentName,
					agentID: res.data.agentId,
					agentPhone: res.data.agentMobile,
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
					nameDisable: true
				})
			}
			this.setState({
				mobile: res.data.mobile,
				isAuthCom: res.data.isAuthCom,
				isAuthPri: res.data.isAuthPri
			})
		})
	};
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};
	getAgentInfo = () => {
		let userCode = this.state.userCode;
		let legalInfo = cookie.load(userCode + 'agentInfo');
		if (this.state.isAuthPri === 1) {
			this.setState({
				nameDisable: true
			})
		}
		this.setState({
			legalName: legalInfo ? legalInfo.legalName : '',
			legalID: legalInfo ? legalInfo.legalID : '',
			headImgUrl: legalInfo ? legalInfo.legalIDPic : '',
			agentName: legalInfo ? legalInfo.agentName : '',
			agentID: legalInfo ? legalInfo.agentID : '',
			agentPhone: legalInfo ? legalInfo.agentPhone : '',
			agentUrl: legalInfo ? legalInfo.agentUrl : '',
			applicationUrl: legalInfo ? legalInfo.applicationImg : '',
		})
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {
			headImgUrl, agentUrl, applicationUrl, nameDisable, submitOk, companyName, creditCode, bankName, bankCard, bankBranch,
			legalName, legalID, agentName, agentID, agentPhone, holdPic, IDsides
		} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 16},
			},
		};
		return (
			<div style={{display: this.props.legalNDelegate}}>
				<Form onSubmit={this.handleSubmit} style={{width: '450px', margin: 'auto'}} className="mt4 depthForm">
					<FormItem
						{...formItemLayout}
						label="法定代表人姓名"
					>
						{getFieldDecorator('legalName', {
							initialValue: legalName,
							rules: [{
								required: true, message: '法人姓名不能为空',
							}],
						})(
							<Input type="text" placeholder="请填写营业执照上的公司法定代表人姓名" size="large" disabled={nameDisable} style={{height: '50px'}}
							       maxLength={25} />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="法定代表人身份证号"
					>
						{getFieldDecorator('legalID', {
							initialValue: legalID,
							rules: [
								{required: true, message: '法人身份证号不能为空',},
								{validator: checkIDNum}
							],
						})(
							<Input type="text" placeholder="请填写营业执照上的公司法定代表人身份证" size="large" style={{height: '50px'}} maxLength={18} />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="法定代表人身份证正反面复印件"
						className="businessLicence legalItem"
					>
						{getFieldDecorator('legalIDPic', {
							initialValue: headImgUrl,
							rules: [{required: true, message: '请上传法定代表人身份证正反面复印件'},
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
									<p style={{color: '#316ccb', cursor: 'pointer'}} className="mt2" onClick={() => this.setState({holdPic: true})}>查看示例</p>
									<p className="h6">请将身份证正面和反面复印在一页上支持.jpg .jpeg .png格式，大小不超过2M</p>
								</div>
							</div>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="账号管理人姓名"
					>
						{getFieldDecorator('agentName', {
							initialValue: agentName,
							rules: [
								{required: true, message: '账号管理人姓名不能为空'},
								{validator: this.userName}],
						})(
							<Input type="text" placeholder="请输入账号管理人姓名" size="large" style={{height: '50px'}} maxLength={25} />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="账号管理人身份证号"
					>
						{getFieldDecorator('agentID', {
							initialValue: agentID,
							rules: [{
								required: true, message: '账号管理人身份证号不能为空',
							}],
						})(
							<Input type="text" placeholder="请输入账号管理人身份证号" size="large" style={{height: '50px'}} maxLength={18} />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="账号管理人手机号"
					>
						{getFieldDecorator('agentPhone', {
							initialValue: agentPhone,
							rules: [{
								required: true, message: '账号管理人手机号不能为空',
							},
								{validator: this.grPhone}],
						})(
							<Input type="text" placeholder="请填写账号管理人手机号" size="large" style={{height: '50px'}} maxLength={11} />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="账号管理人身份证正反面复印件或手持身份证照片"
						className="businessLicence legalItem"
					>
						{getFieldDecorator('agentIDPic', {
							initialValue: agentUrl,
							rules: [{required: true, message: '请上传账号管理人身份证正反面复印件或手持身份证照片'},
							],
						})(
							<div>
								<Upload
									className="avatar-uploader"
									name="avatar"
									showUploadList={false}
									action=""
									beforeUpload={this.uploadAgent.bind(this)}
									onChange={this.handleChange}
								>
									{
										agentUrl ?
											<img src={agentUrl} alt="" className="avatarAuther" /> :
											<div className="autherPic text-center">
												<Icon type="plus" className="avatar-uploader-trigger large mt2" />
												<p className="mt1">点击上传</p>
											</div>
									}
								</Upload>
								<div className="show authDescript">
									<p style={{color: '#316ccb', cursor: 'pointer'}} className="mt2" onClick={() => this.setState({IDsides: true})}>查看示例</p>
									<p className="h6">请将身份证正面和反面复印在一页上支持.jpg .jpeg .png格式，大小不超过2M</p>
								</div>
							</div>
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="按要求上传申请表"
						className="businessLicence"
					>
						{getFieldDecorator('applicationImg', {
							initialValue: applicationUrl,
							rules: [{required: true, message: '请上传申请表'},
							],
						})(
							<div>
								<Upload
									className="avatar-uploader"
									name="avatar"
									showUploadList={false}
									action=""
									beforeUpload={this.uploadApplicationImg.bind(this)}
									onChange={this.handleChange}
								>
									{
										applicationUrl ?
											<img src={applicationUrl} alt="" className="avatarAuther" /> :
											<div className="autherPic text-center">
												<Icon type="plus" className="avatar-uploader-trigger large mt2" />
												<p className="mt1">点击上传</p>
											</div>
									}
								</Upload>
								<div className="show authDescript">
									<p className="h6 text-muted mt1" style={{marginBottom: '0px'}}>步骤一：请点此下载
										<a href="http://www.civil-data.com/app/uploadImg/attachment/《企业认证申请表》.docx" style={{color: '#316ccb'}}>
											《企业认证申请表》</a>；
									</p>
									<p className="h6 text-muted">步骤二:账户管理人签字，并加盖企业公章后上传支持.jpg .jpeg .png格式，大小不超过4M</p>
								</div>
							</div>
						)}
					</FormItem>
					<FormItem>
						<div style={{width: '300px', marginLeft: '150px'}}>
							<Button type="primary" size="large" htmlType="submit" block className="h3" style={{height: '50px'}}>提交</Button>
							<a href="javascript:;" className="lastStep" onClick={this.lastStepAuther.bind(this)}>上一步</a>
						</div>
					</FormItem>
				</Form>
				<section>
					<Modal visible={submitOk}
					       okText='确认'
					       onOk={this.handleOk.bind(this)}
					       onCancel={() => this.setState({submitOk: false})}
					       className="depthModal"
					>
						<div className="text-center">
							<h2 className="text-center h3">提交确认</h2>
							<section className="depthSubmit mt3 h4 p3">
								<Row>
									<Col span={10}>企业名称</Col>
									<Col span={12}>{companyName}</Col>
								</Row>
								<Row>
									<Col span={10}>统一社会信用代码</Col>
									<Col span={12}>{creditCode}</Col>
								</Row>
								<Row>
									<Col span={10}>对公银行账号</Col>
									<Col span={12}>{bankCard}</Col>
								</Row>
								<Row>
									<Col span={10}>对公银行名称</Col>
									<Col span={12}>{bankName}</Col>
								</Row>
								<Row>
									<Col span={10}>对公银行开户支行</Col>
									<Col span={12}>{bankBranch}</Col>
								</Row>
								<Row>
									<Col span={10}>法人姓名</Col>
									<Col span={12}>{legalName}</Col>
								</Row>
								<Row>
									<Col span={10}>法人身份证号</Col>
									<Col span={12}>{legalID}</Col>
								</Row>
								<Row>
									<Col span={10}>账号管理人姓名</Col>
									<Col span={12}>{agentName}</Col>
								</Row>
								<Row>
									<Col span={10}>账号管理人身份证号</Col>
									<Col span={12}>{agentID}</Col>
								</Row>
								<Row>
									<Col span={10}>账号管理人手机号</Col>
									<Col span={12}>{agentPhone}</Col>
								</Row>
							</section>
							<p className="text-grey text-left mt2 h4">是否确认所有资料无误并提交?</p>
						</div>
					</Modal>
					<Modal visible={holdPic}
					       okText='确认'
					       onCancel={() => this.setState({holdPic: false})}
					       className="seacrhExample"
					>
						<div className="text-center">
							<img src="images/IDsides.png" alt="" />
						</div>
					</Modal>
					<Modal visible={IDsides}
					       okText='确认'
					       onCancel={() => this.setState({IDsides: false})}
					       className="seacrhExample"
					>
						<div className="text-center">
							<img src="images/IDhold.png" alt="" />
						</div>
					</Modal>
				</section>
			</div>
		)
	}
}

const LegalNDelegateForm = Form.create()(LegalNDelegate);
export default LegalNDelegateForm
