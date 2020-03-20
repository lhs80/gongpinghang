// 企业认证
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Row, Form, Button, Input, Upload, Steps, message} from 'antd'
import {baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {userCodeFun,} from 'server'
import {queryAuthInfoFun, uploadBusinessLicenseFun, submitAuthFun} from 'newApi'
import './style.less'

const FormItem = Form.Item;
const {Step} = Steps;

class DepthAuther extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userInfo: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb') : null,
			mobile: '',
			authInfo: {},
			imageUrl: '',
			fileList: [],
			companyName: '',
			loading: false,
			errorTips: ''
		};
		this.beforeUpload = this.beforeUpload.bind(this);
	}

	componentDidMount() {
		this.getUserInfo();
	}

	/*-----获取个人信息判断该账号是否企业认证过---*/
	getUserInfo = () => {
		if (!this.state.userInfo) return;
		let params = {
			userCode: this.state.userInfo.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					mobile: res.data.mobile
				}, () => {
					this.getAutherInfoFun();
				})
			}
		})
	};

	/*--获取个人认证信息--*/
	getAutherInfoFun = () => {
		let params = {
			mobile: this.state.mobile,
			source: 1
		};
		queryAuthInfoFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					authInfo: res.data,
					imageUrl: res.data.licencePath
				})
			}
		})
	};

	beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('仅支持JPG/PNG!');
		}
		const isLt4M = file.size / 1024 / 1024 < 4;
		if (!isLt4M) {
			message.error('图片大小不超过4MB!');
		}

		return isJpgOrPng && isLt4M;
	};

	//图片转base64格式
	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	uploadImage = (file) => {
		this.getBase64(file.file, imageFile => {
			let params = {
				file: imageFile,
				type: 1,
				userCode: this.state.userInfo.userCode
			};
			uploadBusinessLicenseFun(params).then(res => {
				if (res.result === 'success')
					this.setState({
						imageUrl: res.msg
					})
			})
		});
	};

	/*-------表单提交---*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					userCode: this.state.userInfo.userCode,
					merchName: values.companyName,
					licencePath: this.state.imageUrl,
					inviteCode: values.inviteCode,
					merchNo: this.state.authInfo.merchNo || ''
				};
				submitAuthFun(params).then(res => {
					if (res.result === 'success') {
						this.getAutherInfoFun();
					} else {
						this.setState({
							errorTips: res.msg
						})
					}
				})
			}
		});
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {imageUrl, loading, authInfo, errorTips} = this.state;
		const formItemLayout = {
			labelCol: {
				sm: {span: 4},
			},
			wrapperCol: {
				sm: {span: 20},
			},
		};
		const uploadButton = (
			<Icon type={loading ? 'loading' : 'plus'} />
		);

		return (
			<Layout mainMenuIndex="setting" title="企业认证" menuIndex={'5'}>
				<div>
					{
						authInfo.status === 3 ?
							<div className="prl2 ptb1 h5 text-black text-center" style={{background: '#FEF0F0'}}>失败原因：{authInfo.failReason || '无'}</div>
							:
							null
					}
				</div>
				<section className="bg-white" style={{height: '974px', paddingTop: '40px'}}>
					<Row style={{paddingLeft: '80px'}}>
						<h1 className="h0">
							企业认证
						</h1>
					</Row>
					<div className="prl6 ptb4 mt2">
						<Steps current={authInfo.status && (authInfo.status === 3 ? 2 : authInfo.status)}>
							<Step title="提交资料" />
							<Step title="等待审核" />
							<Step title="认证结果" status={authInfo.status === 3 ? 'error' : authInfo.status === 2 ? 'finish' : ''} />
						</Steps>
					</div>
					<div className='mt4'>
						{
							authInfo.status === 0 ?
								<Form onSubmit={this.handleSubmit} style={{width: '554px', margin: 'auto'}} className="myAuthForm">
									<FormItem
										{...formItemLayout}
										label="公司名称"
										className="companyName"
									>
										{getFieldDecorator('companyName', {
											rules: [
												{required: true, message: '请输入营业执照上的公司名称'},
											]
										})(
											<div>
												<Input type="text" placeholder="请输入营业执照上的公司名称" size="large" maxLength="50" />
												<div className="text-primary">{errorTips || ''}</div>
											</div>
										)}
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="营业执照"
										className="businessLicence"
									>
										{getFieldDecorator('businessLicence', {
											// initialValue: baseUrl + imageUrl,
											rules: [{required: true, message: '请上传多合一营业执照'},
											],
										})(
											<div>
												<Upload
													className="avatar-uploader-invite"
													showUploadList={false}
													customRequest={this.uploadImage}
													beforeUpload={this.beforeUpload}
												>
													{imageUrl ? <img src={baseUrl + imageUrl + '?v=' + Math.random()} alt="avatar" style={{width: '100px'}} /> : uploadButton}
												</Upload>
												<div className="auth-descript">
													{/*<p style={{marginBottom: '0'}} className="mt5">仅支持三证合一的情况。原始多证企业请先更换营业执照</p>*/}
													{/*<p style={{marginBottom: '0'}}>图片所有信息需清晰可见，内容真实有效</p>*/}
													支持.jpg .jpeg .png格式，大小不超过2M
												</div>
											</div>
										)}
									</FormItem>
									{/*<FormItem*/}
									{/*	{...formItemLayout}*/}
									{/*	label="邀请码"*/}
									{/*>*/}
									{/*	{getFieldDecorator('inviteCode')(*/}
									{/*		<div>*/}
									{/*			<Input type="text" placeholder="请输入邀请码" size="large" maxLength={6} />*/}
									{/*			<div className="text-primary">{errorTips || ''}</div>*/}
									{/*		</div>*/}
									{/*	)}*/}
									{/*</FormItem>*/}
									<FormItem>
										<div style={{width: '300px', marginLeft: '154px'}}>
											<Button type="primary" size="large" htmlType="submit" block className="h3 mt3" style={{height: '50px'}}>提交</Button>
										</div>
									</FormItem>
								</Form>
								:
								null
						}
						{
							authInfo.status === 3 ?
								<Form onSubmit={this.handleSubmit} style={{width: '554px', margin: 'auto'}} className="myAuthForm">
									<FormItem
										{...formItemLayout}
										label="公司名称"
										className="companyName"
									>
										{getFieldDecorator('companyName', {
											initialValue: authInfo.merchantName,
											rules: [
												{required: true, message: '请输入营业执照上的公司名称'},
											]
										})(
											<Input type="text" placeholder="请输入营业执照上的公司名称" size="large" maxLength="50" />
										)}
											<div>
												<div className="text-primary">{errorTips || ''}</div>
											</div>
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="营业执照"
										className="businessLicence"
									>
										{getFieldDecorator('businessLicence', {
											initialValue: baseUrl + imageUrl,
											rules: [{required: true, message: '请上传多合一营业执照'},
											],
										})(
											<div>
												<Upload
													className="avatar-uploader-invite"
													showUploadList={false}
													customRequest={this.uploadImage}
													beforeUpload={this.beforeUpload}
												>
													{imageUrl ? <img src={baseUrl + imageUrl + '?v=' + Math.random()} alt="avatar" style={{width: '100px'}} /> : uploadButton}
												</Upload>
												<div className="auth-descript">
													支持.jpg .jpeg .png格式，大小不超过2M
												</div>
											</div>
										)}
									</FormItem>
									{/*<FormItem*/}
									{/*	{...formItemLayout}*/}
									{/*	label="邀请码"*/}
									{/*>*/}
									{/*	{getFieldDecorator('inviteCode', {*/}
									{/*		initialValue: authInfo.inviteCode,*/}
									{/*	})(*/}
									{/*		<div>*/}
									{/*			<Input type="text" placeholder="请输入邀请码" size="large" maxLength={6} />*/}
									{/*			<div className="text-primary">{errorTips || ''}</div>*/}
									{/*		</div>*/}
									{/*	)}*/}
									{/*</FormItem>*/}
									<FormItem>
										<div style={{width: '300px', marginLeft: '154px'}}>
											<Button type="primary" size="large" htmlType="submit" block className="h3 mt3" style={{height: '50px'}}>提交</Button>
										</div>
									</FormItem>
								</Form>
								:
								null
						}
						{
							authInfo.status === 1 || authInfo.status === 2 ?
								<Form onSubmit={this.handleSubmit} style={{width: '500px', margin: '0 400px'}} className="myForm">
									<FormItem
										{...formItemLayout}
										label="公司名称"
									>
										<div style={{lineHeight: '50px'}}>{authInfo.merchantName}</div>
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="营业执照"
									>
										<img src={baseUrl + authInfo.licencePath + '?v=' + Math.random()} alt="avatar" style={{width: '100px'}} />
									</FormItem>
									{/*<FormItem*/}
									{/*	{...formItemLayout}*/}
									{/*	label="邀请码"*/}
									{/*>*/}
									{/*	<div style={{lineHeight: '50px'}}>{authInfo.inviteCode || '无'}</div>*/}
									{/*</FormItem>*/}
								</Form>
								:
								null
						}
					</div>
				</section>
			</Layout>
		)
	}
}

const DepthAutherForm = Form.create()(DepthAuther);
export default DepthAutherForm
