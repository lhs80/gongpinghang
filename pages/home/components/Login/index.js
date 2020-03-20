import React, {Fragment} from 'react'
import Router from 'next/router'
import AddInquiry from 'components/AddInquiry/index'
import {Avatar, Col, Row, Button, Icon} from 'antd';
import {queryServiceInfoFun, userCodeFun} from 'server'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import Link from 'next/link';
import './style.less'
import dynamic from 'next/dynamic'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
export default class Banner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			userInfo: cookie.load('ZjsWeb'),
			neteaseUserId: '',
			showConnect: 'none'
		}
	}

	componentDidMount() {
		this.queryUserInfo();
		this.queryServiceInfo();
	}

	queryUserInfo() {
		if (this.state.userCode === 'guest') return;
		let params = {
			userCode: this.state.userCode
		};
		userCodeFun(params).then(res => {
			this.setState({
				userInfo: res.data
			})
		})
	}

	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					neteaseUserId: res.data[0].neteaseUserId
				})
			}
		})
	}

	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	connectCustomer = () => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block'
			})
		} else {
			Router.push('/login/index');
		}
	};


	render() {
		const {userInfo} = this.state;
		return (
			<Fragment>
				<div>
					<Link href="/account/home">
						<a><Avatar src={userInfo && userInfo.headUrl ? baseUrl + userInfo.headUrl : '/static/images/nologin.png'} size={60} /></a>
					</Link>
					<h5 className="login-welcome-info">Hi~欢迎来到工品行!</h5>
				</div>
				<div>
					{
						this.state.userInfo ?
							<Row className="login-menu">
								<Col span={12}>
									<Button type="primary"
									        ghost
									        className="border-circle"
									        style={{width: '100px'}}
									        onClick={() => {
										        Router.push('/account/home')
									        }}>个人中心</Button>
								</Col>
								<Col span={12}>
									<Button type="primary"
									        ghost
									        className="border-circle"
									        onClick={() => {
										        Router.push({pathname: '/account/purchase/home', query: {type: 2}})
									        }}>我的采购单</Button>
								</Col>
							</Row>
							:
							<h5 className="login-btn">
								<Button type="primary" className="login" onClick={() => {
									Router.push({pathname: '/login/index'})
								}}>登录</Button>
								<Button type="primary" ghost className="regist" onClick={() => {
									Router.push({pathname: '/regist/home'})
								}}>注册</Button>
							</h5>
					}
				</div>
				<div className="menu-buttons">
					<Button block ghost type="primary" size="large">
						<a href="http://wpa.qq.com/msgrd?v=3&uin=2438518624&site=qq&menu=yes" target="_blank">
							<IconFont type="iconfont-shiliangzhinengduixiang1" className="h1" /> 客服咨询
						</a>
					</Button>
					<Button block ghost type="primary" size="large" className="mt1">
						<a href="/account/custom-center/my-collection" target="_blank">
							<IconFont type="iconfont-shiliangzhinengduixiang" className="h1" /> 我的收藏
						</a>
					</Button>
				</div>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />
			</Fragment>
		)
	}
};
