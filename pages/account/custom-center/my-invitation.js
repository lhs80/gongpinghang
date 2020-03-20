//我的收益-我的邀请
import React from 'react'
import Layout from 'components/Layout/account'
import {Icon, Pagination, Row, Col} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, myInvitationNumFun, myInvitationListFun} from 'server'
import cookie from 'react-cookies';

const {Content} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MyInvitation extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			registerTotal: 0,
			invitationTotal: 0,
			settledTotal: 0,
			registerLen: 0,
			invitationLen: 0,
			settledLen: 0,
			registerData: [],//已注册
			invitationData: [],//已邀请成功
			settledData: [],//已入驻成功
			page: 0,
			pageSize: 6,
			settlePage: 0,
			settlePageSize: 6,
			invitationPage: 0,
			invitationPageSize: 3
		}
	}

	componentDidMount() {
		this.myInvitationListFun();
	}

	/*------我的邀请的列表-----*/
	myInvitationListFun = () => {
		const {page, pageSize, invitationPageSize, invitationPage, settlePage, settlePageSize} = this.state;
		let end = pageSize * page + pageSize;
		let start = pageSize * page;
		let settleEnd = settlePageSize * settlePage + settlePageSize;
		let settleStart = settlePageSize * settlePage;
		let invitationEnd = invitationPageSize * invitationPage + invitationPageSize;
		let invitationStart = invitationPageSize * invitationPage;
		myInvitationListFun(this.userCode).then(res => {
			if (res.result === 'success') {
				let registerLen = res.data.register.length === 0 ? 1 : res.data.register.length;
				let successLen = res.data.success.length === 0 ? 1 : res.data.success.length;
				let submitLen = res.data.submit.length === 0 ? 1 : res.data.submit.length;
				let registerListData = res.data.register;
				registerListData = registerListData.slice(start, end);
				let invitationListData = res.data.success;
				invitationListData = invitationListData.slice(invitationStart, invitationEnd);
				let settledListData = res.data.submit;
				settledListData = settledListData.slice(settleStart, settleEnd);
				this.setState({
					registerData: registerListData,
					invitationData: invitationListData,
					settledData: settledListData,
					registerTotal: registerLen,
					invitationTotal: successLen,
					settledTotal: submitLen,
					registerLen: res.data.register.length,
					invitationLen: res.data.success.length,
					settledLen: res.data.submit.length,
				})
			}
		})
	};
	/*----注册分页----*/
	registerPage = (pageNumber) => {
		this.setState({
			page: pageNumber - 1
		}, () => {
			this.myInvitationListFun();
		})
	};
	/*-----入驻分页----*/
	settledPage = (pageNumber) => {
		this.setState({
			settlePage: pageNumber - 1
		}, () => {
			this.myInvitationListFun();
		})
	};
	/*------邀约成功分页-----*/
	invitationPage = (pageNumber) => {
		this.setState({
			invitationPage: pageNumber - 1
		}, () => {
			this.myInvitationListFun();
		})
	};

	render() {
		const {
			registerTotal, invitationTotal, settledTotal, registerData, invitationData, settledData,
			page, pageSize, invitationPage, invitationPageSize, settlePage, settlePageSize
		} = this.state;
		return (
			<Layout mainMenuIndex={'home'} title="我的收益-我的邀请">
				<section className="bg-white text-center" style={{padding: '74px 42px 113px 42px'}}>
					<Row className="my-invitation">
						<Col span={8}>
							<img src="/static/images/my-invitation1.png" alt="" style={{marginTop: '10px'}} />
							<div style={{borderRight: '1px solid #f0f3ef', height: '460px'}}>
								<p className="text-muted" style={{marginTop: '36px'}}>已注册成为</p>
								<p className="text-muted">商家的用户</p>
								<span className="text-grey invitationNum">{this.state.registerLen}</span>
								<div style={{marginTop: '30px', height: '180px'}}>
									{
										registerData.map((item, index) => {
											return (
												<div key={index} style={{lineHeight: '32px'}}>
													<span className="text-muted">手机号&nbsp;</span>
													<span className="text-grey">{item.mobile}</span>
												</div>
											)
										})
									}
								</div>
								<Pagination simple current={page + 1} total={registerTotal} pageSize={pageSize}
								            style={{marginTop: '60px'}} onChange={this.registerPage.bind(this)} />
							</div>
						</Col>
						<Col span={8}>
							<img src="/static/images/my-invitation2.png" alt="" />
							<div style={{borderRight: '1px solid #f0f3ef', height: '460px'}}>
								<p className="text-muted" style={{marginTop: '36px'}}>已提交入驻</p>
								<p className="text-muted">资料的用户</p>
								<span className="text-grey invitationNum">{this.state.settledLen}</span>
								<div style={{marginTop: '30px', height: '180px'}}>
									{
										settledData.map((item, index) => {
											return (
												<div key={index} style={{lineHeight: '32px'}}>
													<span className="text-muted">手机号&nbsp;</span>
													<span className="text-grey">{item.mobile}</span>
												</div>
											)
										})
									}
								</div>
								<Pagination simple current={settlePage + 1} total={settledTotal} pageSize={settlePageSize}
								            style={{marginTop: '60px'}} onChange={this.settledPage.bind(this)} />
							</div>

						</Col>
						<Col span={8}>
							<img src="/static/images/my-invitation3.png" alt="" style={{marginTop: '10px'}} />
							<div style={{marginBottom: '30px'}}>
								<p className="text-muted" style={{marginTop: '36px'}}>已邀请成功</p>
								<p className="text-muted">入驻的用户</p>
								<span className="text-grey invitationNum">{this.state.invitationLen}</span>
								<div style={{marginTop: '30px', height: '180px'}}>
									{
										invitationData.map((item, index) => {
											return (
												<div key={index} style={{paddingLeft: '80px', marginBottom: '20px'}} className="text-left">
													<p className="text-muted" style={{marginBottom: '5px'}}>
														<span className="text-muted">手机号&nbsp;</span>
														<span className="text-grey">{item.mobile}</span>
													</p>
													<p className="text-grey invitationShop text-ellipsis">
														<span className="text-muted">店铺&nbsp;</span>
														<span className="text-grey">{item.shopName}</span>
													</p>
												</div>
											)
										})
									}
								</div>
								<Pagination simple current={invitationPage + 1} total={invitationTotal} pageSize={invitationPageSize}
								            style={{marginTop: '60px'}} onChange={this.invitationPage.bind(this)} />
							</div>
						</Col>
					</Row>
				</section>
			</Layout>
		)
	}
}
