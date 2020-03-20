import React, {Component} from 'react';
import Layout from 'components/Layout/invite'
import {Form, Radio, Input, Button, DatePicker, InputNumber, Row, Col, Divider, Upload, Icon, Table, Avatar, Modal, message} from 'antd';
import Province from 'components/Province/'
import {validatePhone, unzeronumber} from 'config/regular'
import moment from 'moment';
import cookie from 'react-cookies';
import {AddInviteFun} from 'inviteApi'
import {userCodeFun} from 'server'
import {baseUrl} from '../../config/evn';
import Router from 'next/router'
import './style.less'
//import locale from 'antd/lib/date-picker/locale/zh_CN'

const {Column} = Table;

class InviteAdd extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			isLt10M: false,
			fileCountIsLt10: false,
			companyImage: '',
			projectImage: '',
			endTime: '',
			calibrationTime: '',
			planTime: '',
			isValidate: true,
			isLoadFile: false,
			detail: {
				companyName: '',//招标单位
				form: '公开招标',       //招标形工
			},
			materials: [{     //标的物明细
				key: 0,
				materialsName: '',
				specsModels: '',
				quantity: '',
				unit: '',
				remark: '',
			}],
			fileList: [],//附件列表
			count: 1,
		}
	}

	componentDidMount() {
		this.queryUserInfo();
	}

	queryUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		/*----获取买家身份与公司名称----*/
		userCodeFun(params).then(res => {
			const {detail} = this.state;
			detail.companyName = res.data.companyName;
			this.setState({
				detail
			});
		});
	};

	//添加标的物
	addMaterial = () => {
		let {materials, count} = this.state;
		materials.push({
			//key: materials.length,
			key: count,
			materialsName: '',
			specsModels: '',
			quantity: '',
			unit: '',
			remark: '',
		});
		this.setState({
			materials,
			count: count + 1
		})
	};

	//删除标的物
	delMaterial = (index) => {
		let {materials} = this.state;
		if (materials.length < 2) return false;
		this.setState({
			materials: materials.filter(item => item.key !== index)
		})
	};

	setCompanyImage = (file) => {
		if (file.file.status === 'done') {
			let {data} = file.file.response;
			this.setState({
				companyImage: data.list[0]
			});
		}
	};

	//设置截标日期
	setEndTime = (date, dateString) => {
		this.setState({
			endTime: dateString
		});
	};

	//设置定标日期
	setCalibrationTime = (date, dateString) => {
		this.setState({
			calibrationTime: dateString
		});
	};

	//设置预计进场日期
	setPlanTime = (date, dateString) => {
		this.setState({
			planTime: dateString
		});
	};

	setProjectImage = (file) => {
		if (file.file.status === 'done') {
			let {data} = file.file.response;
			this.setState({
				projectImage: data.list[0]
			});
		}
	};

	//准备保存
	todoAddInvite = (e) => {
		e.preventDefault();
		let self = this;
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let diffDate = moment().diff(this.state.endTime, 'days');
				if (Math.abs(diffDate) <= 20) {
					Modal.confirm({
						title: '提示',
						content: '距离截止日期不足二十日，是否确定发布？',
						okText: '确定',
						cancelText: '取消',
						onOk: () => {
							self.addInvite();
						}
					})
				} else {
					this.addInvite();
				}
			} else {
				console.log(err)
			}
		});
	};

	addInvite = () => {
		let fileList = [];
		this.state.fileList.forEach(item => {
			fileList.push({...item.response.data[0]})
		});
		let formValue = this.props.form.getFieldsValue();
		let materials = this.props.form.getFieldValue('materials');
		delete formValue.materials;
		let params = {
			...this.state.detail,
			...formValue,
			materials: materials.filter((n) => {
				return n
			}),
			//...this.props.form.getFieldsValue(),
			companyImage: this.state.companyImage,
			projectImage: this.state.projectImage,
			endTime: this.state.endTime,
			calibrationTime: this.state.calibrationTime,
			planTime: this.state.planTime,
			userCode: this.userCode,
			documentState: 1,
			attachmentList: fileList
		};
		AddInviteFun(params).then(res => {
			if (res.result === 'success') {
				Modal.confirm({
					title: '提示',
					content: '发布成功！你可在”招投标-我的招标“中找到本标书',
					cancelButtonProps: {style: {display: 'none'}},
					okText: '我知道啦!',
					onOk: () => {
						Router.push('/invite/home')
					}
				});
			} else {
				console.log(res.msg)
			}
		}).catch(error => {
			console.log(error)
		})
	};

	//保存草稿
	addInviteByDraft = (e) => {
		e.preventDefault();
		this.setState({
			isValidate: false
		}, () => {
			let fileList = [];
			this.state.fileList.forEach(item => {
				fileList.push({...item.response.data[0]})
			});
			this.props.form.validateFieldsAndScroll((err, values) => {
				let formValue = this.props.form.getFieldsValue();
				let materials = this.props.form.getFieldValue('materials');
				delete formValue.materials;
				if (!err) {
					let params = {
						...this.state.detail,
						...formValue,
						materials: materials.filter((n) => {
							return n
						}),
						companyImage: this.state.companyImage,
						projectImage: this.state.projectImage,
						endTime: this.state.endTime,
						calibrationTime: this.state.calibrationTime,
						planTime: this.state.planTime,
						userCode: this.userCode,
						documentState: 0,
						attachmentList: fileList
					};
					AddInviteFun(params).then(res => {
						if (res.result === 'success') {
							Modal.confirm({
								title: '提示',
								content: '发布成功！你可在”招投标-我的招标-草稿“中找到本标书',
								cancelButtonProps: {style: {display: 'none'}},
								okText: '我知道啦!',
								onOk: () => {
									Router.push('/invite/home')
								}
							});
						} else {
							console.log(res.msg)
						}
					}).catch(error => {
						console.log(error)
					})
				}
			});
		});
	};

	setFileList = (info) => {
		const {isLt10M, fileCountIsLt10} = this.state;
		if (isLt10M && fileCountIsLt10) {
			let fileList = [...info.fileList];
			fileList = fileList.map(file => {
				if (file.response) {
					file.url = file.response.url;
				}
				return file;
			});

			this.setState({fileList});
		}
	};

	checkFileSize = (file) => {
		const isLt10M = file.size / (1024 * 1024) < 10;
		const fileCountIsLt10 = this.state.fileList.length < 10;
		if (!isLt10M) {
			message.error('不能上传超过10M的文件！')
		}

		if (!fileCountIsLt10) {
			message.error('最多上传10个文件！')
		}

		this.setState({
			isLt10M,
			fileCountIsLt10
		}, () => {
			return isLt10M && fileCountIsLt10;
		});
	};

	disabledDate = (current) => {
		let objDate = moment();
		if (this.props.form.getFieldValue('endTime')) {
			objDate = moment(this.props.form.getFieldValue('endTime')).add(1, 'day');
		}
		return current && (current.valueOf() <= objDate);
	};

	endTimeDisabledDate = (current) => {
		let objDate = moment();
		return current && (current.valueOf() <= objDate);
	};

	setReceiverAddress = () => {
		let provine = this.props.form.getFieldValue('projectProvince');
		let city = this.props.form.getFieldValue('projectCity');
		let area = this.props.form.getFieldValue('projectArea');
		this.props.form.setFieldsValue({
			receiverProvince: provine,
			receiverCity: city,
			receiverArea: area
		})
	};

	checkDbDateIsLtEndTime = (rule, value, callback) => {
		let endTime = this.props.form.getFieldValue('endTime');
		let calibrationTime = this.props.form.getFieldValue('calibrationTime');
		if (calibrationTime <= endTime) {
			callback('定标日期不可以在截标日期之前！')
		} else {
			callback();
		}
	};


	checkPlanTimeIsLtEndTime = (rule, value, callback) => {
		let endTime = this.props.form.getFieldValue('endTime');
		let planTime = this.props.form.getFieldValue('planTime');
		if (planTime <= endTime) {
			callback('预计进场日期不可以在截标日期之前！')
		} else {
			callback();
		}
	};

	//检查数量
	checkMaterialNum = (rule, value, callback) => {
		if (value === '0') {
			callback('数量不能为0！')
		} else {
			callback()
		}
	};

	//删除附件
	removeFile = (file) => {
		this.setState({
			isLt10M: true,
			fileCountIsLt10: true
		})
	};

	render() {
		const {detail, materials, companyImage, projectImage, isValidate} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 4},
			},
			wrapperCol: {
				xs: {span: 18},
			},
		};
		const {getFieldDecorator} = this.props.form;
		return (
			<Layout title='发布招标' menuIndex={'invite'}>
				<div className='bg-invite' />
				<section className="bg-white ptb4" style={{zIndex: '9', position: 'relative', marginTop: '200px'}}>
					<div className="large text-grey prl6">填写招标公告</div>
					<Form {...formItemLayout} colon={false} onSubmit={this.todoAddInvite} className="mt4">
						<Form.Item label="招标类型">
							{getFieldDecorator('invitationType', {
								initialValue: 0,
								rules: [{required: isValidate, message: 'Please input your username!'}],
							})(
								<Radio.Group>
									<Radio value={0}>采购招标</Radio>
									<Radio value={1}>施工招标</Radio>
									<Radio value={2}>设备租赁</Radio>
									<Radio value={3}>劳务分包</Radio>
								</Radio.Group>
							)}
						</Form.Item>
						<Form.Item className="h4 text-darkgrey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>基本信息</b>
							</div>
						</Form.Item>
						<Form.Item label="招标标题">
							{getFieldDecorator('title', {
								rules: [
									{required: true, message: '请输入招标名称!'},
									{max: 30, message: '最多30个字符!'},
									{whitespace: true, message: '请输入招标名称!'},
								],
							})(
								<Input size="large" placeholder="请输入招标名称" />
							)}
						</Form.Item>
						<Form.Item label="招标单位">
							{detail.companyName}
						</Form.Item>
						<Form.Item label="集团单位">
							{getFieldDecorator('conglomerateName', {
								rules: [
									{max: 30, message: '最多30个字符!'},
								],
							})(
								<Input size="large" placeholder='请输入集团单位名称' />
							)}
						</Form.Item>
						<Form.Item label="项目名称">
							{getFieldDecorator('projectName', {
								rules: [
									{required: isValidate, message: '请输入项目名称'},
									{max: 30, message: '最多30个字符!'},
									{whitespace: true, message: '请输入项目名称!'},
								],
							})(
								<Input size="large" placeholder='请输入项目名称' />
							)}
						</Form.Item>
						<Form.Item label="项目地址">
							<Province isValidate={isValidate} form={this.props.form} province={'projectProvince'}
							          city={'projectCity'}
							          area={'projectArea'}
							          clearAddressValue={this.clearAddressValue}
							/>
						</Form.Item>
						<Form.Item label="详细地址">
							{getFieldDecorator('projectAddress', {
								rules: [{required: isValidate, message: '请输入详细地址'},
									{max: 30, message: '最多30个字符!'},
									{whitespace: true, message: '请输入详细地址!'},
								],
							})(
								<Input size="large" placeholder='请输入详细地址' />
							)}
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}><Form.Item label="截标日期">
								{getFieldDecorator('endTime', {
									rules: [{required: isValidate, message: '请输入定标日期'}],
								})(
									<DatePicker
										showTime
										showToday={false}
										format="YYYY-MM-DD HH时"
										placeholder="年/月/日/时"
										size="large"
										style={{width: '100%'}}
										onChange={this.setEndTime}
										//locale={locale}
										disabledDate={this.endTimeDisabledDate}
									/>
								)}
							</Form.Item></Col>
							<Col span={11}>
								<Form.Item label="定标日期">
									{getFieldDecorator('calibrationTime', {
										rules: [
											{required: isValidate, message: '请输入定标日期'},
											{validator: this.checkDbDateIsLtEndTime}
										],
									})(
										<DatePicker
											showTime
											showToday={false}
											format="YYYY-MM-DD HH时"
											placeholder="年/月/日/时"
											size="large"
											style={{width: '95%'}}
											disabledDate={this.disabledDate}
											onChange={this.setCalibrationTime}
											//locale={locale}
										/>
									)}
								</Form.Item></Col>
						</Row>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}><Form.Item label="保证金">
								{getFieldDecorator('margin', {
									rules: [
										{required: isValidate, message: '请输入保证金'},
										{pattern: /^\d+$/, message: '不可输入负数和小数点'},
									]
								})(
									<Input size="large" placeholder='0' suffix="元" />
								)}
							</Form.Item></Col>
							<Col span={10}>
								<Form.Item label="招标形式">
									<span>{detail.form}<i className="text-muted prl1 h6">目前仅支持公开招标</i></span>
								</Form.Item>
							</Col>
						</Row>
						<Form.Item label="预计进场日期">
							{getFieldDecorator('planTime', {
								rules: [
									{required: isValidate, message: '请输入预计进场日期!'},
									{validator: this.checkPlanTimeIsLtEndTime},
								],
							})(
								<DatePicker
									showToday={false}
									format="YYYY-MM-DD"
									placeholder="年/月/日"
									size="large"
									style={{width: '100%'}}
									disabledDate={this.disabledDate}
									onChange={this.setPlanTime}
									//locale={locale}
								/>
							)}
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label="增值税发票">
									{getFieldDecorator('isInvoice', {
										initialValue: 1,
									})(
										<Radio.Group>
											<Radio value={0}>需要</Radio>
											<Radio value={1}>不需要</Radio>
										</Radio.Group>
									)}
								</Form.Item>
							</Col>
							{
								this.props.form.getFieldValue('isInvoice') === 0 ?
									<Col span={10} style={{marginLeft: '4.666666%'}}>
										<Form.Item label="发票类型">
											{getFieldDecorator('invoiceType', {
												initialValue: '增值税普通发票',
											})(
												<Radio.Group>
													<Radio value='增值税普通发票'>增值税普通发票</Radio>
													<Radio value='增值税专用发票'>增值税专用发票</Radio>
												</Radio.Group>
											)}
										</Form.Item>
									</Col>
									:
									''
							}
						</Row>
						<Form.Item className="h4 text-darkgrey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>招标明细</b>
							</div>
						</Form.Item>
						<Form.Item label="标的物类型">
							{getFieldDecorator('materialType', {
								rules: [
									{required: isValidate, message: '请填写采购物资类型!'},
									{max: 30, message: '最多30个字符'},
									{whitespace: true, message: '请填写采购物资类型!'},
								],
							})(
								<Input size="large" placeholder='请填写采购物资类型！' />
							)}
						</Form.Item>
						<Form.Item label="标的物明细">
							<div className="text-right">
								<Button type='primary' className="bg-primary-linear border-radius" onClick={this.addMaterial}>添加标的物</Button>
							</div>
							<Table bordered dataSource={materials} pagination={false} className="mt1">
								<Column
									align='center'
									title='标的物名称'
									dataIndex="materialsName"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`materials[${record.key}].materialsName`, {
												initialValue: record.materialsName,
												rules: [
													{required: isValidate, message: `请输入名称!`},
													{max: 30, message: '最多30个字符'},
													{whitespace: true, message: '请输入名称!'},
												]
											})(
												<Input size="large"
												/>
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									title='规格型号'
									dataIndex="specsModels"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`materials[${record.key}].specsModels`, {
												initialValue: record['specsModels'],
												rules: [
													{max: 20, message: '最多20个字符'},
												]
											})(
												<Input size="large"
												/>
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									width={120}
									title='数量'
									dataIndex="quantity"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`materials[${record.key}].quantity`, {
												rules: [
													{required: isValidate, message: `请输入数量!`},
													{pattern: unzeronumber, message: '请输入正确的数量'},
													{max: 10, message: '最多10个字符'},
													{validator: this.checkMaterialNum}
												],
												initialValue: record['quantity'],
											})(
												<Input size="large"
												/>
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									width={150}
									title='单位'
									dataIndex="unit"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`materials[${record.key}].unit`, {
												rules: [
													{
														required: isValidate,
														message: `请输入单位!`,
													},
													{max: 5, message: '最多5个字符'},
													{whitespace: true, message: '请输入单位!'},
												],
												initialValue: record['unit'],
											})(
												<Input size="large"
												/>
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									title='备注'
									dataIndex="remark"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`materials[${record.key}].remark`, {
												initialValue: record['remark'],
												rules: [
													{max: 30, message: '最多30个字符'}
												],
											})(
												<Input size="large"
												/>
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									width={50}
									title='操作'
									render={(text, record, index) => (
										<Button type="link" onClick={() => this.delMaterial(record.key)} disabled={index === 0}>删除</Button>
									)}
								/>
							</Table>
						</Form.Item>
						<Form.Item label='报价方式'>
							{getFieldDecorator('quotingWay', {
								rules: [
									{required: isValidate, message: '请输入对报价方式的要求!'},
									{max: 50, message: '最多50个字符'},
									{whitespace: true, message: '请输入对报价方式的要求!'},
								],
							})(
								<Input size="large" placeholder='请输入对报价方式的要求' />
							)}
						</Form.Item>
						<Form.Item label='支付说明'>
							{getFieldDecorator('paymentInstructions', {
								rules: [
									{required: isValidate, message: '请输入招标单位对款项支付的说明!'},
									{max: 500, message: '最多500个字符'},
									{whitespace: true, message: '请输入招标单位对款项支付的说明!'},
								],
							})(
								<Input.TextArea size="large" placeholder='请输入招标单位对款项支付的说明' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label='需要送样'>
									{getFieldDecorator('isSpecimen', {
										initialValue: 1,
									})(
										<Radio.Group>
											<Radio value={1}>需要</Radio>
											<Radio value={0}>不需要</Radio>
										</Radio.Group>
									)}
								</Form.Item>
							</Col>
							<Col span={10} style={{marginLeft: '4.666666%'}}>
								<Form.Item label="送货上门">
									{getFieldDecorator('isDelivery', {
										initialValue: 1,
									})(
										<Radio.Group>
											<Radio value={1}>需要</Radio>
											<Radio value={0}>不需要</Radio>
										</Radio.Group>
									)}
								</Form.Item>
							</Col>
						</Row>
						<Form.Item label="收货地址">
							<Province form={this.props.form} province={'receiverProvince'} city={'receiverCity'} area={'receiverArea'} />
							<div onClick={this.setReceiverAddress} style={{cursor: 'pointer'}} className="text-primary">使用项目地址</div>
						</Form.Item>
						<Form.Item label='详细地址'>
							{getFieldDecorator('receiverAddress', {
								rules: [
									{required: isValidate, message: '请输入详细地址!'},
									{max: 50, message: '最多50个字符'},
									{whitespace: true, message: '请输入详细地址!'},
								],
							})(
								<Input size="large" placeholder='请输入详细地址' />
							)}
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666%'}}>
								<Form.Item label='联系人'>
									{getFieldDecorator('linkman', {
										rules: [
											{required: isValidate, message: '请输入联系人姓名!'},
											{whitespace: true, message: '请输入联系人姓名!'},
											{max: 10, message: '最多10个字符！'}
										],
									})(
										<Input size="large" placeholder='请输入联系人姓名' />
									)}
								</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="联系电话">
									{getFieldDecorator('phone', {
										rules: [
											{required: isValidate, message: '请输入联系电话!'},
											{validator: validatePhone, message: '请输入正确的联系电话'},
										],
									})(
										<Input size="large" placeholder='请输入联系电话' style={{width: '95%'}} />
									)}
								</Form.Item>
							</Col>
						</Row>
						<Form.Item className="h4 text-darkgrey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>招标人介绍</b>
							</div>
						</Form.Item>
						<Form.Item label='招标单位介绍'>
							{getFieldDecorator('companyDesc', {
								rules: [
									{required: isValidate, message: '请输入招标单位介绍!'},
									{max: 1000, message: '最多1000个字符!'},
									{whitespace: true, message: '请输入招标单位介绍!'},
								],
							})(
								<Input.TextArea size="large" placeholder='请输入招标单位介绍' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Form.Item label='单位代表图片'>
							<Upload
								className='avatar-uploader-invite'
								name='files'
								showUploadList={false}
								action={baseUrl + '/file/uploadImgMore'}
								beforeUpload={this.beforeUpload}
								onChange={this.setCompanyImage}
							>
								{
									companyImage ?
										<Avatar shape="square" src={baseUrl + companyImage} size={100} />
										:
										<div className="autherPic text-center">
											<Icon type="plus" className="avatar-uploader-trigger large mt2" />
											<p className="mt1">点击上传</p>
										</div>
								}
							</Upload>
						</Form.Item>
						<Form.Item label="项目介绍">
							{getFieldDecorator('projectDesc', {
								rules: [
									{required: isValidate, message: '请输入项目介绍!'},
									{max: 1000, message: '最多1000个字符!'},
									{whitespace: true, message: '请输入项目介绍!'},
								],
							})(
								<Input.TextArea size="large" placeholder='请输入项目介绍' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Form.Item label='项目代表图片'>
							<Upload
								className='avatar-uploader-invite'
								name='files'
								showUploadList={false}
								action={baseUrl + '/file/uploadImgMore'}
								onChange={this.setProjectImage}
							>
								{
									projectImage ?
										<Avatar shape="square" src={baseUrl + projectImage} size={100} />
										:
										<div className="autherPic text-center">
											<Icon type="plus" className="avatar-uploader-trigger large mt2" />
											<p className="mt1">点击上传</p>
										</div>
								}
							</Upload>
						</Form.Item>
						<Form.Item className="h4 text-darkgrey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>附件上传</b>
							</div>
						</Form.Item>
						<Form.Item label='附件'>
							<Upload
								action={baseUrl + '/file/fileUploadNew'}
								name='files'
								onChange={this.setFileList}
								beforeUpload={this.checkFileSize}
								fileList={this.state.fileList}
								onRemove={this.removeFile}
							>
								<Button disabled={this.state.isLoadFile} className="text-white bg-primary-linear border-radius" type="primary">
									<Icon type={this.state.isLoadFile ? 'loading' : 'plus'} /><span style={{verticalAlign: 'middle'}}> 点击上传</span>
								</Button>
								<span className="h5 text-muted prl1">还可添加{10 - this.state.fileList.length}件</span>
							</Upload>
						</Form.Item>
						<Form.Item className="h4 text-darkgrey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>其他事项</b>
							</div>
						</Form.Item>
						<Form.Item label='最少投标人数量' extra="截标时投标人数量低于本设置将自动流标。">
							{getFieldDecorator('minBidderNum', {
								initialValue: 3,
								rules: [
									{required: isValidate, message: '请输入最少投标人数量!'},
									{pattern: /^[1-9]\d*$/, message: '只能输入整数!'},
								],
							})(
								<InputNumber min={1} max={10} size='large' />
							)}
						</Form.Item>
						<div className='prl8 text-center'>
							<Button type='primary' style={{width: '120px'}} size='large' htmlType='submit' className='bg-primary-linear border-radius'>发布</Button>
							<Button type="primary"
							        size="large"
							        style={{width: '120px', marginLeft: '20px'}}
							        className="bg-primary-linear border-radius"
							        onClick={this.addInviteByDraft}
							>保存草稿</Button>
						</div>
					</Form>
				</section>
			</Layout>
		);
	}
}

const InviteAddForm = Form.create()(InviteAdd);

export default InviteAddForm;
