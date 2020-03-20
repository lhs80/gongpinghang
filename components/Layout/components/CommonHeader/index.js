import React, {Fragment} from 'react'
import Link from 'next/link'
import Router from 'next/router'
import {Row, Col, Icon, Popover, Badge, Button} from 'antd'
import cookie from 'react-cookies' //操作cookie
import {iconUrl, businessUrl} from 'config/evn'
import {
	userMsgCountFun,
	newsFun,
	newsReadFun,
	userCodeFun
} from 'server'
import {queryAuthInfoFun} from 'newApi'
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class CommonHeaderIndex extends React.Component {
	constructor(props) {
		super(props);
		let cookies = cookie.load('ZjsWeb');
		this.content = (
			<Row className="common-popover">
				<Col span={24}>
					<div className="icon-wechat-top" />
					<h5 className="text-muted text-center">筑卖通APP(商家端)</h5>
				</Col>
			</Row>
		);
		this.state = {
			redirectUrl: Router.router ? Router.router.pathname : '',
			token: cookies ? cookies.token : null,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			mobile: cookies ? cookies.mobile : null,
			msgCount: 0,
			newsList: [],//最新3条消息
			authStatus: ''
		}
	}

	componentDidMount() {
		this.queryUserInfo();
		this.queryUserMsgCount();
		this.getNews();
	}

	/*--获取个人认证信息--*/
	getAutherInfoFun = () => {
		let params = {
			mobile: this.state.mobile,
			source: 1
		};
		queryAuthInfoFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					authStatus: res.data.status,
					nickName: res.data.nickName,
					displayName: res.data.merchantName || res.data.mobile, //res.data.nickName ? res.data.nickName : res.data.mobile,
				})
			}
		})
	};

	/**
	 * 查询用户消息数量
	 * */
	queryUserMsgCount() {
		if (this.state.userCode) {
			userMsgCountFun(this.state.userCode).then(res => {
				if (res.result === 'success') {
					this.setState({
						msgCount: res.data.systemNum + res.data.inquiryNum + res.data.bidNum
					})
				}
			}).catch(error => {
				console.log(error)
			})
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
						this.getAutherInfoFun();
					})
				}
			})
		}
	}

	/**
	 * 退出
	 * todo 清空缓存
	 * */
	loginOut = () => {
		cookie.remove('ZjsWeb', {path: '/'});
		// Router.push({pathname: '/'});
		// 如果当前页是首页，退出后刷新
		// if (Router.router.pathname === '/')
			window.location.reload()
	};

	/*---获取最新3条消息---*/
	getNews = () => {
		newsFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					newsList: res.data
				})
			}
		})
	};
	/*---最新消息跳转----*/
	jumpDetail = (item) => {
		this.readNews(item);
		let result = '';
		switch (item.openType) {
			case 5:
				result = `/account/custom-center/my-inquiry-detail?mid=${JSON.parse(item.params).inquirySheetId}`;
				break;
			case 6:
				result = `/account/custom-center/my-inquiry-quote-detail?shopId=${JSON.parse(item.params).shopId}&sheetId=${JSON.parse(item.params).inquirySheetId}&status=${JSON.parse(item.params).isQuote}`;
				break;
			case 7:
				result = `/account/purchase/detail?id=${JSON.parse(item.params).orderId}`;
				break;
			case 9:
				result = '/account/custom-center/my-income-integral';
				break;
			case 10:
				result = '/account/custom-center/my-income-cash';
				break;
			case 13:
				result = '/account/multi-account/employee/list';
				break;
		}
		if (result) {
			window.location.href = result;
		}
	};
	/*----单条设为已读消息----*/
	readNews = (list) => {
		newsReadFun(this.state.userCode, list.id).then(res => {
			if (res.result === 'success') {
			}
		})
	};

	render() {
		const {userCode, authStatus} = this.state;
		const customer = (
			<div className="text-center common-popover">
				<h5><Link href={{pathname: '/account/purchase/home', query: {type: 2}}}><a>我的订单</a></Link></h5>
				<h5 className="mt2"><Link href={{pathname: '/account/custom-center/my-collection'}}><a>我的收藏</a></Link></h5>
				<h5 className="mt2"><Link href={{pathname: '/account/custom-center/often-shop'}}><a>常购材料</a></Link></h5>
			</div>
		);

		const newsList = (
			<div className={`text-center newsList `}>
				<div className="text-left" style={{padding: '10px 20px'}}><Badge status="success" text="未读消息" /></div>
				<div>
					{
						this.state.newsList && this.state.newsList.length > 0 ?
							this.state.newsList.map((item, index) => {
								return (
									<h5 key={index} className="bubble">
										<a className="text-ellipsis show prl2 text-muted" style={{width: '260px'}}
										   onClick={() => this.jumpDetail(item)}>{item.content}</a>
									</h5>
								)
							})
							: <span>暂无消息</span>
					}
				</div>
				<h5 className="text-center bg-lightgrey allNews mt1">
					<a href='/account/message/inquiryMessage'>全部</a>
				</h5>
			</div>
		);
		return (
			<Fragment>
				{
					authStatus === 0 ?
						<div className="ptb1 text-center text-white" style={{background: '#E6A23C'}}>企业当前未认证，认证通过后您即可使用MRO系统 <a
							href="/account/set-user/companyauther">去认证></a></div>
						:
						null
				}
				{
					authStatus === 1 ?
						<div className="ptb1 text-center text-white" style={{background: '#409eff'}}>正在审核，认证通过后您即可使用MRO系统</div>
						:
						null
				}
				{
					authStatus === 3 ?
						<div className="ptb1 text-center text-white" style={{background: '#E6A23C'}}>审核失败，请重新认证，认证通过后您即可使用MRO系统 <a
							href="/account/set-user/companyauther">去认证></a></div>
						:
						null
				}
				<div className="common-header">
					<Row className="common-header-content">
						<Col span={12}>
							<span className="h5" style={{marginRight: '24px'}}>您好，欢迎来到工品行！</span>
							{
								userCode && userCode !== 'guest' ?
									<div className="show">
										<div className="show"><a href="/account/home">{this.state.displayName}</a></div>
										<div className="show">
											<Popover content={newsList} trigger="hover">
												<a href={'/account/message/inquiryMessage'} className="prl2">消息（<i className="text-primary">{this.state.msgCount}</i>）</a>
											</Popover>
										</div>
										<span>
											<a className="text-grey" onClick={this.loginOut}>退出</a>
										</span>
									</div>
									:
									<div className="show">
										<a href={'/login/index'}>请登录</a>
										<a href={'/regist/home'}>免费注册</a>
									</div>
							}
						</Col>
						<Col span={12} className='text-right'>
							<Popover content={customer} trigger={['hover']}>
							<span>
								<Link href='/account/home'>
									<a className="h5">我的工品行&nbsp;<IconFont type="iconfont-sanjiao" className="text-muted h6" /></a>
								</Link>
							</span>
							</Popover>
							<a href={businessUrl} target="_blank">商家中心</a>
							{/*<Link href={{pathname: '/help/index', query: {parentId: 0, curId: 'hot'}}}>帮助中心</Link>*/}
							<Popover content={<img src="../../../../static/images/img-wechat.jpg" alt="" style={{width: '100px'}} />} trigger="hover">
								<span style={{marginLeft: '20px'}}>微信关注工品行商城</span>
							</Popover>
						</Col>
					</Row>
				</div>
			</Fragment>
		)
	}
}
