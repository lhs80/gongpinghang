// 企业认证信息(只有初级认证成功(至少)或者深度认证成功的才可进入此页面)
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Button, Row, Col} from 'antd';
import cookie from 'react-cookies';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, autherInfoFun, queryInfoFun} from 'server'
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class CompanyAuthCom extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			this.state = {
				headUrl: '',
				isAuthCom: 0,
				isAuthPri: 0,
				companyName: '',
				legalName: '',
				creditCode: '',
				/*---深度认证成功-----*/
				industryType: 0,
				agentName: '',
				customerId: '',
				errorReasons: '',
				errorTip: false
			}
	}

	/*------去深度认证-----*/
	depthAuth = () => {
		this.props.history.push(`/depthAuther`)
	};
	/*-----填写金额----*/
	moneyCompanyAuther = () => {
		this.props.history.push(`/autherMoney`)
	};

	componentDidMount() {
		this.getUserInfo();
		this.getQueryInfo();
	}

	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					headUrl: res.data.headUrl,
					isAuthPri: res.data.isAuthPri,
					isAuthCom: res.data.isAuthCom
				})
			}
		});
	};
	getQueryInfo = () => {
		/*--------获取认证信息----*/
		queryInfoFun(this.userCode).then(res => {
			if (res.result === 'success') {
				let customerId = res.data.customerId;
				if (customerId) {
					customerId = customerId.substring(0, 2) + '**********';
				}
				this.setState({
					companyName: res.data.companyName,
					legalName: res.data.legalName,
					creditCode: res.data.licenseNo,
					agentName: res.data.agentName,
					industryType: res.data.industryType,
					customerId: customerId,
					errorReasons: res.data.remark
				})
			}
		})
	}

	render() {
		const {headUrl, companyName, legalName, creditCode, isAuthCom, agentName, industryType, customerId} = this.state;
		return (
			<Layout title="企业认证" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white" style={{padding: '80px 100px 30px 100px'}}>
					<p className="h1 text-grey">企业认证</p>
					<aside className="companyAuthMenu personalAuth">
						<p className="personalHead" style={{marginBottom: '0px'}} />
						<div className="personalMenu">
                      <span className="personalMenuL text-center">
                           {
	                           headUrl
		                           ? <img src={baseUrl + headUrl} alt="" />
		                           : <img src="/static/images/default-header.png" alt="" />
                           }
                      </span>
							{
								isAuthCom === 2 ?
									<IconFont type="iconfont-shendurenzheng" className="infoAutherCom" />
									: null
							}
							{
								isAuthCom === 1 ?
									<IconFont type="iconfont-yichujirenzheng" className="infoAutherCom" />
									: null
							}
							{
								isAuthCom === 6 || isAuthCom === 7 || isAuthCom === 8 ?
									<IconFont type="iconfont-renzhengzhong" className="infoAutherCom" style={{color: '#e8c22b'}} />
									: null
							}
							{
								isAuthCom === 4 ?
									<IconFont type="iconfont-renzhengshibai" className="infoAutherCom" style={{color: '#f08455'}} />
									: null
							}
							<div className="personalMenuR text-grey">
								<div className="curLine">
									<span className="h0 text-grey">{companyName}</span>
								</div>
								<div className="curLine h4 mt2">
									<span className="show" style={{width: '150px'}}>法定代表人</span>
									<span>{legalName}</span>
								</div>
								<div className="curLine h4 mt1">
									<span className="show" style={{width: '150px'}}>统一社会信用代码</span>
									<span>{creditCode}</span>
								</div>
								<div className="depthStatus text-right">
									{/*----深度认证失败---*/}
									{
										isAuthCom === 4 ?
											<div style={{position: 'relative'}}>
                              <span className="text-primary h5 statusSpan show" style={{marginRight: '10px', color: '#f08455'}}
                                    onMouseEnter={() => this.setState({errorTip: true})} onMouseLeave={() => this.setState({errorTip: false})}>
                                  <IconFont
	                                  type="iconfont-shibai" className="h1 iconPosition" /><i>认证失败</i></span>
												{
													this.state.errorTip ?
														<div className="text-muted cashTip searchTip bg-white" style={{fontSize: '12px'}}>
															<div className="arrow">
																<em /><span />
															</div>
															<p className="text-grey h6 text-left" style={{marginBottom: '0'}}>{this.state.errorReasons}</p>
														</div>
														: null
												}
												<Button size="large" className="h5 accountDatumBtn" onClick={this.depthAuth.bind(this)}>去深度认证</Button>
											</div>

											: null
									}
									{/*-----只有初级认证----*/}
									{
										isAuthCom === 1 ?
											<div>
												<Button size="large" className="h5 accountDatumBtn" onClick={this.depthAuth.bind(this)}>去深度认证</Button>
											</div>

											: null
									}
									{/*------已提交待审核-----*/}
									{
										isAuthCom === 6 ?
											<span className="text-primary h5">已提交待审核</span>
											: null
									}
									{/*------已审核待打款------*/}
									{
										isAuthCom === 7 ?
											<span className="text-primary h5">已审核待打款</span>
											: null
									}
									{/*------已打款待审核-------*/}
									{
										isAuthCom === 8 ?
											<div>
                              <span className="text-primary h5 statusSpan show" style={{marginRight: '10px'}}><IconFont type="iconfont-dengdai1"
                                                                                                                        className="h3 iconPositionN" /><i>已打款待审核</i></span>
												<Button size="large" className="h5 accountDatumBtn" onClick={this.moneyCompanyAuther.bind(this)}>填写金额</Button>
											</div>
											: null
									}
								</div>
							</div>
						</div>
					</aside>
					<aside style={{paddingLeft: '45px'}} className="mt5">
						{/*-----法人----*/}
						{
							isAuthCom === 2 ?
								<div>
									<Row>
										<Col span={12}>
											<Row>
												<Col span={3}>
													<span className="show verticalTop"><IconFont type="iconfont-geren" className="h0" /></span>
												</Col>
												<Col span={19}>
													<div className="legalRight">
														<Row className="h4 text-grey">
															<Col span={24}>法人信息</Col>
														</Row>
														<Row className="mt3">
															<Col span={6} className="text-muted">我的身份&nbsp;:</Col>
															{
																agentName === '' ?
																	<Col span={18} className="text-grey">我是法人</Col>
																	: <Col span={18} className="text-grey">我是代理人</Col>
															}

														</Row>
														<Row>
															<Col span={9} className="text-muted">法人身份证信息&nbsp;:</Col>
															<Col span={14} className="text-grey">已完善</Col>
														</Row>
														{
															agentName === '' ?
																null
																: <Row>
																	<Col span={9} className="text-muted">代理人份证信息&nbsp;:</Col>
																	<Col span={14} className="text-grey">已完善</Col>
																</Row>

														}

													</div>
												</Col>
											</Row>
										</Col>
										<Col span={12}>
											<Row>
												<Col span={3}>
													<span className="show verticalTop"><IconFont type="iconfont-qiye" className="h0" /></span>
												</Col>
												<Col span={19}>
													<div className="legalRight">
														<Row className="h4 text-grey">
															<Col span={24}>企业信息</Col>
														</Row>
														<Row className="mt3">
															<Col span={6} className="text-muted">行业认定&nbsp;:</Col>
															{
																industryType === 0 ?
																	<Col span={18} className="text-grey">尚未认定</Col>
																	: null
															}
															{
																industryType === 1 ?
																	<Col span={18} className="text-grey">建筑行业相关</Col>
																	: null
															}
															{
																industryType === 2 ?
																	<Col span={18} className="text-grey">非建筑行业相关</Col>
																	: null
															}
														</Row>
														<Row>
															<Col span={6} className="text-muted">营业执照&nbsp;:</Col>
															<Col span={18} className="text-grey">已完善</Col>
														</Row>
														<Row>
															<Col span={6} className="text-muted">企业对公&nbsp;:</Col>
															<Col span={18} className="text-grey">已验证</Col>
														</Row>
														<Row>
															<Col span={7} className="text-muted">CA客户编码&nbsp;:</Col>
															<Col span={15} className="text-grey">{customerId}</Col>
														</Row>
													</div>
												</Col>
											</Row>
										</Col>
									</Row>
								</div>
								: null
						}
					</aside>
					<aside className="searchAnsower" style={{marginTop: '100px'}}>
                                   <span className="show iconLeft text-muted">
                                      <IconFont type="iconfont-triangle-bottom" />
                                   </span>
						<div className="show text-grey">
							<p>我从这家公司辞职了，如何清除和更换“我的公司”信息？</p>
							<p style={{marginBottom: '0px'}}>公司的法定代表人不能清除公司信息；</p>
							<p style={{marginBottom: '0px'}}>公司已授权的代理人，如需变更公司信息，请提供加盖公章的《解除授权委托书》，</p>
							<p style={{marginBottom: '0px'}}>邮件至 zhujiangshi@civil-data.com；如有疑问请拨打客服电话：400-893-8990</p>
						</div>
					</aside>
				</section>
			</Layout>
		)
	}
}
