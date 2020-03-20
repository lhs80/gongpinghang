import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Button, message, Col, Divider, Form, Input, Modal, Row, Table} from 'antd';
import {
	getEmployeeListFun,
	setNewManagerFun,
	unBindAccountFun,
	reBindAccountFun,
	queryAccountStateFun,
	addEmployeeSendSmsCodeFun
} from 'server'
import cookie from 'react-cookies';

const {Content} = Layout;
const confirm = Modal.confirm;
const FormItem = Form.Item;
let timer = undefined;

class EmployeeListForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.columns = [{
			title: '账号(手机号)',
			key: 'mobile',
			dataIndex: 'mobile',
		}, {
			title: '姓名',
			key: 'name',
			dataIndex: 'name',
		}, {
			title: '身份证',
			key: 'idCard',
			dataIndex: 'idCard',
		}, {
			title: '操作',
			key: 'action',
			render: (text, record) => {
				return (
					this.state.status === '0'
						?
						<Button type="warn" className="border-circle prl1" onClick={() => this.unBindAccount(record.userCode)}>解除关联</Button>
						:
						<Button type="primary" className="border-circle prl1" //disabled={this.state.memberCount>=20?true:''}
						        onClick={() => this.accountIsConformToreBind(record)}>重新关联</Button>
				)
			}
		}];
		this.state = {
			fId: 0,
			memberCount: 0,
			count: 60,
			status: '0',
			tipText: '发送验证码',
			workList: [],//使用中
			historyList: [],//历史成员
			selectUserInfo: {},//选择的重新关联或解除关联的用户信息
			showReBindConfirm: false,
			isSmsSended: false,
			showChangeAdmin: false,
			disabled: false,
			type: '',
			flag: false
		}
	}

	componentDidMount() {
		this.getEmployeeList();
	}

	SendSmsCode = () => {
		let params = {
			mobile: this.state.selectUserInfo.mobile,
			userCode: this.userCode
		};
		addEmployeeSendSmsCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setTime();
				this.setState({
					isSmsSended: true,
					flag: true
				});
			}
		})
	}

	setTime() {
		let self = this;
		if (this.state.isSmsSended) return;
		let count = this.state.count;
		timer = setInterval(function () {
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

	/**
	 * 账号列表
	 * */
	getEmployeeList = () => {
		getEmployeeListFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					fId: res.data.fId,
					memberCount: res.data.count,
					workList: res.data.workList,
					historyList: res.data.historyList
				});
				if (res.data.workList.length <= 0) {
					this.setState({
						disabled: true
					})
				}
			}
		})
	};

	/**
	 * 切换使用中和历史账号列表
	 * */
	changeType = (type) => {
		this.setState({
			status: type
		});
		if (this.state.workList.length <= 0) {
			this.setState({
				disabled: true
			})
		} else {
			this.setState({
				disabled: false
			})
		}
	};

	/**
	 * 添加新账号
	 * */
	addAccount = () => {
		Router.push('/account/multi-account/employee/add');
		/*if (this.state.workList.length < 20) {
			window.location.href = '/account.html#/employee/add'
		} else {
			Modal.warning({
				title: '提示',
				okText: '我知道了',
				content: (
					<div>
						<p>
							您当前添加的账号数量已达到上限，无法继续添加！
						</p>
					</div>
				)
			});
		}*/
	};

	/**
	 * 解除账号关联
	 * */
	unBindAccount = (userCode) => {
		let self = this;
		confirm({
			title: '是否确定解除该账号与企业的关联？',
			onOk() {
				let msg = '', title = '提示';
				unBindAccountFun(userCode).then(res => {
					if (res.result === 'success')
						msg = '解除关联成功！';
					else {
						if (res.msg === '103') {
							title = '该账号尚有该企业的询价和采购行为未完结，暂不能解除关联！';
							msg = '<span class="text-muted">解除时，该账号不能有以公司名义发起的“比价中”的询价单和“待确认”的采购单</span>'
						}
					}
					Modal.warning({
						title: title,
						okText: '我知道了',
						content: <p dangerouslySetInnerHTML={{__html: msg}} />
					});
					self.getEmployeeList();
				})
			},
			content: (
				<div className="text-muted" style={{lineHeight: '1.5'}}>
					解除后：<br />
					• 该账号将取消与该公司的关联；<br />
					• 该账号将无法使用公司名义进行询价和采购；<br />
					• 该账号将失去每天20次的免费询价次数；<br />
					• 可能会对该账号推荐商家的奖励标准有影响；
				</div>
			)
		});
	}

	/**
	 * 可以重新关联吗？
	 * */
	accountIsConformToreBind = (userInfo) => {
		//直接调取queryAccountState拿不到结果
		//let accountStatus = this.queryAccountState(userInfo.mobile);
		let self = this;
		this.setState({
			selectUserInfo: userInfo
		});
		//超过20人了
		/*if (this.state.workList.length >= 20) {
			Modal.warning({
				title: '提示',
				okText: '我知道了',
				content: (
					<div>
						您当前添加的账号数量已达到上限，无法继续添加！
					</div>
				)
			});
			return;
		}*/
		queryAccountStateFun(userInfo.mobile).then(res => {
			if (res.result === 'success') {
				// 这个账号已经加入别的公司
				if (res.data.type === 3) {
					Modal.warning({
						title: '提示',
						okText: '确定',
						content: (
							<div style={{lineHeight: '1.5'}}>
								该手机号已关联其他公司，不可重复关联！<br />
								需先解除同上家公司的关联
							</div>
						)
					});
				} else {
					confirm({
						title: '是否确认将本账号关联到公司名下？',
						okText: '确定',
						onOk() {
							if (self.state.flag) {
								clearInterval(timer);
							}
							self.setState({
								showReBindConfirm: true,
								isSmsSended: false,
								count: 60
							});
							self.props.form.setFields({
								captchaCode: {
									value: '',
								},
							});
						},
						content: (
							<div>需要验证该手机号方可关联</div>
						)
					});
				}
			}
		});
	};

	/**
	 * 查询要添加账号的状态
	 * */
	queryAccountState = (mobile) => {
		queryAccountStateFun(mobile).then(res => {
			if (res.result === 'success') {
				return res.data.type;
			}
		})
	};

	/**
	 * 重新关联
	 * */
	reBindAccount = () => {
		let params = {
			userCode: this.state.selectUserInfo.userCode,
			mobile: this.state.selectUserInfo.mobile,
			verifyCode: this.props.form.getFieldValue('captchaCode'),
			fId: this.state.fId,
		};
		reBindAccountFun(params).then(res => {
			if (res.result === 'success') {
				message.info('重新关联成功！');
				this.getEmployeeList();
				this.setState({
					showReBindConfirm: false
				})
			}
		})
	}
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let params = {
					userCode: this.state.selectUserInfo.userCode,
					mobile: this.state.selectUserInfo.mobile,
					verifyCode: this.props.form.getFieldValue('captchaCode'),
					fId: this.state.fId,
				};
				reBindAccountFun(params).then(res => {
					if (res.result === 'success') {
						message.info('重新关联成功！');
						this.getEmployeeList();
						this.setState({
							showReBindConfirm: false
						})
					} else if (res.result === 'error' && res.msg === '短信验证码错误或已失效') {
						let captchaCode = this.props.form.getFieldValue('captchaCode');
						this.props.form.setFields({
							captchaCode: {
								value: captchaCode,
								errors: [new Error(res.msg)],
							},
						});
					}
				})
			}
		})
	};
	/**
	 * 转让管理权
	 * */
	changeAdminAccount = (user) => {
		this.setState({
			showChangeAdmin: false
		}, () => {
			let self = this;
			confirm({
				title: `是否确定将管理权转让给"${user.name}"?`,
				content: '转让后你将失去对员工账号的管理权限',
				cancelText: '取消',
				okText: '确定',
				onOk() {
					setNewManagerFun(self.userCode, user.userCode).then(res => {
						if (res.result === 'success') {
							message.info('管理权转让成功！', () => {
								Router.push('/account/set-user/index')
							});
						}
					})
				},
				onCancel() {
					self.setState({
						showChangeAdmin: true
					})
				}
			})
		})
	};

	render() {
		const {status, workList, historyList, isSmsSended, selectUserInfo, count, memberCount, showChangeAdmin, disabled} = this.state;
		const {getFieldDecorator} = this.props.form;
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
		const ButtonGroup =
			isSmsSended
				?
				<Button size="large" type="primary" htmlType="button" block className="btn-sendCode h5"
				        ghost>重新发送{count}s</Button>
				:
				<Button size="large" type="primary" htmlType="button" block className="btn-sendCode h5" style={{height: '50px'}}
				        ghost onClick={this.SendSmsCode}>{this.state.tipText}</Button>;
		return (
			<Layout menuIndex={'6'} mainMenuIndex={'setting'} title="企业管理--工品行">
				<section className="bg-white p4">
					<Row>
						<Col span={12}>
							<a onClick={() => this.changeType('0')} className={status === '0' ? 'text-primary' : 'text-secondary'}>使用中</a>
							<Divider type="vertical" style={{margin: '0 15px'}} />
							<a onClick={() => this.changeType('1')} className={status === '1' ? 'text-primary' : 'text-secondary'}>历史成员</a>
						</Col>
						<Col span={12} className="text-right">
							{/*<span className="prl1 text-muted">您还可以添加的账号数为：{memberCount}/20</span>*/}
							<span className="prl1 text-muted">您当前添加的账号数为：{memberCount}</span>
							{/*<Button type="primary" style={{marginRight: '16px'}} onClick={this.addAccount} disabled={memberCount>=20?true:''}>添加账号</Button>*/}
							<Button type="primary" className="bg-primary-linear border-radius" style={{marginRight: '16px'}} onClick={this.addAccount}>添加账号</Button>
							<Button type="primary" className="bg-primary-linear border-radius" onClick={() => this.setState({showChangeAdmin: true})} disabled={disabled}>转让管理权</Button>
						</Col>
					</Row>
					<Table
						id="oftenTable"
						ref="oftenTable"
						className="mt2"
						columns={this.columns}
						dataSource={status === '1' ? historyList : workList}
						pagination={false}
						rowKey={record => record.userCode}
					/>
				</section>
				{/*重新关联时要输入接收到的短信验证码*/}
				<Modal
					title="关联账号"
					visible={this.state.showReBindConfirm}
					/*onOk={this.reBindAccount}*/
					onCancel={() => {
						this.setState({
							showReBindConfirm: false
						})
					}}
					footer={null}
				>
					<Form onSubmit={this.handleSubmit} className={`${this.props.type === '1' ? 'myForm' : ''}`}>
						<FormItem {...formItemLayout} label="手机号">
							<div className="h3" style={{marginTop: '5px'}}>{selectUserInfo.mobile}</div>
						</FormItem>
						<FormItem{...formItemLayout} label="短信验证码" className="detailAddress">
							<Row gutter={10}>
								<Col span={16}>
									{getFieldDecorator('captchaCode', {
										validateTrigger: 'onBlur',
										rules: [{required: true, message: '请输入手机验证码'}],
									})(
										<Input maxLength={4} size="large" placeholder="请输入手机验证码" />
									)}
								</Col>
								<Col span={8}>
									{ButtonGroup}
								</Col>
							</Row>
						</FormItem>
						<FormItem className="text-center">
							<Button ghost size="large" type="primary" htmlType="button" style={{width: '120px'}} onClick={() => {
								this.setState({
									showReBindConfirm: false
								})
							}}>取消</Button>
							<Button type="primary" htmlType="submit" size="large" style={{width: '120px', marginLeft: '20px'}}>确定</Button>
						</FormItem>
					</Form>
				</Modal>
				{/*转让授权给别人时，选择要转让的人*/}
				<Modal
					className="modal-change-admin"
					style={{padding: '0'}}
					title="选择新管理员"
					visible={showChangeAdmin}
					onCancel={() => {
						this.setState({
							showChangeAdmin: false,
						})
					}}
					footer={[
						<Button
							key="back"
							type="primary"
							size="large"
							style={{background: '#e6e6e6'}}
							className="text-primary h5"
							onClick={() => {
								this.setState({showChangeAdmin: false})
							}}>关闭
						</Button>,
					]}
				>
					{
						workList.map((item, index) => {
							return (
								<Row key={index} type="flex" align="middle" style={{marginTop: '16px'}} className="text-grey bg-white ptb2 prl3">
									<Col span={18}>
										<h4>{item.name} {item.mobile}</h4>
										<h5 className="mt2">身份证：{item.idCard}</h5>
									</Col>
									<Col span={6} className="text-right">
										<Button
											type="primary"
											className="border-circle prl2"
											onClick={() => this.changeAdminAccount(item)}>转让给TA</Button>
									</Col>
								</Row>
							)
						})
					}
				</Modal>
			</Layout>
		)
	}
}

const EmployeeList = Form.create()(EmployeeListForm);
export default EmployeeList
