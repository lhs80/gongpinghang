import React from 'react'
import Router, {withRouter} from 'next/router'
import {getCardListFun, setPswFun} from 'payApi'
import Layout from 'components/Layout/setting'
import BankCard from './components/Card'
import {Button, Row} from 'antd';
import cookie from 'react-cookies';
import {userCodeFun, getSqBusinessNoFun} from 'server';
import {setPswStatusFun} from 'payApi';

class CompanyAuthResult extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userInfo: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb') : null,
			list: [],
			mobile: '',
			setPswParams: {},//设置密码参数
			isSetPassword: 0,
			merchNo: ''
		}
	}

	componentDidMount() {
		this.queryUserInfo();
	}

	/**
	 * 查询用户信息
	 * */
	queryUserInfo() {
		if (this.state.userInfo) {
			let params = {
				userCode: this.state.userInfo.userCode
			};
			userCodeFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						mobile: res.data.mobile ? res.data.mobile : ''
					}, () => {
						this.getCardList();
					})
				}
			})
		}
	}

	/**
	 * 查询商户信息
	 * */
	getSqBusinessNo() {
		if (this.state.userInfo) {
			let params = {
				mobile: this.state.mobile
			};
			getSqBusinessNoFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						isSetPassword: res.data.isSetPassword,
						merchNo: res.data.merchNo
					}, () => {
						if (this.props.router.query.type === '1') {
							this.setPswState()
						}
						this.getCardList();
					})
				}
			})
		}
	}

	//获取银行卡列表
	getCardList = () => {
		let params = {
			mobile: this.state.mobile
		};
		getCardListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					list: res.data
				}, () => {
					this.isOnlyOneCard()
				})
			}
		})
	};

	//去添加新卡
	goToAddCard = () => {
		Router.push({pathname: '/account/bank-manage/add'})
	};

	//是不是只有一张卡
	isOnlyOneCard = () => {
		return this.state.list.filter(item => item.status === 2).length === 1;
	};

	//设置支付密码
	setPassWord = () => {
		let params = {
			mobile: this.state.mobile,
			returnUrl: '/account/bank-manage/list?result=1'
		};
		setPswFun(params).then(res => {
			this.setState({
				setPswParams: res.data
			}, () => {
				document.getElementById('setPswForm').submit();
			})
		})
	};

	//设置已经设置过密码
	setPswState = () => {
		let params = {
			merchNo: this.state.merchNo
		};
		setPswStatusFun(params).then(res => {
			if (res.result === 'success')
				this.setState({
					isSetPassword: 1
				});
		})
	};

	render() {
		const {list, setPswParams, isSetPassword} = this.state;
		return (
			<Layout title="银行卡管理--工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" mainMenuIndex={'setting'} menuIndex="9">
				<section className="bg-white p6">
					<Button type="primary" size="large" style={{width: '120px'}} onClick={this.goToAddCard}>新增银行卡</Button>
					{
						isSetPassword ?
							<span className="prl1"><Button type="primary" size="large" style={{width: '120px'}} onClick={this.setPassWord}>修改支付密码</Button></span>
							:
							<span className="prl1"><Button htmlType="submit" type="primary" size="large" onClick={this.setPassWord}>设置线上支付密码</Button></span>
					}
					<Row className="mt6">
						{
							list.length ?
								list.map((cardItem, index) => {
									return <BankCard info={cardItem} key={index} userInfo={this.state.userInfo} reload={this.getCardList}
									                 isOnlyOne={this.isOnlyOneCard} mobile={this.state.mobile} />
								})
								:
								<aside className="text-center ptb6">
									<div><img src="/static/images/icon-nodata.png" alt="" /></div>
									<h3 className="mt3 text-muted">您尚未添加任何银行卡</h3>
								</aside>
						}
					</Row>
					<form action="https://test-shoudan.95epay.com/api/api/pay/toSetPayPassword" id="setPswForm" method="post"  target="_blank" >
						<input type="hidden" name="merNo" value={setPswParams.merNo || ''} />
						<input type="hidden" name="version" value={setPswParams.version || ''} />
						<input type="hidden" name="notifyUrl" value={setPswParams.notifyUrl || ''} />
						<input type="hidden" name="timestamp" value={setPswParams.timestamp || ''} />
						<input type="hidden" name="apiContent" value={setPswParams.apiContent || ''} />
						<input type="hidden" name="signType" value={setPswParams.signType || ''} />
						<input type="hidden" name="sign" value={setPswParams.sign || ''} />
					</form>
				</section>
			</Layout>
		)
	}
}

export default withRouter(CompanyAuthResult);
