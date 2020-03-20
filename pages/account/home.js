// 用户中心
import React from 'react'
import Link from 'next/link'
import {Col, Row, Tabs} from 'antd';
import PageLayout from 'components/Layout/account'
import UserInfoPanel from './components/UserInfoPanel/index'
import {userCodeFun} from 'server'
import cookie from 'react-cookies';
import './style.less'

const {TabPane} = Tabs;

export default class UserInfo extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			userInfo: {},
		}
	}

	componentDidMount() {
		this.queryUserInfo();
	}

	/**
	 * 查询用户信息
	 * */
	queryUserInfo() {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					userInfo: res.data,
				})
			}
		})
	}

	render() {
		const {userInfo} = this.state;
		return (
			<PageLayout title="个人中心" mainMenuIndex={'home'}>
				<section>
					{/*用户信息*/}
					<UserInfoPanel type={1} />
					<div className="ptb3 prl5 mt2 bg-white">
						<h4 className="text-black">
							我的询价
							{/*<span className="text-muted">*/}
                {/*（可询价次数 <i className="text-primary">{userInfo.inquiryNum || 0 + userInfo.comInquiryNum || 0}</i>/20）*/}
              {/*</span>*/}
						</h4>
						<Row className="mt4 block">
							<Col span={6}>
								<Link href={{pathname: '/account/custom-center/my-inquiry', query: {status: 0}}}>
									<a>
										<i className="icon-btn orange"><em className="iconfont iconfont-xunbijia h2" /></i>
										<i className="prl1">比价中</i>
									</a>
								</Link>
							</Col>
							<Col span={6}>
								<Link href={{pathname: '/account/custom-center/my-inquiry', query: {status: 1}}}>
									<a>
										<i className="icon-btn green"><em className="iconfont iconfont-caigou h2" /></i>
										<i className="prl1">已采购</i>
									</a>
								</Link>
							</Col>
							<Col span={6}>
								<Link href={{pathname: '/account/custom-center/my-inquiry', query: {status: 2}}}>
									<a>
										<i className="icon-btn red"><em className="iconfont iconfont-quxiao h2" /></i>
										<i className="prl1">已取消</i>
									</a>
								</Link>
							</Col>
							<Col span={6}>
								<Link href='/account/custom-center/my-inquiry'>
									<a>
										<i className="icon-btn blue"><em className="iconfont iconfont-quanbu h2" /></i>
										<i className="prl1">全部</i>
									</a>
								</Link>
							</Col>
						</Row>
					</div>
					<div className="ptb3 prl5 mt2 bg-white">
						<Tabs defaultActiveKey="1">
							<TabPane tab="商城订单" key="1">
								<Row className="mt4">
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 1, type: 2}}}>
											<a>
												<i className="icon-btn red"><em className="iconfont iconfont-daiqueren h2" /></i>
												<i className="prl1">待确认</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 2, type: 2}}}>
											<a>
												<i className="icon-btn orange"><em className="iconfont iconfont-HMA_account_payment h2" /></i>
												<i className="prl1">待付款</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 3, type: 2}}}>
											<a>
												<i className="icon-btn green"><em className="iconfont iconfont-fasong1 h2" /></i>
												<i className="prl1">待发货</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 4, type: 2}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-fahuo h2" /></i>
												<i className="prl1">待收货</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 5, type: 2}}}>
											<a>
												<i className="icon-btn green"><em className="iconfont iconfont-haoping1 h2" /></i>
												<i className="prl1">待评价</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {type: 2}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-quanbu h2" /></i>
												<i className="prl1">全部</i>
											</a>
										</Link>
									</Col>
								</Row>
							</TabPane>
							<TabPane tab="询价订单" key="2">
								<Row className="mt4">
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 1, type: 1}}}>
											<a>
												<i className="icon-btn red"><em className="iconfont iconfont-daiqueren h2" /></i>
												<i className="prl1">待确认</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 2, type: 1}}}>
											<a>
												<i className="icon-btn orange"><em className="iconfont iconfont-HMA_account_payment h2" /></i>
												<i className="prl1">待付款</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 4, type: 1}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-fahuo h2" /></i>
												<i className="prl1">待收货</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 5, type: 1}}}>
											<a>
												<i className="icon-btn green"><em className="iconfont iconfont-haoping1 h2" /></i>
												<i className="prl1">待评价</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {type: 1}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-quanbu h2" /></i>
												<i className="prl1">全部</i>
											</a>
										</Link>
									</Col>
								</Row>
							</TabPane>
							<TabPane tab="寄样订单" key="3">
								<Row className="mt4">
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 1, type: 3}}}>
											<a>
												<i className="icon-btn red"><em className="iconfont iconfont-daiqueren h2" /></i>
												<i className="prl1">待确认</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {status: 4, type: 3}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-fahuo h2" /></i>
												<i className="prl1">待收货</i>
											</a>
										</Link>
									</Col>
									<Col span={6}>
										<Link href={{pathname: '/account/purchase/home', query: {type: 3}}}>
											<a>
												<i className="icon-btn blue"><em className="iconfont iconfont-quanbu h2" /></i>
												<i className="prl1">全部</i>
											</a>
										</Link>
									</Col>
								</Row>
							</TabPane>
						</Tabs>
					</div>
				</section>
			</PageLayout>
		)
	}
}
