//完善资料
import React, {Component} from 'react';
import Router from 'next/router'
import Layout from 'components/Layout/login'
import {Form, Input, Upload, message, Button, Avatar, Icon, Modal} from 'antd';
import './style.less';
import {baseUrl, iconUrl} from 'config/evn'
import {modifyAccountFun, photoUploadFun, userCodeFun, userInfoFun, validateNameFun, picUploadFun} from 'server'
import cookie from 'react-cookies';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import md5 from 'blueimp-md5'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const FormItem = Form.Item;

class Wszl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			imageUrl: 'images/default-header.png',
			name: 'none',
			nameTip: '',
			pictureShow: 'block',
			pictureTip: '',
			headImg: '',
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			headImgUrl: '',
			token: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').token ? cookie.load('ZjsWeb').token : null : null,
			headUrl: '',
			/*----修改头像弹窗----*/
			cropperVisible: false,
			cropperHead: '',
			srcCropper: 'images/defaultHead.png',
			cropResult: null,
			userHearUrl: false
		};
	}

	/*----昵称有值时----*/
	userName = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 2) {
				callback('请输入2-15个字符，限中英文或数字')
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('昵称格式不正确')
		}
		callback();
	};
//点击跳过
	jumpNext = () => {
		Router.push('/')
	};
	/*----完成提交------*/
	wszlSubmit = (e) => {
		e.preventDefault();
		this.checkHeadUrl();
		this.props.form.validateFields((err, values) => {
			if (!err && this.checkHeadUrl()) {
				let mobile = cookie.load('registInfo') ? cookie.load('registInfo').mobile : '';
				/*---提交设置资料-----*/
				let params = {
					mobile: mobile,
					nickName: values.userName,
					headUrl: this.state.headUrl
				};
				/*----校验用户名是否被注册过-----*/
				validateNameFun(values.userName).then(res => {
					if (res.result === 'success') {
						modifyAccountFun(params).then(res => {
							if (res.result === 'success') {
								// window.location.href = '/';
								Router.push('/')
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
				});
			}
		});
	};
	/*-----裁剪图片-----*/
	checkHeadUrl = () => {
		if (!this.state.headUrl) {
			this.setState({
				userHearUrl: true
			}, () => {
				return false
			})
		} else {
			return true
		}

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
				this.setState({
					cropperVisible: false,
					headUrl: res.msg,
					userHearUrl: false
				})
			}
		});
	};
	/*-----点击修改头像弹窗打开-----*/
	modifyImg = () => {
		this.setState({
			cropperVisible: true
		})
	};
	/*----裁剪图片弹窗关闭或者取消------*/
	cropperCancel = (e) => {
		e.preventDefault();
		this.setState({
			cropperVisible: false
		})
	};
	userHeadUrl = () => {

	};

	render() {
		const {imageUrl, headImgUrl} = this.state;
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: {span: 8},
			},
			wrapperCol: {
				xs: {span: 16},
			},
		};
		return (
			<Layout title="完善资料" className="register-wrapper">
				<section className="regFormWrapper">
					<Form className="registerForm" onSubmit={this.wszlSubmit}>
						<div className="lineForm">
							<span className="cur" />
							<span className="cur" />
							<span className="cur" />
						</div>
						<h2 className="mt6 text-center large text-darkgrey">完善用户资料</h2>
						<div className="userWrapper mt8">
							<div className="text-center" style={{marginBottom: '20px', color: '#f5222d'}}>
                  <span className="accountImg show" onClick={this.modifyImg.bind(this)}>
                     {
	                     this.state.headUrl ?
		                     <Avatar src={baseUrl + this.state.headUrl} size={100} className="avatar" /> :
		                     <Avatar src="/static/images/nologin.png" size={100} />
                     }
                  </span>
								{
									this.state.userHearUrl ?
										<p style={{color: '#f5222d'}}>请上传头像</p>
										: null
								}
							</div>
							<FormItem {...formItemLayout} label="昵称" className="form-item">
								{getFieldDecorator('userName', {
									rules: [
										{required: true, message: '请输入昵称'},
										{validator: this.userName}
									]
								})(
									<Input type="text" placeholder="请输入昵称" size="large" maxLength={15} />
								)}
							</FormItem>
							<FormItem>
								<div className="regItem text-center mt4" style={{marginLeft: '45px', marginRight: '45px'}}>
									<Button type="primary" htmlType="submit" size="large" block className="regWszl bg-primary-linear border-circle"
									        style={{height: '50px'}}>完成</Button>
									<a href="javascript:;" className="lastStep" onClick={this.jumpNext.bind(this)}>跳过</a>
								</div>
							</FormItem>
						</div>
					</Form>
				</section>
				<Modal visible={this.state.cropperVisible}
				       onOk={this.cropperOk}
				       onCancel={this.cropperCancel}
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
			</Layout>
		)
	}
}

const wszl = Form.create()(Wszl);
export default wszl
