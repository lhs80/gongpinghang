import React from 'react'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/setting'
import {Button, Col, Divider, Form, Input, Modal, Row, Table, Icon, Descriptions} from 'antd';
import cookie from 'react-cookies';
import {iconUrl, authUrl} from 'config/evn'
import {getSqBusinessNoFun, userCodeFun} from 'server';
import {queryAccountStatusFun} from 'payApi';
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class CompanyAuthResult extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') && cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null,
			type: this.props.router.query.type,
			companyInfo: {},
			mobile: ''
		}
	}

	componentDidMount() {
		this.queryUserInfo();
	}

	componentDidUpdate(nextProps) {
		if (nextProps.router.query.type !== this.props.router.query.type) {
			this.setState({
				type: this.props.router.query.type,
			});
		}
	}


	/**
	 * 查询用户信息
	 * */
	queryUserInfo() {
		if (this.state.userCode) {
			let params = {
				userCode: this.state.userCode
			};
			userCodeFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						mobile: res.data.mobile ? res.data.mobile : ''
					}, () => {
						this.getSqBusinessNo();
					})
				}
			})
		}
	}


	// 获取企业认证信息
	getSqBusinessNo = () => {
		let params = {
			mobile: this.state.mobile
		};
		getSqBusinessNoFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					companyInfo: res.data
				})
			}
		})
	};

	checkFaildReason = () => {
		let params = {
			merchNo: this.state.companyInfo.merchNo
		};
		queryAccountStatusFun(params).then(res => {
			if (res.result === 'success') {
				Modal.confirm({
					okButtonProps: {style: {display: 'none'}},
					title: '提示',
					content:
						<div>失败原因:{res.data.memo}</div>,
					cancelText: '我知道了'
				})
			}
		})
	};

	//去认证中心
	goToAuth = () => {
		cookie.save('_mobile_', this.state.mobile, {path: '/'});
		cookie.save('_source_', 1, {path: '/'});
		window.open(authUrl)
	};

	render() {
		// 企业认证状态  0 已注册未认证  1 审核中 2 已认证 3 认证失败 -1 未注册未认证
		const {type, companyInfo} = this.state;
		return (
			<Layout title="我的公司--工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" mainMenuIndex={'setting'} menuIndex="5">
				<section className="bg-white" style={{overflow: 'hidden'}}>
					{/*未认证*/}
					{
						type === '-1' ?
							<aside>
								<div className="text-center ptb3">
									<img src='/static/images/img-multi-account.png' alt="" className="mt2" />
									<h1 className="mt2 text-grey">您尚未加入任何公司</h1>
								</div>
								<div style={{width: '600px', margin: '40px auto'}} className="bg-lightgrey prl2 ptb4">
									<h5 className="text-muted">企业认证权益，认证了企业之后，您将获得：</h5>
									<Row style={{marginTop: '24px'}} className="h5 text-grey">
										<Col span={14}>• “已认证”标识；</Col>
										<Col span={10}>• 商家的高度信任；</Col>
									</Row>
									<Row style={{marginTop: '16px'}}>
										<Col span={14}>• 享有询价及下单权利</Col>
										<Col span={10}>• 可使用线上支付担保交易功能</Col>
									</Row>
								</div>
								<div className="text-center ptb6">
									<Button type="primary"
									        size="large"
									        style={{width: '300px'}}
									        onClick={this.goToAuth}
									>去认证</Button>
								</div>
							</aside>
							:
							null
					}
					{/*已注册未认证*/}
					{
						type === '0' ?
							<aside style={{paddingBottom: '80px'}}>
								<Row className="auth-tips error">
									<Col span={12}>
										<IconFont type="iconfont-shenhe" style={{color: '#29BCC8', marginLeft: '100px'}} className="large" />
										<b className="large prl1">未完成认证</b>
									</Col>
									<Col span={9} className="text-right">
										<Button type="primary"
										        style={{width: '100px', height: '40px'}}
										        onClick={this.goToAuth}>继续认证</Button>
									</Col>
								</Row>
								<div className="auth-result-wrapper">
									<div className="personalHead mt5">
										—— <span className="prl1">{companyInfo.merchantName}</span> ——
									</div>
									<Row className="prl3">
										<Col span={5}>
											{
												companyInfo.merchType === 'com' ?
													<div className="auth-result-type company">企业用户</div>
													:
													<div className="auth-result-type person">个体工商户</div>
											}
										</Col>
										<Col span={18}>
											<table style={{height: '80px', width: '100%'}} className="mt5">
												<tbody>
												<tr>
													<td style={{width: '140px'}} className="text-muted">法定代表人姓名</td>
													<td className="text-grey">{companyInfo.legalPersonName}</td>
													<td style={{width: '140px'}} className="text-muted">法定代表人身份证号</td>
													<td className="text-grey">{
														companyInfo.legalPersonIdnum ? companyInfo.legalPersonIdnum.substring(0, 2).padEnd(18, '*')
															:
															''
													}</td>
												</tr>
												</tbody>
											</table>
											<div className="mt4" />
										</Col>
									</Row>
								</div>
							</aside>
							:
							null
					}
					{/*等待审核*/}
					{
						type === '1' ?
							<aside style={{paddingBottom: '80px'}}>
								<div className="auth-tips waite">
									<IconFont type="iconfont-shenhe" style={{color: '#29BCC8', marginLeft: '100px'}} className="large" />
									<b className="large prl1">等待审核结果</b>
									<span className="text-muted h5">认证资料已提交，审核过程将需要1-2个工作日，请注意查收短信通知</span>
								</div>
								<div className="auth-result-wrapper">
									<div className="personalHead mt5">
										—— <span className="prl1">{companyInfo.merchantName}</span> ——
									</div>
									<Row className="prl3">
										<Col span={5}>
											{
												companyInfo.merchType === 'com' ?
													<div className="auth-result-type company">企业用户</div>
													:
													<div className="auth-result-type person">个体工商户</div>
											}
										</Col>
										<Col span={18}>
											<table style={{height: '80px', width: '100%'}} className="mt5">
												<tbody>
												<tr>
													<td style={{width: '140px'}} className="text-muted">法定代表人姓名</td>
													<td className="text-grey">{companyInfo.legalPersonName}</td>
													<td style={{width: '140px'}} className="text-muted">法定代表人身份证号</td>
													<td className="text-grey">{
														companyInfo.legalPersonIdnum ? companyInfo.legalPersonIdnum.substring(0, 2).padEnd(18, '*')
															:
															''
													}</td>
												</tr>
												</tbody>
											</table>
											<div className="mt4" />
										</Col>
									</Row>
								</div>
							</aside>
							:
							null
					}
					{/*已认证*/}
					{
						type === '2' ?
							<aside className="auth-result-wrapper" style={{margin: '50px auto'}}>
								<div className="personalHead">
									—— <span className="prl1">{companyInfo.merchantName}</span> ——
								</div>
								<Row className="prl3">
									<Col span={5}>
										{
											companyInfo.merchType === 'com' ?
												<div className="auth-result-type company">企业用户</div>
												:
												<div className="auth-result-type person">个体工商户</div>
										}
									</Col>
									<Col span={18}>
										<table style={{height: '80px'}} className="mt6">
											<tbody>
											<tr>
												<td style={{width: '140px'}} className="text-muted">法定代表人姓名</td>
												<td className="text-grey">{companyInfo.legalPersonName}</td>
											</tr>
											<tr>
												<td className="text-muted">法定代表人身份证号</td>
												<td className="text-grey">{
													companyInfo.legalPersonIdnum ? companyInfo.legalPersonIdnum.substring(0, 2).padEnd(18, '*')
														:
														''
												}</td>
											</tr>
											</tbody>
										</table>
										<Divider className="mt5" />
										<table style={{height: '150px'}}>
											<tbody>
											<tr>
												<td style={{width: '140px'}} className="text-muted">营业执照类型</td>
												<td className="text-grey">{companyInfo.businessLicenceType === '1' ? '三合一' : '普通'}</td>
											</tr>
											<tr>
												<td className="text-muted">营业地址</td>
												<td className="text-grey">{companyInfo.address}</td>
											</tr>
											<tr>
												<td className="text-muted">营业执照注册号或<br />社会统一信用代码</td>
												<td className="text-grey">{companyInfo.businessLicenceNo}</td>
											</tr>
											<tr>
												<td className="text-muted">营业执照有效期</td>
												<td className="text-grey">{companyInfo.businessLicenceValidity ? companyInfo.businessLicenceValidity : '长期'}</td>
											</tr>
											</tbody>
										</table>
										<div className="bg-lightgrey prl2 ptb3 mt3" style={{width: '533px'}}>
											<table style={{width: '100%', height: '120px'}}>
												<tbody>
												<tr>
													<td style={{width: '160px'}} className="text-grey">法定代表人身份信息</td>
													<td><IconFont type="iconfont-yiwanshan" className="text-primary" style={{fontSize: '60px'}} /></td>
													<td style={{width: '160px'}} className="text-grey">营业执照副本扫描件</td>
													<td><IconFont type="iconfont-yishangchuan" className="text-primary" style={{fontSize: '60px'}} /></td>
												</tr>
												{
													companyInfo.businessLicenceType !== '1' ?
														<tr>
															<td className="text-grey">税务登记证副本扫描件</td>
															<td><IconFont type="iconfont-yishangchuan" className="text-primary" style={{fontSize: '60px'}} /></td>
															<td className="text-grey">组织机构代码证副本<br />扫描件</td>
															<td><IconFont type="iconfont-yishangchuan" className="text-primary" style={{fontSize: '60px'}} /></td>
														</tr>
														:
														null
												}
												<tr>
													<td className="text-grey">银行开户许可证扫描件</td>
													<td><IconFont type="iconfont-yishangchuan" className="text-primary" style={{fontSize: '60px'}} /></td>
												</tr>
												</tbody>
											</table>
										</div>
										<div className="mt4" />
									</Col>
								</Row>
								<IconFont type="iconfont-yirenzheng" className="icon-auth-pass" />
							</aside>
							:
							null
					}
					{/*认证失败*/}
					{
						type === '3' ?
							<aside style={{paddingBottom: '80px'}}>
								<Row className="auth-tips error">
									<Col span={12} offset={3}>
										<Icon type="close-circle" style={{color: '#EE845B'}} className="large" />
										<b className="large prl1">认证失败</b>
									</Col>
									<Col span={6} className="text-right">
										<span className="prl2">
											<Button type="primary"><a onClick={this.goToAuth}>重新认证</a></Button>
										</span>
										<Button type="primary" onClick={this.checkFaildReason}>查询失败原因</Button>
									</Col>
								</Row>
								<div className="auth-result-wrapper">
									<div className="personalHead mt5">
										—— <span className="prl1">{companyInfo.merchantName}</span> ——
									</div>
									<Row className="prl3">
										<Col span={5}>
											{
												companyInfo.merchType === 'com' ?
													<div className="auth-result-type company">企业用户</div>
													:
													<div className="auth-result-type person">个体工商户</div>
											}
										</Col>
										<Col span={18}>
											<table style={{height: '80px', width: '100%'}} className="mt5">
												<tbody>
												<tr>
													<td style={{width: '140px'}} className="text-muted">法定代表人姓名</td>
													<td className="text-grey">{companyInfo.legalPersonName}</td>
													<td style={{width: '140px'}} className="text-muted">法定代表人身份证号</td>
													<td className="text-grey">{
														companyInfo.legalPersonIdnum ? companyInfo.legalPersonIdnum.substring(0, 2).padEnd(18, '*')
															:
															''
													}</td>
												</tr>
												</tbody>
											</table>
											<div className="mt4" />
										</Col>
									</Row>
								</div>
							</aside>
							:
							null
					}
					{
						!type ?
							'出错啦！！'
							:
							null
					}
				</section>
			</Layout>
		)
	}
}

export default withRouter(CompanyAuthResult);
