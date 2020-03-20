//我的收益推荐商家入驻
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, Row, Col, message, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun} from 'server'
import cookie from 'react-cookies'
import copy from 'copy-to-clipboard'
// import FixedTool from 'component/FixedTool/'

const {Content} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class RecommendStay extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			money: 60,
			industryType: '',
			isAuthCom: 0,
			url: 'http://h5.civil-data.com/zhongsa-h5/materialUserAccount/recommend?userCode=' + this.userCode,
			visible: false,
			isAuthPri: 0
		}
	}

	componentDidMount() {
		this.getUserInfo();
	}

	/*----个人信息---*/
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				if (res.data.industryType === 1) {
					this.setState({
						money: 100,
					})
				}
				this.setState({
					industryType: res.data.industryType,
					isAuthCom: res.data.isAuthCom,
					isAuthPri: res.data.isAuthPri
				})
			}
		})
	};
	/*--------复制链接-----*/
	copyUrl = () => {
		copy(this.state.url);
		message.success('链接复制成功！可以发送链接给好友赚钱啦');
	};
	/*---弹窗显示---*/
	showModal = () => {
		this.setState({
			visible: true
		})
	};
	/*---弹窗取消----*/
	handleCancel = () => {
		this.setState({
			visible: false
		})
	};

	render() {
		const {money, isAuthCom, visible, isAuthPri} = this.state;
		return (
			<Layout title="我的收益-推荐商家入驻" menuIndex={'8'} mainMenuIndex={'home'}>
				<aside className="bg-white" style={{padding: '60px 140px'}}>
					<span className="h0 text-primary">推荐流程</span>
					<Row>
						<Col span={4}>
							<span className="h5 text-muted" style={{letterSpacing: '4px'}}>推荐商家入驻</span>
						</Col>
						<Col span={20}>
							<span className="show linePoints" />
							<img src='/static/images/settledin.png' alt="" className="intrgralText" />
						</Col>
					</Row>
					<section className="mt5">
						<div className="ptb3 getPointsWrapper" style={{boxShadow: ' 0 0 10px 0 #dae6e0'}}>
							<Row>
								<Col span={7} className="text-center">
									<div className="reward mt6 text-primary text-center" style={{paddingTop: '20px'}}>
										<p style={{fontSize: '32px', marginBottom: '0', height: '42px'}}>{money}</p>
										<span className="h5">元/商家</span>
									</div>
									<p className="h6 text-muted  mt2" style={{marginBottom: '0'}}>您当前的推荐商家</p>
									<p className="h6 text-muted">奖励标准</p>
								</Col>
								<Col span={17}>
									{/*<h3>攻略一&nbsp;询价得积分</h3>*/}
									<p className="h5 text-grey" style={{marginBottom: '0'}}>1、推荐人邀请商家入驻可获赠现金，随时提现；</p>
									<p className="h5 text-grey" style={{marginBottom: '0'}}>2、每成功邀请一家商家入驻，推荐人即可获得60元现金；</p>
									<p className="h5 text-grey"
									   style={{marginBottom: '40px'}}>3、如推荐人完成企业认证&nbsp;，且推荐人所在企业为建筑行业相关&nbsp;，每成功邀请一家商家入驻&nbsp;，
										推荐人可额外获得40元&nbsp;，总计100元&nbsp;。
										<span className="h6 text-muted">
	                     (&nbsp;提示：网站用户登录网站依次进入【个人中心】-【账户设置】-【企业管理】，完成企业认证。APP用户登录工品行APP,点击“【我的】-头像-我的公司”完成企业认证。&nbsp;;
	                  </span>
									</p>
									<p className="text-muted" style={{marginBottom: '0'}}>
										推荐的商家需满足以下条件：
										<span className="text-primary" style={{cursor: 'pointer'}} onClick={this.showModal}>
                        查看商家经营类目
                    </span>
									</p>
									<p className="text-grey"> 商家可提供平台指定经营类目的建筑材料销售，所选类目不得超出营业执照经营范围；</p>
									<div>
										<Button type='primary'
										        size="large"
										        style={{marginRight: '20px'}}
										        className="h5 prl3"
										        ghost
										        onClick={() => {
											        Router.push('/account/custom-center/my-invitation')
										        }}
										>我的邀请</Button>
										{
											isAuthPri !== 1 ?
												<Button type='primary'
												        size="large"
												        className="h5 prl3"
												        ghost
												        onClick={() => {
													        Router.push('/account/set-user/company-auther')
												        }}
												>去企业认证</Button>
												: null
										}
									</div>
								</Col>
							</Row>
							<img src="/static/images/recommend-rules.png" alt="" className="getPoints" />
						</div>
					</section>
					<section className=" recommendUrl" style={{marginTop: '80px'}}>
						<img src="/static/images/recomend-process.png" alt="" style={{marginLeft: '40px'}} />
						<Row className="h4 text-grey text-center mt2">
							<Col span={4}>
								<p>登录工品行</p>
								<p>网页端或APP</p>
								<div className="icon-download mt1" style={{margin: '0 auto'}} />
							</Col>
							<Col span={7} offset={4}>
								<p>点击页面下方“立即推荐”</p>
								<p>分享链接给推荐商家</p>
								<p className="h5 text-muted mt2">好友通过该链接注册</p>
								<p className="h5 text-muted">并需提交入驻申请资料</p>
							</Col>
							<Col span={6} offset={3}>
								<p>商家通过链接注册并</p>
								<p>按要求提交入驻申请资料</p>
								<p className="h5 text-muted mt2">通过平台审核后，推荐人</p>
								<p className="h5 text-muted">即可获得相应现金奖励</p>
							</Col>
						</Row>

						<div style={{width: '300px', margin: '0 auto'}} className="mt2">
							<Button type='primary' block size="large" className="bg-primary-linear border-radius"
							        onClick={this.copyUrl}>立即推荐</Button>
						</div>
					</section>
				</aside>
				<Modal
					visible={visible}
					title="商家经营类目要求"
					className="categoryModal"
					onCancel={this.handleCancel}
					footer={[
						<Button key="black" size="large" onClick={this.handleCancel}>关闭</Button>,
					]}
				>
					<div className="categoryType text-center">
						<p className="text-muted">推荐入驻商家经营以下类目的&nbsp;,&nbsp;方进行现金奖励。</p>
						<img src='/static/images/category.png' alt="" className="mt2" />
					</div>
				</Modal>
				{/*在线客服意见反馈*/}
				{/*<FixedTool/>*/}
			</Layout>
		)
	}
}
