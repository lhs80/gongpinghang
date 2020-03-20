//我的收益积分账户
import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, Row, Col, Avatar, Radio, Table, Pagination, message, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {
	userCodeFun, cashPointsFun, cashPointsListFun, timestampToTime,
	outputmoney, exchangeCashFun
} from 'server'
import cookie from 'react-cookies';
// import FixedTool from 'components/FixedTool/'

let timerStart = undefined;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MyIncomeIntegral extends React.Component {
	constructor(props) {
		super(props);
		this.columns = [{
			title: '变动记录',
			dataIndex: 'name',
			key: 'name',
		}, {
			title: '积分额度',
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
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			headUrl: '',
			nike: '',
			integral: 0,
			changeIntegral: 0,
			tip: false,
			integralListData: [],
			curPage: 0,
			pageSize: 16,
			totalResult: 0,
			visible: false,
			num: 1,
			money: '1,000.00',
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
				})
			}
		})
	};
	/*------现金与积分----*/
	getCashPoints = () => {
		cashPointsFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					integral: res.data.integral,
					changeIntegral: res.data.integral,
				})
			}
		})
	};
	/*-----积分账户变动-----*/
	cashRecordData = () => {
		cashPointsListFun(this.userCode, this.state.curPage, 0).then(res => {
			if (res.result === 'success') {
				this.setState({
					integralListData: res.data.resultList,
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
			this.exchangeCash()
		})
	};
	handleCancel = () => {
		this.setState({
			visible: false
		})
	};
	/*----切换积分与现金账户----*/
	onChangeTab = (e) => {
		if (e.target.value === 'cash') {
			Router.push('/account/custom-center/my-income-cash')
			// this.props.history.push(`/myIncomeCash`)
		}
	};
	/*----点击兑现金按钮-----*/
	getCash = () => {
		const {integral} = this.state;
		if (integral >= 10000) {
			this.setState({
				visible: true
			})
		} else {
			this.setTime('满1万积分才可提现哦');
		}
	};
	/*----增加积分兑换数量---*/
	addIntegral = () => {
		const {num, changeIntegral, integral, money} = this.state;
		/*---outputmoney---*/
		if (parseInt(integral / 10000) > num) {
			this.setState({
				num: num + 1,
				money: outputmoney(100000 * (num + 1))
			}, () => {
				this.setState({
					changeIntegral: changeIntegral - 10000,
				})
			})
		}
	};
	reduceIntegral = () => {
		const {num} = this.state;
		if (num > 1) {
			this.setState({
				num: num - 1,
				money: outputmoney(100000 * (num - 1))
			})
		}
	};
	/*---兑换现金----*/
	exchangeCash = () => {
		let params = {
			userCode: this.userCode,
			integral: this.state.num
		};
		exchangeCashFun(params).then(res => {
			if (res.result === 'success') {
				message.success(('兑换成功'), () => {
					this.getCashPoints();
					this.cashRecordData();
				})
			}
		})
	};
	/*-----赚积分------*/
	getPoints = () => {
		Router.push('/account/custom-center/earn-points')
	};
	//倒计时
	setTime = (msg) => {
		clearTimeout(timerStart);
		timerStart = setTimeout(function () {
			message.info(msg, 0.5)
		}, 500)
	};

	render() {
		const {headUrl, nike, integral, integralListData, curPage, totalResult, visible, num, money} = this.state;
		return (
			<Layout title={'我的积分'} mainMenuIndex={'home'} menuIndex={'7'}>
				<Row className="bg-white ptb4 prl6">
					<Col span={10} className="ptb1" style={{borderRight: '1px solid #e6e6e6'}}>
						<Row type="flex" align="middle">
							<Col span={6}>
								{
									headUrl ?
										<Avatar src={baseUrl + headUrl} size={100} /> :
										<Avatar src="/static/images/default-header.png" size={100} />
								}
							</Col>
							<Col span={18} className="show prl2 text-grey">
								<h2>{nike}</h2>
								<h4 className="mt1">
									<span className="text-muted">ID</span>
									<span className="prl1">{this.userCode}</span>
								</h4>
							</Col>
						</Row>
					</Col>
					<Col span={8} style={{paddingLeft: '60px'}}>
						<Radio.Group defaultValue="points" buttonStyle="solid" onChange={this.onChangeTab}>
							<Radio.Button value="cash">现金账户</Radio.Button>
							<Radio.Button value="points">积分账户</Radio.Button>
						</Radio.Group>
						<div className="text-grey mt2" style={{fontSize: '32px'}}>{integral}</div>
						<h5 className="text-muted">当前账户积分</h5>
					</Col>
					<Col span={3}>
						<Button type="primary" size="large" className="h4 mt3" style={{width: '100px'}} ghost block onClick={this.getCash}>
							兑现金
						</Button>
						<Button type="primary" size="large" className="h4 mt1" style={{width: '100px'}} ghost block onClick={this.getPoints}>
							赚积分
						</Button>
					</Col>
					<Col span={3} className="text-center mt5">
						<Link href="/mall/home">
							<div style={{cursor: 'pointer'}}>
								<h1><IconFont type="iconfont-gouwuche1" className='text-primary' /></h1>
								<h5 className="text-grey mt1">积分商城</h5>
							</div>
						</Link>
					</Col>
				</Row>
				<aside className="bg-white prl3" style={{marginTop: '15px', paddingBottom: '20px'}}>
					<p style={{paddingTop: '36px'}} className="h4 text-grey">积分账户变动记录</p>
					<Table
						columns={this.columns}
						dataSource={integralListData}
						pagination={false}
						rowKey={record => record.id}
					/>
					<Pagination showQuickJumper current={curPage + 1} total={totalResult}
					            pageSize={this.state.pageSize} className="text-center mt3"
					            onChange={this.onPageChange.bind(this)} hideOnSinglePage={true} />
				</aside>
				<Modal
					visible={visible}
					title="兑现金"
					cancelText="取消"
					okText="确认兑换"
					className="commonModal"
					onOk={this.handleOk}
					onCancel={this.handleCancel}>
					<p className="flexMiddle">
						<span className="h4 text-muted" style={{marginRight: '24px'}}>兑换现金</span>
						<span className="text-primary" style={{fontSize: '32px'}}>￥{money}</span>
					</p>
					<div className="flexMiddle">
						<span className="h4 text-muted show" style={{marginRight: '24px', height: '50px'}}>兑换数量</span>
						<div className="show">
							<p style={{marginBottom: '0'}}>
								<IconFont type="iconfont-jian"
								          className={` h0 ${Number(this.state.num) === 1 ? 'text-muted' : 'text-primary'}`}
								          style={{cursor: 'pointer'}}
								          onClick={this.reduceIntegral} />
								<span className="text-grey large show text-center selectBg" style={{width: '100px'}}>{num}</span>
								<IconFont type="iconfont-jiashu"
								          className={` h0 ${parseInt(this.state.integral / 10000) > this.state.num ? 'text-primary' : 'text-muted'}`}
								          style={{cursor: 'pointer'}}
								          onClick={this.addIntegral} />
								<span className="text-grey h4 selectBg">&nbsp;万分</span>
							</p>
							<p className="h5 text-muted">10000分=1000元。仅可兑换1万分的整数倍</p>
						</div>
					</div>
					<p className="flexMiddle">
						<span className="h4 text-muted" style={{marginRight: '24px'}}>当前积分</span>
						<span className="text-grey h4">{integral}分</span>
					</p>
				</Modal>
				{/*在线客服意见反馈*/}
				{/*<FixedTool/>*/}
			</Layout>
		)
	}
}
