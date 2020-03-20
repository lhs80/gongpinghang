import React, {Component} from 'react';
import Link from 'next/link'
import Router from 'next/router'
import Layout from 'components/Layout/login'
import {Tabs, Row, Col} from 'antd'
import {codeSessionIdFun, sweepCodeFun} from 'server'
import cookie from 'react-cookies' //操作cookie
import LoginByPassword from './components/LoginByPassword' //手机密码登录 分开写为了实现输入框的单独校验
import LoginBySmsCode from './components/LoginBySmsCode'   //验证码登录 分开写为了实现输入框的单独校验
import './style.less'

const TabPane = Tabs.TabPane;
const QRCode = require('qrcode.react');
let timer = null;
let timerSuccess = null;

class LoginIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
			passWordLogin: true,
			sessionId: '',
			createTime: '',
			info: {},
			seconds: 0,
			computerLogin: 1,
			codeError: true
		}
	}

	componentDidMount() {
		if (cookie.load('ZjsWeb')) {
			Router.push('/')
		}
	}

	//获取sessionId
	getCodeFun = () => {
		codeSessionIdFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					sessionId: res.msg,
					createTime: new Date().getTime()
				}, () => {
					this.setState({
						seconds: 0
					});
					this.tick();
				})
			}
		})
	};
	//二维码登录
	codeLogin = () => {
		this.setState({
			passWordLogin: false
		});
		this.getCodeFun();
	};
	//二维码轮询登录
	sweepCodeLogin = () => {
		const {seconds} = this.state;
		this.setState({
			seconds: seconds + 1
		});
		//3分钟二维码失效
		if (this.state.seconds === 60) {
			clearInterval(timer);
		}
		sweepCodeFun(this.state.sessionId).then(res => {
			if (res.result === 'success') {
				clearInterval(timer);
				this.setState({
					info: res.data,
					computerLogin: 2
				});
				this.successLogin()
			}
		})
	};
	tick = () => {
		timer = setInterval(() => this.sweepCodeLogin(), 3000);
	};

	successLogin = () => {
		timerSuccess = setInterval(() => {
			const {info} = this.state;
			let params = {
				token: info.token,
				userCode: info.userCode,
				clientId: info.clientId
			};
			const expires = new Date();
			expires.setDate(expires.getDate() + 3);
			if (this.state.codeError) {
				axios.defaults.headers.clientId = info.clientId;
				axios.defaults.headers.userCode = info.userCode;
				cookie.save('ZjsWeb', params, {expires});
				window.location.href = `/`;
			}
		}, 3000);
	};
	//返回二维码登录
	blackCode = () => {
		cookie.remove('ZjsWeb');
		this.setState({
			computerLogin: 1,
			codeError: false
		}, () => {
			this.getCodeFun();
		})

	};
	//密码登录
	passwordLogin = () => {
		this.setState({
			passWordLogin: true
		});
		//清除正在轮询的方法
		clearInterval(timer);
	};
	passLogin = () => {
		this.setState({
			passWordLogin: true
		});
		clearInterval(timer);
	};

	render() {
		const {computerLogin, codeUrl} = this.state;
		return (
			<Layout title="登录" className="bg-white">
				<div className="login-layout">
					<div className="login-content login-content-bg">
						<aside className="login-content-form">
							{/*扫码登录*/}
							<div className="login-switch">
								{/*{*/}
								{/*this.state.passWordLogin ?*/}
								{/*<div className="scanCode" onClick={this.codeLogin} />*/}
								{/*:*/}
								{/*<div className="computerLogin" onClick={this.passLogin} />*/}
								{/*}*/}
							</div>
							<div className="login-content-form-top" style={{padding: '40px 0 54px 0'}}>
								{
									this.state.passWordLogin ?
										<Tabs defaultActiveKey="1" size="large" tabBarStyle={{'border': 'none'}} tabBarGutter={88} style={{padding: '0 40px'}}>
											<TabPane tab="密码登录" key="1">
												<LoginByPassword history={this.state.redirectUrl} />
											</TabPane>
											<TabPane tab="验证码登录" key="2">
												<LoginBySmsCode history={this.state.redirectUrl} />
											</TabPane>
										</Tabs>
										:
										<div className="text-center">
											<h1>手机扫码,安全登录</h1>
											{
												computerLogin === 1 ?
													<div>
														<div className="mt4 p1 qRcode">
															<QRCode
																value={codeUrl + this.state.createTime + '?key=' + this.state.sessionId + '&createTime=' + this.state.createTime} />
														</div>
														<h5 className="text-muted mt3">打开工品行APP扫一扫登录</h5>
													</div>
													: null
											}
											{
												this.state.seconds === 60 ?
													<div className="refreshCode">
														<h4 className="text-white">二维码失效</h4>
														<Button type="primary" className="text-white mt2" onClick={this.getCodeFun}>刷新</Button>
													</div>
													: null
											}
											{
												computerLogin === 2 ?
													<div className="text-center">
														<h4 className="successLogin mt4" />
														<h4 className="text-warn mt2">扫描成功,请在手机上确认</h4>
														<h5 className="text-muted mt3" style={{cursor: 'pointer'}} onClick={this.blackCode}>返回二维码登录</h5>
													</div>
													: null
											}
											<Row className="login-bottom bg-white text-darkgrey">
												<Col span={12}>
													<a className="text-hover" onClick={this.passwordLogin}>
														密码登录
													</a>
												</Col>
												<Col span={12}>
													<Link href={'/regist/home'}><a>注册</a></Link>
												</Col>
											</Row>
										</div>
								}
							</div>
						</aside>
					</div>
				</div>
			</Layout>
		)
	}
}

export default LoginIndex;
