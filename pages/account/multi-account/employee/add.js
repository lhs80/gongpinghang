//新增收货地址
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Form, Select, Input, Row, Col, Button, Checkbox, Modal} from 'antd';
import {validatePhone, checkIDNum} from 'config/regular';
import {
	addEmployeeSendSmsCodeFun,
	queryAccountStateFun,
	addEmployeeAccountFun,
	checkIdentityFun
} from 'server'
import '../../style.less'
import cookie from 'react-cookies';

const FormItem = Form.Item;

class AddAddressForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			count: 60,
			isSmsSended: false,
			tipText: '发送验证码',
			isDisabled: false,//姓名和身份证是否可以输入
			showAgreeMent: false,//是否显示用户协议
			accountType: 0,//账号状态
		}
	}

	SendSmsCode = () => {
		let params = {
			mobile: this.props.form.getFieldValue('mobile'),
			userCode: this.userCode
		};
		addEmployeeSendSmsCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setTime();
				this.setState({
					isSmsSended: true,
				});
			}
		})
	}

	setTime() {
		let self = this;
		if (this.state.isSmsSended) return;
		let count = this.state.count;
		const timer = setInterval(function () {
			self.setState({
				count: (--count),
			});
			if (count === 0) {
				clearInterval(timer);
				self.setState({
					isSmsSended: false,
					count: 60,
					tipText: '重新发送'
				})
			}
		}, 1000);
	}

	checkUserName = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};

	/**
	 * 查询要添加账号的状态
	 * */
	queryAccountState = () => {
		queryAccountStateFun(this.props.form.getFieldValue('mobile')).then(res => {
			let self = this;
			if (res.result === 'success') {
				this.setState({
					accountType: res.data.type
				});
				switch (res.data.type) {
					//未注册
					case 1:
						if (!res.data.name) {
							this.props.form.setFieldsValue({username: ''});
							this.props.form.setFieldsValue({idCard: ''});
							this.setState({
								isDisabled: false,
							});
						}
						break;
					case 2:
						//已注册未关联
						if (res.data.name) {
							//已注册已认证
							this.props.form.setFieldsValue({username: res.data.name});
							this.props.form.setFieldsValue({idCard: res.data.idCard});
							this.setState({
								isDisabled: true,
							});
						} else {
							//已注册未认证
							this.props.form.setFieldsValue({username: ''});
							this.props.form.setFieldsValue({idCard: ''});
							this.setState({
								isDisabled: false,
							});
						}
						break;
					case 3:
						//已注册已关联
						Modal.warning({
							title: '提示',
							okText: '确定',
							content: (
								<div style={{lineHeight: '1.5'}}>
									该手机号已关联其他公司，不可重复关联！<br />
									需先解除同上家公司的关联
								</div>
							),
							onOk() {
								self.props.form.setFieldsValue({mobile: ''});
								self.props.form.setFieldsValue({username: ''});
								self.props.form.setFieldsValue({idCard: ''});
								self.setState({
									isDisabled: false,
								});
							},
						});
						break;
				}
			}
		})
	};
	/*--添加---*/
	addAccount = () => {
		let params = {
			userCode: this.userCode,
			mobile: this.props.form.getFieldValue('mobile'),
			name: this.props.form.getFieldValue('username'),
			idCard: this.props.form.getFieldValue('idCard'),
			verifyCode: this.props.form.getFieldValue('captchaCode')
		};
		addEmployeeAccountFun(params).then(res => {
			if (res.result === 'success') {
				Modal.info({
					title: '提示',
					okText: '确定',
					content: (
						<div>
							<p>
								添加成功，已短信通知该用户！
							</p>
						</div>
					),
					onOk() {
						Router.push('/account/multi-account/employee/list')
					},
				});

			} else {
				Modal.info({
					title: '提示',
					okText: '确定',
					content: (
						<div>
							{res.msg}
						</div>
					)
				});
			}
		})
	};
	/**
	 * 添加账号
	 * */
	addEmployeeAccount = () => {
		if (this.state.accountType === 3) {
			Modal.warning({
				title: '提示',
				okText: '确定',
				content: (
					<div>
						<p>
							该手机号已关联其他公司，不可重复关联！
						</p>
						<p>
							需先解除同上家公司的关联
						</p>
					</div>
				)
			});
			return;
		}
		let mobile = this.props.form.getFieldValue('mobile');
		let name = this.props.form.getFieldValue('username');
		let idCard = this.props.form.getFieldValue('idCard');
		let verifyCode = this.props.form.getFieldValue('captchaCode');
		if (mobile && name && idCard && verifyCode) {
			let data = {
				name: this.props.form.getFieldValue('username'),
				idNumber: this.props.form.getFieldValue('idCard')
			};
			checkIdentityFun(data).then(res => {
				if (res.result === 'success') {
					this.addAccount();
				} else {
					Modal.info({
						title: '提示',
						okText: '确定',
						content: (
							<div>
								{res.msg}
							</div>
						)
					});
				}
			})
		} else {
			this.addAccount();
		}
	};
	/*----添加账号提交表单---*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let data = {
					name: values.username,
					idNumber: values.idCard
				};
				checkIdentityFun(data).then(res => {
					if (res.result === 'success') {
						this.addAccount();
					} else {
						Modal.info({
							title: '提示',
							okText: '确定',
							content: (
								<div>
									{res.msg}
								</div>
							)
						});
					}
				})
			}
		})
	};

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
		const {isSmsSended, count, isDisabled} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 6},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 18},
			},
		};
		const tailFormItemLayout = {
			wrapperCol: {
				xs: {
					span: 24,
					offset: 0,
				},
				sm: {
					span: 18,
					offset: 6,
				},
			},
		};
		const ButtonGroup =
			isSmsSended
				?
				<Button size="large" type="primary" htmlType="button" block className="btn-sendCode h5"
				        ghost style={{height: '50px'}}>重新发送{count}s</Button>
				:
				<Button size="large" type="primary" htmlType="button" block className="btn-sendCode h5"
				        style={{height: '50px'}}
				        disabled={getFieldError('mobile') || !this.props.form.getFieldValue('mobile')}
				        ghost onClick={this.SendSmsCode}>{this.state.tipText}</Button>;

		return (
			<Layout title="添加账号--工品行"
			        mainMenuIndex={'setting'} menuIndex={'6'}>
				<section className="bg-white p4 addAddress" style={{height: '766px'}}>
					<section>
						<div className="h0 mt2 addTitle prl2 text-grey" style={{marginLeft: '250px'}}>添加账号</div>
						<div className="mt4" style={{width: '450px', margin: '0 auto'}}>
							<Form onSubmit={this.handleSubmit} className="myForm">
								<FormItem {...formItemLayout} label="手机号">
									{getFieldDecorator('mobile', {
										rules: [
											{required: true, message: '请输入手机号码(将作为登录账号使用)'},
											{validator: validatePhone}
										]
									})(
										<Input type="text" placeholder="请输入手机号码(将作为登录账号使用)" size="large" maxLength={11} onBlur={this.queryAccountState} />
									)}
								</FormItem>
								<FormItem {...formItemLayout} label="姓名">
									{getFieldDecorator('username', {
										rules: [
											{required: true, message: '请输入正确的姓名'},
											{validator: this.checkUserName}
										]
									})(
										<Input type="text" placeholder="请输入姓名" size="large" maxLength={11} disabled={isDisabled} />
									)}
								</FormItem>
								<FormItem {...formItemLayout} label="身份证">
									{getFieldDecorator('idCard', {
										rules: [
											{required: true, message: '请输入正确的身份证'},
											{validator: checkIDNum}
										]
									})(
										<Input type="text" placeholder="请输入身份证" size="large" maxLength={18} disabled={isDisabled} />
									)}
								</FormItem>
								<FormItem{...formItemLayout} label="短信验证码" className="detailAddress">
									{/*{getFieldDecorator('addressDetail', {*/}
									{/*rules: [*/}
									{/*{required: true, message: '请输入短信验证码'},*/}
									{/*]*/}
									{/*})(*/}
									<Row gutter={10}>
										<Col span={16}>
											{getFieldDecorator('captchaCode', {
												validateTrigger: 'onBlur',
												rules: [{required: true, message: '请输入手机验证码!'}],
											})(
												<Input maxLength={4} size="large" placeholder="请输入手机验证码" />
											)}
										</Col>
										<Col span={8}>
											{ButtonGroup}
										</Col>
									</Row>
									{/*)}*/}
								</FormItem>
								<FormItem {...tailFormItemLayout}>
									{getFieldDecorator('agreement', {
										valuePropName: 'checked',
									})(
										<div>
											<Checkbox onChange={this.onChangeDefault}>我已阅读并认同</Checkbox>
											<a className="text-primary" onClick={() => {
												this.setState({showAgreeMent: true})
											}}>《新增员工账号知情书》</a>
										</div>
									)}
								</FormItem>
								<FormItem {...tailFormItemLayout} className="mt3">
									<Button type="primary" size="large" htmlType="submit" block className="bg-primary-linear border-radius"
									        style={{height: '50px'}}
										//onClick={this.addEmployeeAccount}
										      disabled={!this.props.form.getFieldValue('agreement')}
									>添加</Button>
								</FormItem>
							</Form>
						</div>
					</section>
				</section>
				<Modal
					visible={this.state.showAgreeMent}
					title="新增员工账号知情书"
					onCancel={() => {
						this.setState({showAgreeMent: false})
					}}
					className="regModalAlert"
					footer={[
						<Button key="back" type="primary" size="large" onClick={() => {
							this.setState({showAgreeMent: false})
						}}>关闭</Button>,
					]}
				>
					<p>欢迎使用工品行平台多账号管理及其新增员工账号服务！</p>
					<p>请您认真阅读本协议，一旦完成添加即表示您已经知悉并了解本协议，接受本协议的条款约束，本协议当即具有合同效力。如您对本协议的任何条款表示异议，您应当选择不使用本网站。</p>
					<p>员工账号，是指工品行平台（以下称本平台）为企业提供的多账号功能的服务，企业用户完成本平台的企业深度认证之后，本平台向企业用户提供添加多账号功能，即企业可增加多名员工账号可于本平台发起询价、采购以及线上签订电子合同（开发中）的权限。每个账号对应一个员工账号。作为所在企业的合法委托授权人，其在本平台的一切与所在企业相关的活动均代表其公司，与其公司的行为具有同等法律效力。其公司将承担该员工账号行为的全部法律后果和法律责任。</p>
					<p>本协议包括基于本协议制定的各项规则，所有规则为本协议不可分割的一部分，与本协议具有同等效力。本网站有权随时变更本协议并在本页面发布。当您继续使用本网站及相关服务，则视为您完全接受协议的变更。工品行平台的所有权、运营权、解释权归中卅数据信
						息技术(苏州)有限公司所有。与此同时，在您使用工品行旗下各专门频道或平台服务（以下称“单项服务”）时，在本协议的基础上，您应当同时遵守单项服务协议的具体约定。单项服务协议包括但不限于《工品行用户协议》，本协议通用遵从《工品行用户协议》。</p>
					<p>第一条 员工账号服务描述</p>
					<p>
						1、员工账号是其所在公司从在职人员中选择相关采购人员作为员工账号，在本平台进行询价、采购及签订电子协议（开发中）前，使用员工账号所在公司提供授权的账号、密码，自行登录工品行平台(http://www.xunjiancai.com/)完成询价、采购及签订电子协议的相关操作，否则，员工账号不能使用所在公司的名义完成发布询价信息、完成采购单及签订网上交易的电子协议等相关活动。
					</p>
					<p>第二条 本平台权利和义务</p>
					<p>1、用户已充分知悉和同意：本服务为用户提供商品信息展示、交流、进行商品交易的技术服务。在该平台及服务中，本平台不是用户的代理商、合伙人、雇员或雇主等经营关系人，通过本服务展示的商品信息均为卖家发布，具体商品信息及商品的出售或提供者均为卖家，而非本平台。因此，在使用本服务时，用户应对自身发布信息、进行商品交易的真实性、合法性、安全性独立承担责任；本平台不对商品信息、商品质量、权利瑕疵以及买卖双方履行交易协议而产生的问题承担任何责任。</p>
					<p>2、因用户使用本服务而产生有关交易投诉的，用户通过司法机关或行政机关依照法定程序要求本平台提供相关资料，本平台将积极配合。</p>
					<p>
						3、用户已充分知悉和理解，因网上交易平台的特殊性，如发生以下情形之一的，本平台可以普通、非专业人员的知识水平标准或根据自己的独立判断对上述内容进行判别，若认为这些内容或行为具有违法或不当性质的，本平台有权采取包括但不限于限制用户登录,向用户核实有关资料,发出警告通知,中止及停止提供本服务,将用户违法违规行为予以公布等措施。
					</p>
					<p>
						3.1 第三方向本平台告知用户在使用本服务过程中用户违反本协议或平台相关规则的。
					</p>
					<p>
						3.2 第三方向本平台告知用户在使用本服务过程中侵犯第三方合法权益的。
					</p>
					<p>
						3.3 第三方向本平台告知用户在使用本服务过程中有违法或不当行为的。
					</p>
					<p>
						4、根据国家法律法规、本协议的内容和腾讯所掌握的事实依据，可以认定用户存在违法或违反本协议行为的，本平台有权以网络发布形式公布用户的违法行为，并有权随时采取删除相关信息、中止或终止提供服务等措施，而无须征得用户的同意。
					</p>
					<p>
						5、本平台可在不通知用户的情况下对下列信息采取删除、屏蔽、断开链接等措施：
					</p>
					<p>
						5.1 恶意欺诈信息；
					</p>
					<p>
						5.2 恶意评价信息；
					</p>
					<p>
						5.3 试图或已经扰乱正常交易秩序的信息；
					</p>
					<p>
						5.4 危害国家安全统一、社会稳定、公序良俗，侮辱、诽谤、淫秽、暴力的，以及任何违反国家法律法规的信息；
					</p>
					<p>
						5.5侵害他人知识产权、商业秘密等合法权益的信息；
					</p>
					<p>
						5.6恶意虚构事实、隐瞒真相以误导、欺骗他人的信息；
					</p>
					<p>
						您发布上述信息，导致任何第三方损害的，您应当独立承担责任；本平台因此遭受损失的，您也应当一并赔偿。
					</p>
					<p>
						6、用户知悉并同意，当国家行政、司法机关调查用户使用本服务时的相关行为时，本平台有权予以配合，并将所掌握的信息提供给上述国家机关。
					</p>
					<p>7、用户知悉并同意，用户不得利用本服务实施侵犯他人合法权益的行为，如本平台接到第三方投诉称用户侵权的，本平台除依本协议规定采取措施外，本平台还可以将用户的相关注册信息及交易信息等资料提供给投诉人。</p>
					<p>8、用户知悉并同意，因员工账号或企业造成的变故等原因而导致的企业受损，由该企业与员工账号共同承担。</p>
					<p>
						第三条 员工账号的权利和义务
					</p>
					<p>
						1、 员工账号应接受其所在公司及工品行平台的监督，维护三方的合法权益。
					</p>
					<p>
						2、 员工账号应严格遵守相关法律法规，以及在本平台相关规则规定下完成进行活动
					</p>
					<p>
						第四条 授权的变更和终止
					</p>
					<p>
						1、企业在与其员工账号在协商一致的情况下，可以依法对授权委托内容作出变更；如发生了不可抗力或重大变故等原因，致使授权协议发生更改或终止的，企业用户在于其员工账号应自行协商是否签订补充变更协议或终止本授权。
					</p>
					<p>
						2、如发生下列任何一种情形，本平台有权不经通知而中断、中止或终止向用户提供的服务：
					</p>
					<p>
						2.1 根据法律规定用户应提交真实信息，而用户提供的资料不真实、或与注册时信息不一致又未能提供合理证明；
					</p>
					<p>
						2.2 用户违反相关法律法规或本协议的规定；
					</p>
					<p>
						2.3 按照法律规定或主管部门的要求；
					</p>
					<p>
						2.4 用户侵犯其他第三方合法权益的；
					</p>
					<p>
						2.5 出于安全的原因或其他必要的情形。
					</p>
					<p>
						3、对违反相关法律法规或者违反本协议规定，且情节严重的用户，腾讯有权提前终止该用户使用腾讯的其它服务。
					</p>
					<p>
						第五条 违约责任
					</p>
					<p>
						本平台与用户双发应遵守有关法律、法规、规章的规定和本协议的约定，否则，将承担相应的法律责任。因违约造成经济损失的，由违约方承担。
					</p>
					<p>
						第六条 不可抗力及免责事由
					</p>
					<p>
						1、用户理解并同意，在使用本服务的过程中，可能会遇到不可抗力等风险因素，使本服务发生中断。不可抗力是指不能预见、不能克服并不能避免且对一方或双方造成重大影响的客观事件，包括但不限于自然灾害如洪水、地震、瘟疫流行和风暴等以及社会事件如战争、动乱、政府行为等。出现上述情况时，本平台将努力在第一时间与相关单位配合，及时进行修复，但是由此给用户造成的损失本平台将在法律允许的范围内免责。
					</p>
					<p>
						2、在法律允许的范围内，腾讯对以下情形导致的服务中断或受阻不承担责任： (1)受到计算机病毒、木马或其他恶意程序、黑客攻击的破坏； (2)用户或本平台的电脑软件、系统、硬件和通信线路出现故障； （3）用户操作不当； （4）用户通过非本平台授权的方式使用服务；
						（5）其他本平台无法控制或合理预见的情形。
					</p>
					<p>
						3、用户理解并同意，在使用本服务的过程中，可能会遇到网络信息或其他用户行为带来的风险，本平台不对任何信息的真实性、适用性、合法性承担责任，也不对因侵权行为给用户造成的损害负责。这些风险包括但不限于：
					</p>
					<p>
						3.1 来自他人匿名或冒名的含有威胁、诽谤、令人反感或非法内容的信息；
					</p>
					<p>
						3.2 因使用本协议项下的服务，遭受他人误导、欺骗或其他导致或可能导致的任何心理、生理上的伤害以及经济上的损失；
					</p>
					<p>
						3.3 其他因网络信息或其他用户行为引起的风险。
					</p>
					<p>
						4、本平台依据本协议约定获得对违法违规内容处理的权利，该权利不构成本平台的义务或承诺，本平台不能保证及时发现违法行为或进行相应处理。
					</p>
					<p>
						5、在任何情况下，用户不应轻信借款、索要密码或其他涉及财产的网络信息。涉及财产操作的，请一定先核实对方身份，并请经常留意本平台关于防范诈骗犯罪的提示。
					</p>
					<p>
						第七条 其它
					</p>
					<p>
						1、用户使用网站相关服务时，亦应知晓、认可并同意遵守相关服务的额外条款及条件。
					</p>
					<p>
						2、如本协议中的任何条款无论因何种原因完全或部分无效或不具有执行力，本协议的其余条款仍应有效并且有约束力。
					</p>
					<p>
						3、本协议之条款是可分割的，任何协议条款被认定为无效或不可执行时，不影响其他条款之效力。
					</p>
				</Modal>
			</Layout>

		)
	}
}

const AddAddress = Form.create()(AddAddressForm);
export default AddAddress
