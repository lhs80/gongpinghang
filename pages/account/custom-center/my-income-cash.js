//我的收益现金
import React from 'react'
import Layout from 'components/Layout/account'
import Link from 'next/link'
import Router from 'next/router'
import {Button, Icon, Row, Col, Avatar, Radio, Table, Pagination, message, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, cashPointsFun, cashPointsListFun, timestampToTime} from 'server'
import cookie from 'react-cookies';
import './style.less'
// import FixedTool from 'component/FixedTool/'
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const columns = [{
	title: '变动记录',
	dataIndex: 'name',
	key: 'name',
}, {
	title: '金额额度',
	dataIndex: 'record',
	key: 'record',
}, {
	title: '变动时间',
	dataIndex: 'createTime',
	key: 'createTime',
	render: (text, record) => {
		return (
			<i>{timestampToTime(text)}</i>
		)
	}
}];
export default class MyIncomeCash extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			headUrl: '',
			nike: '',
			cash: 0,
			tip: false,
			cashListData: [],
			curPage: 0,
			pageSize: 16,
			totalResult: 0,
			isAuthUser: 0,
			visible: false
		}
	}

	componentDidMount() {
		this.getUserInfo();
		this.getCashPoints();
		this.cashRecordData();
	}

	/*---获取用户的基本信息----*/
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					headUrl: res.data.headUrl,
					nike: res.data.nickName,
					isAuthUser: res.data.isAuthUser
				})
			}
		})
	};
	/*------现金与积分----*/
	getCashPoints = () => {
		cashPointsFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					cash: res.data.money
				})
			}
		})
	};
	/*----我要提现---*/
	cashWithdrawal = () => {
		const {cash, isAuthUser} = this.state;
		if (isAuthUser === 2) {
			//已认证
			if (cash >= 50) {
				Router.push('/account/custom-center/application-cash');
			} else {
				message.info('满50元才可提现哦')
			}
		}
		if (isAuthUser === 0 || isAuthUser === 3) {
			this.setState({
				visible: true
			});
		}
	};
	/*---现金提示-显示与隐藏-*/
	showCashTip = () => {
		this.setState({
			tip: true
		})
	};
	hiddenCashTip = () => {
		this.setState({
			tip: false
		})
	};
	/*-----现金账户变动-----*/
	cashRecordData = () => {
		cashPointsListFun(this.userCode, this.state.curPage, 1).then(res => {
			if (res.result === 'success') {
				this.setState({
					cashListData: res.data.resultList,
					totalResult: res.data.totalCount,
				})
			}
		})
	}
	/*----分页变化---*/
	onPageChange = (page) => {
		this.setState({
			curPage: page - 1
		}, () => {
			this.cashRecordData();
		})
	};
	/*---个人认证弹窗--*/
	handleOk = () => {
		this.setState({
			visible: false
		}, () => {
			Router.push('/account/set-user/bank-auther');
			// window.open(`account.html#/bankAuther`)
		})
	};
	handleCancel = () => {
		this.setState({
			visible: false
		})
	};
	/*----切换积分与现金账户----*/
	onChangeTab = (e) => {
		if (e.target.value === 'points') {
			Router.push('/account/custom-center/my-income-integral')
			// this.props.history.push(`/myIncomeIntegral`)
		}
	};

	render() {
		const {headUrl, nike, cash, tip, cashListData, curPage, totalResult, visible} = this.state;
		return (
			<Layout title="我的收益-现金账户" menuIndex={'7'} mainMenuIndex={'home'}>
				<aside className="myIncomeCashMenu bg-white" style={{marginRight: '10px'}}>
					<Row style={{height: '100%'}} className="myIncomeLine">
						<Col span={12} style={{borderRight: '1px solid #e6e6e6', height: '100%'}}
						     className="cashItem"
						>
							{
								headUrl ?
									<Avatar src={baseUrl + headUrl} size={100} className="avatar" /> :
									<Avatar src="/static/images/default-header.png" size={100} />
							}
							<div className="show text-grey" style={{marginLeft: '20px'}}>
								<p className="h2 text-left" style={{marginBottom: '0'}}>{nike}</p>
								<p className="h4">
									<span className="text-muted">ID&nbsp;&nbsp;</span>
									<span>{this.userCode}</span>
								</p>
							</div>
						</Col>
						<Col span={12} style={{paddingLeft: '60px'}}>
							<Radio.Group defaultValue="cash" buttonStyle="solid" onChange={this.onChangeTab}>
								<Radio.Button value="cash">现金账户</Radio.Button>
								<Radio.Button value="points">积分账户</Radio.Button>
							</Radio.Group>
							<div className="text-grey mt2">
								<span className="h3">￥</span>
								<span style={{fontSize: '32px'}}>{cash}</span>
							</div>
							<div className="text-muted">
								<span className="h5">当前账户金额&nbsp;&nbsp;</span>
								<IconFont type="iconfont-jieshishuoming" className="h4"
								          onMouseEnter={this.showCashTip} onMouseLeave={this.hiddenCashTip} />
							</div>
							<span className="cashBtn text-primary bg-white h4 show cashBtnPosition" onClick={this.cashWithdrawal}>
                  我要提现
              </span>
							{
								tip ?
									<div className="text-muted cashTip bg-white" style={{fontSize: '12px'}}>
										<div className="arrow">
											<em /><span />
										</div>
										<p className="text-grey h5" style={{marginBottom: '0'}}>什么是“我的现金”</p>
										<p style={{marginBottom: '0'}}>•推荐商家入驻奖励现金；</p>
										<p style={{marginBottom: '0'}}>•申请提现之前，需要先进行个人实名认证哦</p>
										<p style={{marginBottom: '0'}}>•现金账户可以申请提现到您的银行卡哦~</p>
									</div>
									: null
							}

						</Col>
					</Row>
					<Link href='/account/custom-center/recommend-stay'>
						<img src="/static/images/recommondSeller.png" alt="" className="recommondSellerImg" />
					</Link>
				</aside>
				<section className="bg-white prl3" style={{marginTop: '15px', marginRight: '10px', paddingBottom: '20px'}}>
					<p style={{paddingTop: '36px'}} className="h4 text-grey">现金账户变动记录</p>
					<Table
						columns={columns}
						dataSource={cashListData}
						pagination={false}
						rowKey={record => record.id}
					/>
					<Pagination showQuickJumper current={curPage + 1} total={totalResult}
					            pageSize={this.state.pageSize} className="text-center mt3"
					            onChange={this.onPageChange.bind(this)} hideOnSinglePage={true} />
				</section>
				<Modal
					visible={visible}
					cancelText="稍后再说"
					okText="前去认证"
					closable={false}
					onOk={this.handleOk}
					onCancel={this.handleCancel}>
					<p className="h2 text-grey text-center" style={{margin: '110px 0 40px 0'}}>您还没有完成个人认证？</p>
				</Modal>
				{/*在线客服意见反馈*/}
				{/*<FixedTool/>*/}
			</Layout>
		)
	}
}
