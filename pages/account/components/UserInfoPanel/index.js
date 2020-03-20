import React from 'react'
import Link from 'next/link';
import {Avatar, Icon, message} from 'antd/lib/index';
import {cashPointsFun, userCodeFun} from 'server'
import {baseUrl, iconUrl, mroUrl} from 'config/evn'
import cookie from 'react-cookies';
import './style.less'
import {Button} from "antd";

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			userInfo: {},
			headUrl: '',
			cash: 0,
			points: 0
		}
	}

	componentDidMount() {
		this.queryUserInfo();
		this.getCashPoints();
	}

	/**
	 * 查询用户信息
	 * */
	queryUserInfo() {
		if (this.userCode) {
			let params = {
				userCode: this.userCode
			};
			userCodeFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						userInfo: res.data,
						headUrl: res.data.headUrl ? baseUrl + res.data.headUrl : '/static/images/default-header.png'
					})
				}
			})
		}
	}

	showInfo = () => {
		message.info('您已注册商家，不能购买询价！');
	};

	getCashPoints = () => {
		cashPointsFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					cash: res.data.money,
					points: res.data.integral
				})
			}
		})
	};

	goToMroSys = () => {
		window.location.href = mroUrl;
	};

	render() {
		const {userInfo} = this.state;
		const {type} = this.props;

		return (
			<aside className="userInfo-panel">
				<div>
					<Link href='/account/set-user/index'>
						<Avatar size={100} src={this.state.headUrl} style={{marginLeft: '30px'}} className="mt3" />
					</Link>
				</div>
				<div className='userInfo-panel-right'>
					<h2 className="text-darkgrey mt1">
						<span className="h2">{userInfo.nickName}</span>
						{
							//企业认证状态  -1未注册未认证 0 已注册未认证  1 审核中 2已认证 3认证失败
							userInfo.isAuthPri !== 2
								?
								<Link href='/account/set-user/index'>
									<span className="auth-flag default">未认证</span>
								</Link>
								:
								<span className="auth-flag active">已认证</span>
						}
					</h2>
					<h5 className="text-muted mt1">ID：<span className="text-black">{userInfo.userCode}</span></h5>
					{/*<div className="info">*/}
					{/*{*/}
					{/*type === 2 ?*/}
					{/*<div className="prl3 cell">*/}
					{/*<div className="large text-primary-linear">*/}
					{/*{*/}
					{/*this.state.userInfo.isSeller === 1 ?*/}
					{/*'--' :*/}
					{/*this.state.userInfo.inquiryNum >= 0 && this.state.userInfo.comInquiryNum >= 0*/}
					{/*?*/}
					{/*(this.state.userInfo.inquiryNum + this.state.userInfo.comInquiryNum)*/}
					{/*:*/}
					{/*0*/}
					{/*}*/}
					{/*</div>*/}
					{/*<div>*/}
					{/*<span className="mt1 text-muted">剩余询价次数</span>*/}
					{/*{*/}
					{/*this.state.userInfo.isSeller === 1 ?*/}
					{/*<span className="mt1 text-primary prl1" onClick={this.showInfo}>去购买<IconFont type="iconfont-jiantou2" /></span>*/}
					{/*:*/}
					{/*<span className="mt1 prl1">*/}
					{/*<Link href='/account/custom-center/buy-now'><span className="text-primary ">去购买<IconFont type="iconfont-jiantou2" /></span></Link>*/}
					{/*</span>*/}
					{/*}*/}
					{/*</div>*/}
					{/*</div>*/}
					{/*:*/}
					{/*<Row className="cell">*/}
					{/*<Col span={8}>*/}
					{/*<div className="h0 text-primary-linear text-center">{this.state.cash}</div>*/}
					{/*<h5 className="text-center mt1">*/}
					{/*<Link href='/account/custom-center/my-income-cash'>*/}
					{/*<span style={{cursor: 'pointer'}} className="text-muted">我的现金（元）<IconFont className="h5" style={{verticalAlign: 'bottom'}}*/}
					{/*type="iconfont-jiantou2" /></span>*/}
					{/*</Link>*/}
					{/*</h5>*/}
					{/*</Col>*/}
					{/*<Col span={8}>*/}
					{/*<div className="h0 text-primary-linear text-center">{this.state.points}</div>*/}
					{/*<h5 className="text-muted text-center mt1">*/}
					{/*<Link href="/account/custom-center/my-income-integral">*/}
					{/*<span style={{cursor: 'pointer'}}>我的积分（分）<IconFont className="h5" style={{verticalAlign: 'bottom'}} type="iconfont-jiantou2" /></span>*/}
					{/*</Link>*/}
					{/*</h5>*/}
					{/*</Col>*/}
					{/*</Row>*/}
					{/*}*/}
					{/*<Row className="cell">*/}
					{/*<Col span={6} />*/}
					{/*<Col span={6}>*/}
					{/*<div style={{cursor: 'pointer'}} className="text-center" onClick={() => {*/}
					{/*Router.push({pathname: '/account/custom-center/my-order', query: {type: 1}})*/}
					{/*}}>*/}
					{/*<div className="text-darkgrey text-center mt1">*/}
					{/*<div><IconFont type="iconfont-unie64a" className='text-primary h1' /></div>*/}
					{/*<div className="mt1">我的订单</div>*/}
					{/*</div>*/}
					{/*</div>*/}
					{/*</Col>*/}
					{/*<Col span={2} className="text-center">*/}
					{/*<Divider type="vertical" style={{height: '30px', marginTop: '20px'}} />*/}
					{/*</Col>*/}
					{/*<Col span={6}>*/}
					{/*<Link href='/mall/home'>*/}
					{/*<div style={{cursor: 'pointer'}} className="text-darkgrey text-center mt1">*/}
					{/*<div><IconFont type="iconfont-gouwuche1" className='text-primary h1' /></div>*/}
					{/*<div className="mt1">积分商城</div>*/}
					{/*</div>*/}
					{/*</Link>*/}
					{/*</Col>*/}
					{/*</Row>*/}
					{/*</div>*/}
				</div>

				{
					//企业认证状态  -1未注册未认证 0 已注册未认证  1 审核中 2已认证 3认证失败
					userInfo.isAuthPri === 2
						?
						< div className='userInfo-panel-right'>
						<h2 className="text-darkgrey mt1"></h2>
						<h5 className="text-muted mt2">
							<Button size='large' className="h3" style={{width: '160px'}} onClick={this.goToMroSys}>MRO采购系统</Button>
						</h5>
						</div>
						:
						''
				}
			</aside>
		)
	}
}
