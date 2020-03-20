/*------法人代表-----*/
// 深度认证第二步
import React from 'react'
import {Icon, Layout, Row, Steps, Col, Form, Button, Input, Upload, Modal, Radio, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies'
import {checkIDNum} from 'config/regular'
import {picUploadFun, autherInfoFun, dapthCertifyFun, userCodeFun} from 'server'
import './style.less'

const FormItem = Form.Item;

class LegalDelegate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			imageUrl: '',
			headImgUrl: '',
			/*---申请表图片--*/
			applicationUrl: '',
			previewVisible: false,
			previewImage: '',
			fileList: [],
			mobile: '',
			submitOk: false,
			nameDisable: false,
			/*----手持照片---*/
			holdPic: false,
			/*---企业认证状态---*/
			isAuthCom: '',
			isAuthPri: '',
			/*----form提交时确认信息----*/
			licenseImageUrl: '',
			companyName: '',
			creditCode: '',
			bankCard: '',
			bankName: '',
			bankBranch: '',
			legalName: '',
			legalID: '',
			flag: 0,//1初级2深度失败法人3深度认证代理人
			modifyInfo: false
		};
		this.beforeUpload = this.beforeUpload.bind(this);
	}

	componentDidMount() {
		this.getUserInfo();
		/*----如果初级认证把法人名字写入并不可修改-----*/
		if (cookie.load(this.state.userCode + 'legalInfo')) {
			this.getLegalInfo();
		} else {
			this.getAutherInfoFun()
		}
	}

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

	/*----法人手持身份证照上传-----*/
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
	/*-----上传申请表-----*/
	uploadApplication = (file) => {
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
	};
	/*-------表单提交---*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = cookie.load(this.state.userCode + 'depthStep1');
				this.setState({
					companyName: data.company_name,
					creditCode: data.license_no,
					bankCard: data.bank_id,
					bankName: data.bank_name,
					bankBranch: data.subbranch_name,
					licenseImageUrl: data.licenseImageUrl,
					legalName: values.legalName,
					legalID: values.legalID,
					submitOk: true
				})
			}
		});
	};
	/*-----提交成功确认弹窗-----*/
	handleOk = () => {
		const {
			applicationUrl, licenseImageUrl, headImgUrl, legalName, legalID, mobile, bankName, bankCard, bankBranch, companyName
			, creditCode, userCode, isAuthCom
		} = this.state;
		let status = 'add';
		if (isAuthCom === 4) status = 'modify';
		let params = {
			option: status,
			legalIdImageUrl: '',//法人身份证正反面(代理时传)
			agentImageUrl: '',
			authorizationImageUrl: applicationUrl,//申请表
			licenseImageUrl: licenseImageUrl,//营业执照
			legalImageUrl: headImgUrl,//法人手持身份证
			legalInfo: {
				legal_name: legalName,
				legal_id: legalID,
				legal_mobile: mobile
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
				this.props.history.push(`/autherAuding`)
			} else {
				message.error(res.msg);
			}
		})
	};
	/*-----上一步跳回深度认证第一步----*/
	lastStepAuther = () => {
		let userCode = this.state.userCode;
		const form = this.props.form;
		//删除认证失败原有的信息
		let legalInfo = {
			legalName: form.getFieldValue('legalName'),
			legalID: form.getFieldValue('legalID'),
			mobile: this.state.mobile,
			legalIDPic: this.state.headImgUrl,
			applicationImg: this.state.applicationUrl,
		}
		cookie.save(userCode + 'legalInfo', legalInfo)
		this.props.history.push(`/depthAuther`)
	};
	getAutherInfoFun = () => {
		autherInfoFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					legalName: res.data.legalName,
					legalID: res.data.legalId,
					headImgUrl: res.data.legalIdImageUrl,
					applicationUrl: res.data.authorizationImageUrl,
				})
			}
		})
	};
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};
	getLegalInfo = () => {
		let userCode = this.state.userCode;
		let legalInfo = cookie.load(userCode + 'legalInfo');
		this.setState({
			legalName: legalInfo ? legalInfo.legalName : '',
			legalID: legalInfo ? legalInfo.legalID : '',
			mobile: legalInfo ? legalInfo.mobile : '',
			headImgUrl: legalInfo ? legalInfo.legalIDPic : '',
			applicationUrl: legalInfo ? legalInfo.applicationImg : ''
		})
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {submitOk, mobile, nameDisable, headImgUrl, applicationUrl, companyName, creditCode, bankName, bankCard, bankBranch, legalName, legalID, holdPic} = this.state;
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
			<div style={{display: this.props.legalDelegate}}>
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
							<Input type="text" placeholder="请填写营业执照上的公司法定代表人姓名" size="large" disabled={nameDisable} style={{height: '50px'}} maxLength={25} />
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
						label="法定代表人手机号"
					>
						<p className="text-grey h4" style={{margin: '0px'}}>{mobile}</p>
						<p className="phoneDescript h6 text-muted">*手机号将用于接收签名验证码等重要通知，如需修改请至“账户设置-账户资料”页面更换手机号</p>
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="法人手持身份证照"
						className="businessLicence"
					>
						{getFieldDecorator('legalIDPic', {
							initialValue: headImgUrl,
							rules: [{required: true, message: '请上传法人手持身份证照'},
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
									<p style={{color: '#316ccb', cursor: 'pointer'}} className="mt2" onClick={() => {
										this.setState({holdPic: true})
									}}>查看示例</p>
									<p className="h6 text-muted">图片所有信息需清晰可见，请上传登记执照支持.jpg .jpeg .png格式，大小不超过4M</p>
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
									beforeUpload={this.uploadApplication.bind(this)}
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
									<Col span={10}>法人手机号</Col>
									<Col span={12}>{mobile}</Col>
								</Row>
							</section>
							<p className="text-darkgrey text-left mt2 h4">是否确认所有资料无误并提交?</p>
						</div>
					</Modal>
					<Modal visible={holdPic}
					       okText='确认'
					       centered
					       onCancel={() => this.setState({holdPic: false})}
					       className="seacrhExample"
					>
						<div className="text-center">
							<img src="images/holdPic.png" alt="" />
						</div>
					</Modal>
				</section>
			</div>
		)
	}
}

const LegalDelegateForm = Form.create()(LegalDelegate);
export default LegalDelegateForm
