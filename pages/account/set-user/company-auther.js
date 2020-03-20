// 企业认证
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Row, Form, Button, Input, Upload, Modal, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {checkBank, checkIDNum} from 'config/regular'
import cookie from 'react-cookies';
import {
	picUploadFun,
	userCodeFun,
	queryRegisterFun,
	certificationInfoFun,
	companyNameFun,
	companyAuthenteFun,
	judgeLicenseFun,
	checkIdentityFun
} from 'server'
import {validateBlank, validateCredit} from 'config/regular'
import copy from 'copy-to-clipboard'
import './style.less'

const FormItem = Form.Item;
const Search = Input.Search;

class DepthAuther extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			imageUrl: '',
			headImgUrl: '',
			license: '',
			fileList: [],
			companyNick: false,
			appealTip: false,
			isShowSearchSuggest: false,
			errorAuther: false,
			successAuther: false,
			fuzzySearchResultList: [],
			companyName: '',
			cridetNum: '',
			keyWord: '',
			agentName: '',
			agentID: '',
			isAuther: false,
			errorReason: '',
			search: true,
			flag: false,
			errorFlag: false,//营业执照认证失败
			companyChange: false,
			licenseLegalName: '',
			licenseCompany: '',
			licenseCard: ''
		};
		this.beforeUpload = this.beforeUpload.bind(this);
	}

	componentDidMount() {
		this.getAutherInfoFun();
		this.getUserInfo();
		window.addEventListener('click', () => {
			this.setState({
				isShowSearchSuggest: false,
			});
		})
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
							license: res.msg,
							errorFlag: false
						}, () => {
							this.oCRCheck();
						});
					}
				});
			}
		});
	}

	/*---图片上传成功---*/
	handleChange = ({fileList}) => this.setState({fileList});
	/*---营业执照ocr校验---*/
	oCRCheck = () => {
		judgeLicenseFun(this.state.license).then(res => {
			//先识别营业执照是否合格,合格后在提交表单
			if (res.result === 'success' && res.data && res.data.legalName !== '无' && res.data.licenseImageUrl !== '无') {
				let licenseImageUrl = res.data.licenseImageUrl.substring(0, 18);
				this.setState({
					licenseLegalName: res.data.legalName,
					licenseCompany: res.data.companyName,
					licenseCard: licenseImageUrl,
					errorFlag: false
				})
			} else {
				this.setState({
					errorFlag: true,
					errorAuther: true,
					errorReason: '图片识别失败，请重新上传',
					licenseLegalName: '',
					licenseCompany: '',
				})
			}
		});
	};
	/*-------表单提交---*/
	handleSubmit = (e) => {
		const {licenseLegalName, licenseCard, licenseCompany} = this.state;
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					userCode: this.state.userCode,
					companyName: values.companyName,
					licenseNo: values.cridetCard,
					legalName: values.legalName,
					name: values.agentName,
					idNumber: values.agentID,
					licenseImageUrl: this.state.license
				};
				//values.companyName === licenseCompany
				//ocr校验返回数据才可以校验与填写的是否一致
				if (licenseLegalName && licenseCard && licenseCompany) {
					if (values.legalName === licenseLegalName && values.cridetCard === licenseCard && values.companyName === licenseCompany) {
						//先校验身份证号是否一致
						companyAuthenteFun(params).then(res => {
							if (res.result === 'success') {
								this.setState({
									successAuther: true,
								})
							} else {
								this.setState({
									errorAuther: true,
									errorReason: res.msg
								})
							}
						})
					} else if (values.legalName !== licenseLegalName && values.cridetCard === licenseCard && values.companyName === licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '法人代表人与营业执照不符'
						})
					} else if (values.legalName === licenseLegalName && values.cridetCard !== licenseCard && values.companyName === licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '社会信信用代码与营业执照不符'
						})
					} else if (values.legalName === licenseLegalName && values.cridetCard === licenseCard && values.companyName !== licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '公司名称与营业执照不符'
						})
					} else if (values.legalName !== licenseLegalName && values.cridetCard !== licenseCard && values.companyName === licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '法人代表人与营业执照不符、社会信信用代码与营业执照不符'
						})
					} else if (values.legalName !== licenseLegalName && values.cridetCard !== licenseCard && values.companyName !== licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '法人代表人与营业执照不符、社会信信用代码与营业执照不符、公司名称与营业执照不符'
						})
					} else if (values.legalName !== licenseLegalName && values.cridetCard === licenseCard && values.companyName !== licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '法人代表人与营业执照不符,公司名称与营业执照不符'
						})
					} else if (values.legalName === licenseLegalName && values.cridetCard !== licenseCard && values.companyName !== licenseCompany) {
						this.setState({
							errorAuther: true,
							errorReason: '社会信信用代码与营业执照不符,公司名称与营业执照不符'
						})
					}
				} else if (this.state.errorFlag) {
					Modal.info({
						title: '提示',
						okText: '确定',
						content: (
							<div>
								图片识别失败，请重新上传
							</div>
						)
					});
				} else {
					Modal.info({
						title: '提示',
						okText: '确定',
						content: (
							<div>
								正在扫描营业执照,请稍等
							</div>
						)
					});
				}

			}
		});
	};
	/*--获取个人认证信息--*/
	getAutherInfoFun = () => {
		certificationInfoFun(this.state.userCode).then(res => {
			if (res.result === 'success' && res.data) {
				this.setState({
					agentName: res.data.name,
					agentID: res.data.idCard,
					companyNick: true
				})
			}
		})
	};
	/*----管理人姓名校验----*/
	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') === -1) {
			if (value.length < 1) {
				callback('请输入1-25个字符，限中英文或数字')
			}
		} else if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};
	/**
	 * 搜索值变化时显示关键字面板
	 * */
	searchOnChange = (e) => {
		if (e.target.value) {
			this.setState({
				keyWord: e.target.value,
				search: false,
				companyChange: true
			}, () => {
				companyNameFun(this.state.keyWord).then(res => {
					if (res.result === 'success') {
						this.setState({
							fuzzySearchResultList: res.data,
							isShowSearchSuggest: true
						});
					}
				});
			});
		}
	};
	/**
	 * 判断公司是否认证
	 * */
	onSearchCompany = (word) => {
		queryRegisterFun(word).then(res => {
			if (res.result === 'success' && res.data) {
				//1已认证，0未认证
				if (res.data.isRegister === 1) {
					this.setState({
						isAuther: true,
					});
					this.props.form.setFields({
						companyName: {
							value: '',
						},
					});
				} else if (res.data.isRegister === 0) {
					this.setState({
						flag: true,
						companyChange: false,
						companyName: word
					});
					this.props.form.setFields({
						companyName: {
							value: word,
						},
					});

				}
			}
		});
	};
	/*-----复制申诉----*/
	copyAppeal = () => {
		copy(`
        如您的公司信息被冒用，请按以下方式进行申诉：
        
        请提供以下证明材料，邮寄至zhujiangshi@civil-data.com：
        1、公司名称
        2、营业执照扫描件盖公章
        3、公司联系电话
        4、您的姓名，身份证号码
        5、您的身份证扫描件；
        6、您的手机号（需已注册本APP，并已进行个人身份认证）；
        7、您的在职证明（劳动合同、名片、工牌等）；
        收到您的邮件后，平台会在2-3个工作日内处理！
        `);
		message.success('复制成功');
	};
	/*--认证成功后关闭弹窗--*/
	closeModal = () => {
		this.setState({
			successAuther: false
		}, () => {
			this.props.history.push(`/searchAuthCom`);
		})
	};
	/*--失去焦点如果没有选择未认证的企业名称-清空企业名称--*/
	emptySearch = () => {
		if (this.state.flag && !this.state.companyChange) {
			//企业名称不清空
			/*this.props.form.setFields({
					companyName: {
							value: '',
					},
			});*/
		} else {
			this.props.form.setFields({
				companyName: {
					value: '',
				},
			});
		}
	};
	/*-----获取个人信息判断该账号是否企业认证过---*/
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				//已经企业认证了
				if (res.data.isAuthPri === 1) {
					this.props.history.push(`/searchAuthCom`);
				}
			}
		})
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const {
			companyNick, headImgUrl, appealTip, companyName,
			cridetNum, agentName, agentID
		} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 13},
			},
		};
		return (
			<Layout mainMenuIndex="setting" title="企业认证" menuIndex={'5'}>
				<section className="bg-white" style={{height: '974px', paddingTop: '40px'}}>
					<Row style={{paddingLeft: '80px'}}>
						<h1 className="h0">
							企业认证
						</h1>
					</Row>
					<Form onSubmit={this.handleSubmit} style={{width: '554px', margin: 'auto'}} className="mt5 myForm">
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
								<Search
									//onSearch={this.searchOnChange}
									onChange={this.searchOnChange}
									onBlur={this.emptySearch}
									style={{width: '300px', height: '50px'}}
									placeholder="请输入营业执照上的公司名称"
									autoComplete="off"
								/>
							)}
							<p className="companyTip h6">公司名称被冒用?
								<a className="text-info" onClick={() => this.setState({appealTip: true})}>点我申诉</a>
							</p>
							<div className={`company-search-suggest ${this.state.isShowSearchSuggest ? '' : 'hide'}`}>
								{
									this.state.fuzzySearchResultList.length > 0 ?
										this.state.fuzzySearchResultList.map((item, index) => {
											return (
												<h5 key={index} onClick={() => this.onSearchCompany(item)}
												    className="text-ellipsis">{item}</h5>
											)
										})
										:
										<h5 className="h6 prl2">未找到您输入的公司名称，请核实后重新输入!</h5>
								}
							</div>
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="统一社会信用代码"
						>
							{getFieldDecorator('cridetCard', {
								initialValue: cridetNum,
								rules: [
									{required: true, message: '请输入18位信用代码'},
									{validator: validateCredit}
								],
							})(
								<Input type="text" placeholder="请输入18位信用代码" size="large" maxLength={18} autoComplete="off" />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="法定代表人"
						>
							{getFieldDecorator('legalName', {
								rules: [
									{required: true, message: '法人姓名不能为空'},
									{validator: this.userName}
								],
							})(
								<Input type="text" placeholder="请输入法人姓名，限1-25个字符" size="large" maxLength={25} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="营业执照"
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
										accept="image/jpeg,image/jpg,image/png,image/gif"
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
									<div className="show authDescript h6">
										<p style={{marginBottom: '0'}} className="mt5">仅支持三证合一的情况。原始多证企业请先更换营业执照</p>
										<p style={{marginBottom: '0'}}>图片所有信息需清晰可见，内容真实有效</p>
										<p>支持.jpg .jpeg .png格式，大小不超过4M</p>
									</div>
								</div>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="管理员姓名"
						>
							{getFieldDecorator('agentName', {
								initialValue: agentName,
								rules: [
									{required: true, message: '管理员姓名不能为空'},
									{validator: this.userName}],
							})(
								<Input type="text" placeholder="请输入管理员姓名(限1-25个字符)" size="large"
								       maxLength={25} disabled={companyNick} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="管理员身份证号码"
						>
							{getFieldDecorator('agentID', {
								initialValue: agentID,
								rules: [
									{required: true, message: '请输入18位管理员身份证号码'},
									{validator: checkIDNum}
								],
							})(
								<Input type="text" placeholder="请输入18位管理员身份证号码" size="large"
								       maxLength={18} disabled={companyNick} />
							)}
						</FormItem>
						<FormItem>
							<div style={{width: '300px', marginLeft: '254px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="h3 mt3" style={{height: '50px'}}>提交</Button>
							</div>
						</FormItem>
					</Form>
					<section>
						<Modal visible={appealTip}
						       okText='复制信息'
						       cancelText='关闭窗口'
						       centered
						       closable={false}
						       onOk={this.copyAppeal}
						       onCancel={() => {
							       this.setState({appealTip: false})
						       }}
						>
							<div style={{paddingLeft: '40px'}}>
								<h3 className="mt4 text-grey">如您的公司信息被冒用，请按以下方式进行申诉：</h3>
								<p className="mt2">请提供以下证明材料，邮寄至zhujiangshi@civil-data.com：</p>
								<p>1、公司名称；</p>
								<p>2、营业执照扫描件盖公章；</p>
								<p>3、公司联系电话；</p>
								<p>4、您的姓名，身份证号码；</p>
								<p>5、您的身份证扫描件；</p>
								<p>6、您的手机号（需已注册本APP，并已进行个人身份认证）；</p>
								<p>7、您的在职证明（劳动合同、名片、工牌等）；</p>
								<p className="mt4">收到您的邮件后，平台会在2-3个工作日内处理！</p>
							</div>
						</Modal>
						<Modal visible={this.state.isAuther}
						       centered
						       closable={false}
						       footer={[
							       <Button key="back" onClick={() => this.setState({isAuther: false})}>我知道了</Button>,
						       ]}
						>
							<div className="text-grey text-center">
								<p className="mt2">该公司已在平台进行了企业认证，您可联系管理员添加您为员工账号</p>
								<p>如发现公司信息被冒用，可进行申诉</p>
							</div>
						</Modal>
						<Modal visible={this.state.errorAuther}
						       centered
						       closable={false}
						       width={420}
						       footer={[
							       <Button key="back" onClick={() => this.setState({errorAuther: false})}>关闭</Button>,
						       ]}
						>
							<div className="text-grey prl4 text-center">
								<h2 className="mt2 ">认证失败！</h2>
								<p className="mt2">失败原因:{this.state.errorReason}</p>
							</div>
						</Modal>
						<Modal visible={this.state.successAuther}
						       centered
						       closable={false}
						       width={420}
						       footer={[
							       <Button key="back" onClick={this.closeModal}>关闭</Button>,
						       ]}
						>
							<div className="text-grey prl4">
								<h2 className="mt2 text-center">认证成功！</h2>
								<p className="mt2"> 您将获得：每天20次的免费询价次数</p>
								<p> (已注册商家中心的用户除外)</p>
								<p> 添加多个员工账号权限；</p>
								<p> 询价和下采购单还有额外积分奖励哦~</p>
							</div>
						</Modal>
					</section>
				</section>
			</Layout>
		)
	}
}

const DepthAutherForm = Form.create()(DepthAuther);
export default DepthAutherForm
