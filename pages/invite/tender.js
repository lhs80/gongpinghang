import React, {Component} from 'react';
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/invite'
import {Form, Radio, Input, Button, Row, Col, Divider, Upload, Table, Select, message, Modal, Icon} from 'antd';
import Province from 'components/Province/'
import {validatePhone, unzeronumber} from 'config/regular'
import moment from 'moment';
import cookie from 'react-cookies';
import {AddTenderFun, inviteDetailFun} from 'inviteApi'
import {userCodeFun} from 'server'
import {baseUrl} from '../../config/evn';

const {Column} = Table;
const {Option} = Select;

class TenderAdd extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			years: [],
			isLt10M: false,
			fileCountIsLt10: false,
			isValidate: true,
			fileList: [],//附件列表
			userInfo: {
				companyName: '',//招标单位
				legalName: '',
				licenseNo: '',
			},
			otherFeeList: [{     //标的物明细
				key: '',
				value: 0
			}],
		}
	}

	componentDidMount() {
		this.queryUserInfo();
		this.queryInviteInfo();
		this.getYear();
	}

	componentDidUpdate(prevProps) {
		const {query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryUserInfo();
			this.queryInviteInfo();
		}
	}

	//查询当前用户相关信息
	queryUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		/*----获取买家身份与公司名称----*/
		userCodeFun(params).then(res => {
			const {userInfo} = this.state;
			userInfo.companyName = res.data.companyName;
			userInfo.legalName = res.data.legalName;
			userInfo.licenseNo = res.data.licenseNo;
			userInfo.name = res.data.name;
			userInfo.mobile = res.data.mobile;
			this.setState({
				userInfo
			});
		});
	};

	//查询招标公告相关信息
	queryInviteInfo = () => {
		let params = {
			invitationId: this.props.router.query.id
		};
		inviteDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					detail: res.data
				})
			} else {
				console.log(res.msg)
			}
		}).catch(error => {
			console.log(error)
		})
	};

	//添加标的物
	addOtherFeeList = () => {
		let {otherFeeList} = this.state;
		otherFeeList.push({
			key: '',
			value: 0
		});
		this.setState({
			otherFeeList
		})
	};

	//删除标的物
	delMaterial = (index) => {
		let {materials} = this.state;
		if (materials.length < 2) return false;
		materials.splice(index, 1);
		this.setState({
			materials
		})
	};

	//保存
	addInvite = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			let attachment = [];
			if (!err) {
				let self = this;
				this.state.fileList.forEach(item => {
					attachment.push({...item.response.data[0]})
				});
				let params = {
					...this.state.userInfo,
					...this.props.form.getFieldsValue(),
					userCode: this.userCode,
					bidId: this.props.router.query.id,
					attachment
				};
				AddTenderFun(params).then(res => {
					if (res.result === 'success') {
						Modal.confirm({
							title: '提示',
							content: '发布成功！你可在”招投标-我的投标“中找到。',
							cancelButtonProps: {style: {display: 'none'}},
							okText: '我知道啦!',
							onOk() {
								Router.push({pathname: '/invite/detail', query: {id: self.props.router.query.id}})
							},
						});
					} else {
						message.error(res.msg)
					}
				}).catch(error => {
					console.log(error)
				})
			}
		});
	};

	//修改单价
	changeUnitPrice = (e, index) => {
		const {detail, otherFeeList} = this.state;
		detail.materials[index].unitPrice = e.target.value;
		detail.materials[index].totalPrice = detail.materials[index].quantity * e.target.value;
		this.setState({
			detail
		}, () => {
			let materialAmount = 0, otherAmount = 0;
			detail.materials.forEach(item => {
				materialAmount += Number(item.totalPrice || 0)
			});
			otherFeeList.forEach(item => {
				otherAmount += parseFloat(item.value)
			});

			this.props.form.setFieldsValue({
				bidAmount: materialAmount,
				finalOffer: Number(materialAmount + otherAmount - this.props.form.getFieldValue('discountAmount')),
			})
		})
	};

	changeDisCountAmount = (e) => {
		const {detail, otherFeeList} = this.state;
		let materialAmount = 0, otherAmount = 0;
		detail.materials.forEach(item => {
			materialAmount += Number(item.totalPrice)
		});
		this.props.form.getFieldValue('otherFeeList').forEach(item => {
			otherAmount += Number(item.value) || 0
		});
		this.props.form.setFieldsValue({
			bidAmount: materialAmount || 0,
			finalOffer: Number(materialAmount + otherAmount - e.target.value),
		})
	};

	changeOtherFee = (e) => {
		const {detail} = this.state;
		let materialAmount = 0, otherAmount = 0;
		detail.materials.forEach(item => {
			materialAmount += Number(item.totalPrice)
		});
		materialAmount = materialAmount ? materialAmount : 0;
		this.props.form.getFieldValue('otherFeeList').forEach(item => {
			otherAmount += Number(item.value || 0)
		});

		this.props.form.setFieldsValue({
			bidAmount: materialAmount || 0,
			finalOffer: Number(materialAmount + otherAmount - this.props.form.getFieldValue('discountAmount')),
		})
	};

	setFileList = (info) => {
		// setTimeout(() => {
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
		// }, 500)
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

	//抹零金额是否大于标的物总价
	checkDiscountIsGTMaterial = (rule, phonenum, callback) => {
		let discountAccount = this.props.form.getFieldValue('discountAmount');
		let materialAmount = 0;
		this.state.detail.materials.forEach(item => {
			materialAmount += Number(item.totalPrice)
		});
		if (discountAccount >= materialAmount) {
			callback('抹零金额不可大于标的物总价')
		} else {
			callback();
		}
	};


	//检测注册资金
	checkRegisterMoney = (rule, value, callback) => {
		if (value === '0') {
			callback('注册资金不能是0！')
		} else {
			callback()
		}
	};

	//检查单价
	checkUnitPrice = (rule, value, callback) => {
		if (value === '0') {
			callback('单价不能是0！')
		} else {
			callback()
		}
	};

	getYear = () => {
		let beginYear = (new Date()).getFullYear();
		let years = [];
		for (let i = beginYear; i > 1950; i--) {
			years.push(i);
		}
		this.setState({
			years
		})
	};

	//删除附件
	removeFile = (file) => {
		this.setState({
			isLt10M: true,
			fileCountIsLt10: true
		})
	};


	render() {
		const {userInfo, isValidate, detail, otherFeeList} = this.state;

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
			<Layout title='发布投标' menuIndex={'invite'}>
				<section className="bg-white ptb4 mt2">
					<div className="large text-grey prl6">填写投标内容</div>
					<div className="h3 mt1 text-muted prl6">您正在为"{detail ? detail.title : ''}"填写投标文件</div>

					<Form {...formItemLayout} colon={false} onSubmit={this.addInvite} className="mt4 form-invite">
						<Form.Item className="h4 text-grey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} />
								<b>公司信息</b>
							</div>
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label="公司名称" className="text-black">{userInfo.companyName}</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="法人姓名" className="text-black">{userInfo.legalName}</Form.Item>
							</Col>
						</Row>
						<Form.Item label="社会信息代码" className="text-black">{userInfo.licenseNo}</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label="企业性质">
									{getFieldDecorator('companyNature', {
										rules: [
											{required: true, message: '请选择企业性质'}
										]
									})(
										<Select style={{width: '100%'}} size="large" placeholder="请选择">
											<Option value='私营企业'>私营企业</Option>
											<Option value='联营企业'>联营企业</Option>
											<Option value='中外合资企业'>中外合资企业</Option>
											<Option value='港澳台合资企业'>港澳台合资企业</Option>
											<Option value='其他外商投资企业'>其他外商投资企业</Option>
											<Option value='其他'>其他</Option>
										</Select>
									)}
								</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="主营业务">
									{getFieldDecorator('businessType', {
										rules: [
											{required: true, message: '请选择主营业务'}
										]
									})(
										<Select style={{width: '95%'}} size="large" placeholder="请选择">
											<Option value='加工制造类'>加工制造类</Option>
											<Option value='贸易类'>贸易类</Option>
											<Option value='工程施工类'>工程施工类</Option>
											<Option value='设计类'>设计类</Option>
											<Option value='综合类'>综合类</Option>
											<Option value='其他'>其他</Option>
										</Select>
									)}
								</Form.Item>
							</Col>
						</Row>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label="注册资金">
									{getFieldDecorator('registeredCapital', {
										rules: [
											{required: isValidate, message: '请输入注册资金!'},
											{max: 10, message: '最多10个字符!'},
											{validator: this.checkRegisterMoney}
										],
									})(
										<Input size="large" placeholder='0' suffix="万元" />
									)}
								</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="一般纳税人">
									{getFieldDecorator('generalTaxpayer', {
										initialValue: 1,
									})(
										<Radio.Group>
											<Radio value={1}>是</Radio>
											<Radio value={0}>否</Radio>
										</Radio.Group>
									)}
								</Form.Item>
							</Col>
						</Row>
						<Row>
							<Col span={10} style={{marginLeft: '9.666666%'}}>
								<Form.Item label="成立时间">
									{getFieldDecorator('establishedTime', {
										rules: [
											{required: true, message: '请选择成立时间'}
										]
									})(
										<Select style={{width: '100%'}} size="large" placeholder="请选择">
											{this.state.years.map((item, index) => {
												return <Option value={item} key={index}>{item}</Option>
											})}
										</Select>
									)}
								</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="经营期至">
									{getFieldDecorator('operationPeriod', {
										rules: [{required: isValidate, message: '请输入经营期至!'}],
									})(
										<Input size="large" placeholder='请输入经营期至' style={{width: '95%'}} suffix="年" />
									)}
								</Form.Item>
							</Col>
						</Row>
						<Form.Item label="公司地址">
							<Province isValidate={isValidate} form={this.props.form} province={'province'} city={'city'} area={'area'} />
						</Form.Item>
						<Form.Item label="详细地址">
							{getFieldDecorator('address', {
								rules: [{required: isValidate, message: '请输入详细地址'}, {max: 50, message: '最多50个字符!'}],
							})(
								<Input size="large" placeholder='请输入详细地址' />
							)}
						</Form.Item>
						<Form.Item label='公司简介'>
							{getFieldDecorator('introduction', {
								rules: [
									{required: isValidate, message: '请输入公司简介!'},
									{max: 1000, message: '最多1000个字符'}
								],
							})(
								<Input.TextArea size="large" placeholder='请输入请输入公司简介' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Row>
							<Col span={10} style={{marginLeft: '9.666%'}}>
								<Form.Item label='联系人'>
									{getFieldDecorator('contacts', {
										initialValue: userInfo.name,
										rules: [
											{required: isValidate, message: '请输入联系人姓名!'},
											{max: 10, message: '联系人最多10个字符!'},
										],
									})(
										<Input size="large" placeholder='请输入联系人姓名' />
									)}
								</Form.Item>
							</Col>
							<Col span={11}>
								<Form.Item label="联系电话">
									{getFieldDecorator('mobile', {
										initialValue: userInfo.mobile,
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
						<Form.Item label="是否联合投标">
							{getFieldDecorator('jointBidding', {
								initialValue: 1,
								rules: [{required: isValidate, message: '是否联合投标!'}],
							})(
								<Radio.Group>
									<Radio value={1}>是</Radio>
									<Radio value={0}>否</Radio>
								</Radio.Group>
							)}
						</Form.Item>
						{
							this.props.form.getFieldValue('jointBidding') ?
								<Form.Item label='联合投标说明'>
									{getFieldDecorator('jointBiddingDescription', {
										rules: [
											{required: this.props.form.getFieldValue('jointBidding'), message: '请输入联合投标说明!'},
											{max: 1000, message: '最多1000个字符'}
										],
									})(
										<Input.TextArea size="large" placeholder='请输入招标单位对款项支付的说明' autosize={{minRows: 3}} style={{resize: 'none'}} />
									)}
								</Form.Item>
								:
								''
						}
						<Form.Item className="h4 text-grey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>报价信息</b>
							</div>
						</Form.Item>
						<div style={{paddingLeft: '10.66666%', marginBottom: '30px'}}>
							{
								detail ?
									<Table bordered dataSource={detail.materials} pagination={false} className="mt1" style={{width: '90.5%'}}
									       rowkey={record => record.invitationId}>
										<Column
											width={120}
											align='center'
											title='标的物名称'
											dataIndex="materialsName"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].materialsName`, {
														initialValue: record.materialsName,
													})(
														<Input size="large" style={{width: '120px', border: 'none'}} className="text-center" readOnly />
													)}
												</Form.Item>
											)}
										/>
										<Column
											width={120}
											align='center'
											title='规格型号'
											dataIndex="specsModels"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].specsModels`, {
														initialValue: record.specsModels,
													})(
														<Input size="large" style={{width: '120px', border: 'none'}} className="text-center" readOnly />
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
													{getFieldDecorator(`materials[${index}].quantity`, {
														initialValue: record.quantity,
													})(
														<Input size="large" style={{width: '120px', border: 'none'}} className="text-center" readOnly />
													)}
												</Form.Item>
											)}
										/>
										<Column
											align='center'
											width={100}
											title='单位'
											dataIndex="unit"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].unit`, {
														initialValue: record.unit,
													})(
														<Input size="large" style={{width: '100px', border: 'none'}} className="text-center" readOnly />
													)}
												</Form.Item>
											)}
										/>
										<Column
											width={100}
											align='center'
											title='备注'
											dataIndex="remark"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].remark`, {
														initialValue: record.remark ? record.remark : '--',
													})(
														<Input size="large" style={{width: '100px', border: 'none'}} className="text-center" readOnly />
													)}
												</Form.Item>
											)}
										/>
										<Column
											width={100}
											align='center'
											title='单价'
											dataIndex="unitPrice"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].unitPrice`, {
														// initialValue: '0',
														rules: [
															{required:true,message:'请输入单价'},
															{pattern: unzeronumber, message: '请输入正确的单价！'},
															{max: 6, message: '最多6个字符'},
															{validator: this.checkUnitPrice}
														]
													})(
														<Input size="large" style={{width: '100px'}} onChange={(e) => this.changeUnitPrice(e, index)} placeholder='0' />
													)}
												</Form.Item>
											)}
										/>
										<Column
											align='center'
											width={100}
											title='小计'
											dataIndex="totalPrice"
											render={(text, record, index) => (
												<Form.Item style={{marginBottom: '0'}}>
													{getFieldDecorator(`materials[${index}].totalPrice`, {
														initialValue: record.totalPrice ? record.totalPrice : 0,
													})(
														<Input size="large" style={{width: '100px', border: 'none'}} className="text-center" readOnly />
													)}
												</Form.Item>
											)}
										/>
									</Table>
									:
									''
							}
						</div>
						<Form.Item label='标的物合计'>
							{getFieldDecorator('bidAmount')(
								<Input size="large" placeholder='0' suffix="元" readOnly style={{width: '120px'}} className="input-border-none" />
							)}
						</Form.Item>
						<Form.Item label='其他费用'>
							<Button type="primary" onClick={this.addOtherFeeList} className="bg-primary-linear text-white border-radius">点击添加</Button>
							<Table bordered dataSource={otherFeeList} pagination={false} className="mt1">
								<Column
									align='center'
									title='费用名称'
									dataIndex="key"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`otherFeeList[${index}].key`, {
												rules: [
													{max: 30, message: '最多30个字符！'}
												]
											})(
												<Input size="large" placeholder="请输入费用名称" />
											)}
										</Form.Item>
									)}
								/>
								<Column
									align='center'
									title='费用金额(元)'
									dataIndex="value"
									render={(text, record, index) => (
										<Form.Item style={{marginBottom: '0'}}>
											{getFieldDecorator(`otherFeeList[${index}].value`, {
												rules: [
													{max: 20, message: '最多20个字符！'},
													{pattern: unzeronumber, message: '请输入正确的数量！'}
												]
											})(
												<Input size="large" onBlur={this.changeOtherFee} placeholder="请输入费用金额" />
											)}
										</Form.Item>
									)}
								/>
							</Table>
						</Form.Item>
						<Form.Item label="抹零金额">
							{getFieldDecorator('discountAmount', {
								initialValue: 0,
								rules: [
									{pattern: unzeronumber, message: '请输入正确的抹零金额！'},
									{validator: this.checkDiscountIsGTMaterial}
								]
							})(
								<Input size="large" placeholder='请输入对报价方式的要求' onChange={this.changeDisCountAmount} suffix="元" />
							)}
						</Form.Item>
						<Form.Item label="最终报价">
							{getFieldDecorator('finalOffer', {
								initialValue: 0
							})(
								<Input size="large" readOnly suffix="元" className="input-border-none" style={{width: '120px'}} />
							)}
						</Form.Item>
						<Form.Item label='费用说明'>
							{getFieldDecorator('expenseExplanation', {
								rules: [
									{max: 1000, message: '最多1000个字符！'}
								]
							})(
								<Input.TextArea size="large" placeholder='请输入费用说明' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Form.Item label='备注'>
							{getFieldDecorator('remark', {
								rules: [
									{max: 1000, message: '最多1000个字符！'}
								]
							})(
								<Input.TextArea size="large" placeholder='请输入备注' autosize={{minRows: 3}} style={{resize: 'none'}} />
							)}
						</Form.Item>
						<Form.Item className="h4 text-grey" style={{marginLeft: '5%'}}>
							<div className="mt1">
								<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} /> <b>附件</b>
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
								<Button type="primary" disabled={this.state.isLoadFile} className="text-white bg-primary-linear border-radius">
									<Icon type={this.state.isLoadFile ? 'loading' : 'plus'} /><span style={{verticalAlign: 'middle'}}> 点击上传</span>
								</Button>
								<span className="h5 text-muted prl1">还可添加{10 - this.state.fileList.length}件</span>
							</Upload>
						</Form.Item>
						<div className="text-muted h6 text-center mt2">
							工品行温馨提示：请按照招标文件要求及时提交纸质投标资料。开标之后招标方方可查看您的投标信息。如有疑问，请联系客服电话 400-893-8990
						</div>
						<div className='prl8 text-center mt4'>
							<Button type='primary' style={{width: '120px'}} size='large' htmlType='submit' className='bg-primary-linear border-radius'>提交</Button>
							<Button size="large"
							        style={{width: '120px', marginLeft: '20px'}}
							        className="border-radius"
							        onClick={() => {
								        Router.push({pathname: '/invite/detail', query: {id: this.props.router.query.id}})
							        }}
							>返回</Button>
						</div>
					</Form>
				</section>
			</Layout>
		);
	}
}

const TenderAddForm = Form.create()(TenderAdd);

export default withRouter(TenderAddForm);
