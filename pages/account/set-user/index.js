// 账户资料
import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import Layout from 'components/Layout/setting'
import {Button, Row, Col, Modal, Form, Input, Avatar} from 'antd';
import cookie from 'react-cookies';
import {baseUrl, authUrl} from 'config/evn'
import {userCodeFun, modifyAccountFun, picUploadFun, validateNameFun} from 'server'
import {queryAuthInfoFun} from 'newApi'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import './style.less'

const FormItem = Form.Item;

class AccountDatumForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			headUrl: '',
			nickName: '',
			mobile: '',
			isAuther: '',
			isAuthCom: '',
			isAuthPri: '',
			passWord: '',
			/*----企业认证弹窗----*/
			visibleAuther: false,
			/*----修改头像弹窗----*/
			cropperVisible: false,
			cropperHead: '',
			srcCropper: 'images/defaultHead.png',
			cropResult: null,
			/*---修改昵称----*/
			modifyName: false,
			userDisabled: true,
			errorReasons: '',
			errorTip: false,
			authStatus: 0
		}
	}

	componentDidMount() {
		if (!cookie.load('ZjsWeb')) {
			Router.push({pathname: '/login/index', query: {redirectUrl: '/account/set-user/index'}});
		}
		this.getUserCode();
	}

	/*------根据userCode获取认证所有信息-----*/
	getUserCode = () => {
		let params = {
			userCode: this.state.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					headUrl: res.data.headUrl,
					nickName: res.data.nickName,
					mobile: res.data.mobile,
					isAuther: res.data.isAuthUser,
					isAuthCom: res.data.isAuthCom,
					passWord: res.data.password,
					isAuthPri: res.data.isAuthPri,
					companyType: res.data.companyType
				});
				if (res.data.headUrl) {
					this.setState({
						srcCropper: baseUrl + res.data.headUrl
					})
				}
				this.getAutherInfoFun();
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
					authStatus: res.data.status,
				})
			}
		})
	};

	/*----点击上传图片---把隐藏的input事件调取---*/
	upModifyImg = (e) => {
		e.preventDefault();
		let fileToSent = document.getElementById('upImg');
		fileToSent.click()
	};

	onChange = (e) => {
		e.preventDefault();
		let files;
		if (e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if (e.target) {
			files = e.target.files;
		}

		const reader = new FileReader();
		reader.onload = () => {
			this.setState({srcCropper: reader.result});
		};
		reader.readAsDataURL(files[0]);
	};

	/*----裁剪图片确定----*/
	cropperOk = () => {
		const {mobile} = this.state;
		let headUp = {
			file: this.cropper.getCroppedCanvas().toDataURL(),
			type: 'imgHead'
		};
		/*--提交图片---*/
		picUploadFun(headUp).then(res => {
			if (res.result === 'success') {
				//把图片先传到服务器上，获取服务器图片地址
				let params = {
					mobile: mobile,
					headUrl: res.msg
				};
				modifyAccountFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							cropperVisible: false,
							headUrl: res.data.headUrl
						})
					}
				})
			}
		});
	};
	/*----昵称校验------*/
	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 1) {
				callback('请输入1-15个字符，限中英文或数字')
			}

		} else if (value && value.indexOf(' ') !== -1) {
			callback('昵称格式不正确')
		}
		callback();
	};
	/*------设置昵称-----*/
	nikeOk = (e) => {
		const {mobile} = this.state;
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				/*---提交设置资料-----*/
				let params = {
					mobile: mobile,
					nickName: values.userName,
				};
				/*----校验用户名是否被注册过-----*/
				validateNameFun(values.userName).then(res => {
					if (res.result === 'success') {
						modifyAccountFun(params).then(res => {
							if (res.result === 'success') {
								this.setState({
									nickName: res.data.nickName,
									modifyName: false
								})
							}
						})
					} else {
						const form = this.props.form;
						form.setFields({
							userName: {
								value: values.userName,
								errors: [new Error('该昵称已被注册，请重新输入！')],
							},
						});
					}
				})
			}
		});
	};
	/*--弹窗--深度认证----*/
	depthAuther = () => {
		this.props.history.push(`/depthAuther`)
	};
	/*--弹窗--初级认证-----*/
	initialAuther = () => {
		this.props.history.push(`/companyPrimary`)
	};
	userNameChange = (e) => {
		if (e.target.value === this.state.nickName) {
			this.setState({
				userDisabled: true
			})
		} else {
			this.setState({
				userDisabled: false
			})
		}
	};

	//去认证中心
	goToAuth = () => {
		cookie.save('_mobile_', this.state.mobile, {path: '/', domain: '.mrogph.com'});
		cookie.save('_source_', 1, {path: '/', domain: '.mrogph.com'});
		window.open(authUrl)
	};

	render() {
		const {
			userCode, headUrl, nickName, mobile, passWord, authStatus, isAuthPri
		} = this.state;
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 5},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 17},
			},
		};
		//根据认证结果显示对应的文案
		const authResult = () => {
			switch (authStatus) {
				case 0:
					return <span style={{marginLeft: '6px'}} className="text-grey">未完成认证</span>;
				case 1:
					return <span style={{marginLeft: '6px'}} className="text-grey">等待审核</span>;
				case 2:
					return <span style={{marginLeft: '6px'}} className="text-grey">已认证</span>;
				case 3:
					return <span style={{marginLeft: '6px'}} className="text-grey">认证失败</span>;
			}
		};

		const authButtons = () => {
			// 企业认证状态  0 已注册未认证  1 审核中 2 已认证 3 认证失败 -1 未注册未认证
			switch (authStatus) {
				case 1:
					return (<Button size="large" type="primary" style={{width: '120px'}} ghost className="h5">
						<a href="/account/set-user/companyauther">查看</a>
					</Button>);
				case 2:
					return (<Button size="large" type="primary" style={{width: '120px'}} ghost className="h5">
						<a href="/account/set-user/companyauther">查看</a>
					</Button>);
				default:
					return <Button size="large" type="primary" style={{width: '120px'}} ghost className="h5">
						<a href="/account/set-user/companyauther">去认证</a>
					</Button>;
			}
		};

		return (
			<Layout mainMenuIndex="setting" menuIndex={'1'} title="账户资料">
				<section className="bg-white" style={{padding: '50px 100px 0 100px', height: '766px'}}>
					<section>
						<div className="accountImgMenu show mt4">
							<p className="text-grey h4">用户头像</p>
							<p className="text-muted h5">ID:{userCode}</p>
						</div>
						<span className="accountImg show">
                 {
	                 headUrl ?
		                 <Avatar src={baseUrl + headUrl} size={100} className="avatar" /> :
		                 <Avatar src="/static/images/default-header.png" size={100} />
                 }
             </span>
						<div className="imgBtn mt3" style={{width: '120px'}}>
							<Button size="large" type="primary" className="h5 accountDatumBtn"
							        onClick={() => this.setState({cropperVisible: true})} ghost>修改头像</Button>
						</div>
					</section>
					<section className="accountDatumWrapper mt2">
						<p className="h0 mt5" style={{marginBottom: '20px'}}>账户资料</p>
						<Row className="userInfoLine mt5 h4">
							<Col span={18}>
								<div className="userInfoLeft">
									<span className="text-muted" style={{marginRight: '6px'}}>昵称&nbsp;:</span>
									{
										nickName ?
											<span style={{marginLeft: '6px'}} className="text-grey">{nickName}</span>
											: <span style={{marginLeft: '6px'}} className="text-grey">请输入昵称</span>
									}

								</div>
							</Col>
							<Col span={6}>
								<div className="userInfoRight">
									{
										nickName ?
											<Button size="large" type="primary" className="h5 accountDatumBtn"
											        onClick={() => this.setState({modifyName: true})} ghost>更改昵称</Button>
											:
											<Button size="large" className="h5 accountDatumBtn text-secondary" onClick={() => this.setState({modifyName: true})}>编辑</Button>
									}
								</div>
							</Col>
						</Row>
						<Row className="userInfoLine mt5 h4">
							<Col span={18}>
								<div className="userInfoLeft">
									<span className="text-muted" style={{marginRight: '6px'}}>绑定手机&nbsp;:</span>
									{
										mobile ?
											<span style={{marginLeft: '6px'}} className="text-grey">{mobile} <i
												className="text-muted h6">(若已丢失或停用，请立即更换，避免账号被盗)</i> </span>
											: <span style={{marginLeft: '6px'}} className="text-grey">请绑定手机号码</span>
									}

								</div>
							</Col>
							<Col span={6}>
								<div className="userInfoRight">
									{
										mobile ?
											<Button size="large" type="primary" className="h5" ghost style={{width: '120px'}}>
												<a href="/account/set-user/change-phone">更改手机号</a>
											</Button>
											:
											<Button size="large" type="primary" className="h5" ghost style={{width: '120px'}}>设置</Button>
									}
								</div>
							</Col>
						</Row>
						<Row className="userInfoLine mt5 h4">
							<Col span={18}>
								<div className="userInfoLeft">
									<span className="text-muted" style={{marginRight: '6px'}}>登录密码&nbsp;:</span>
									{
										passWord ?
											<span style={{marginLeft: '6px'}} className="text-grey">已设置</span>
											: <span style={{marginLeft: '6px'}} className="text-grey">互联网账号存在被盗风险,建议您定期更改密码以保护账号安全</span>
									}
								</div>
							</Col>
							<Col span={6}>
								<div className="userInfoRight">
									{
										passWord ?
											<Button size="large" type="primary" style={{width: '120px'}} ghost className="h5">
												<a href="/account/set-user/change-passWord">更改密码</a>
											</Button>
											:
											<Button size="large" className="h5 accountDatumBtn">设置</Button>
									}

								</div>
							</Col>
						</Row>
						<Row className="userInfoLine mt5 h4">
							<Col span={14}>
								<div className="userInfoLeft">
									<span className="text-muted" style={{marginRight: '6px'}}>实名认证&nbsp;:</span>
									{authResult()}
								</div>
							</Col>
							<Col span={10}>
								<div className="userInfoRight">
									{authButtons()}
								</div>
							</Col>
						</Row>
					</section>
					<Modal visible={this.state.cropperVisible}
					       onOk={this.cropperOk}
					       onCancel={() => this.setState({cropperVisible: false})}
					       className="modalClose"
					>
						<div>
							<div style={{width: '100%'}}>
								<Button onClick={this.upModifyImg.bind(this)} size="large" className="h5 accountDatumBtn">上传图片</Button>
								<input type="file" onChange={this.onChange.bind(this)} style={{display: 'none'}} id="upImg"
								       accept="image/jpeg,image/jpg,image/png,image/gif" />
								<Cropper
									src={this.state.srcCropper} //图片路径，即是base64的值，在Upload上传的时候获取到的
									ref={cropper => {
										this.cropper = cropper;
									}}
									style={{height: 400}}
									preview='.cropper-preview'
									className="company-logo-cropper mt2"
									viewMode={1} //定义cropper的视图模式
									zoomable={false} //是否允许放大图像
									aspectRatio={75 / 75} //image的纵横比
									guides={true} //显示在裁剪框上方的虚线
									background={false} //是否显示背景的马赛克
									rotatable={false} //是否旋转
								/>
							</div>
							<br style={{clear: 'both'}} />
						</div>
					</Modal>
					<Modal visible={this.state.modifyName}
					       footer={null}
					       centered
					       onCancel={() => this.setState({modifyName: false})}>
						<h2 className="mt1 text-center">设置昵称</h2>
						<Form onSubmit={this.nikeOk.bind(this)}>
							<FormItem
								{...formItemLayout}
								label="昵称"
								className="mt4"
								style={{width: '420px'}}
							>
								{getFieldDecorator('userName', {
									initialValue: nickName,
									rules: [
										{required: true, message: '请输入昵称'},
										{validator: this.userName}
									]
								})(
									<Input type="text" placeholder="请输入昵称" size="large" maxLength={15} onChange={this.userNameChange} />
								)}
							</FormItem>
							<FormItem>
								<div className="text-center">
									<Button className="h5 ant-btn text-primary" size="large" onClick={() => this.setState({modifyName: false})}
									        style={{width: '140px', height: '40px'}}>取消</Button>
									<Button type="primary" htmlType="submit" size="large" className="h5" style={{width: '140px', height: '40px', marginLeft: '18px'}}
									        disabled={this.state.userDisabled}>确定</Button>
								</div>
							</FormItem>
						</Form>
					</Modal>
				</section>
			</Layout>
		)
	}
}

const AccountDatum = Form.create()(AccountDatumForm);
export default AccountDatum
