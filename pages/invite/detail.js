// 我的招标
import React, {Component} from 'react';
import Layout from 'components/Layout/invite'
import {withRouter} from 'next/router'
import InviteTable from './components/InviteTable'
import {Breadcrumb, Tabs, Row, Col, Button, Icon, Table, Avatar, Modal} from 'antd'
import {inviteDetailFun} from 'inviteApi';
import './style.less'
import {iconUrl, baseUrl} from '../../config/evn';
import moment from 'moment'
import cookie from 'react-cookies';
import {isInquiryFun} from '../../server';
import Router from 'next/router';

const {TabPane} = Tabs;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DetailIndex extends Component {
	constructor(props) {
		super(props);
		this.userInfo = cookie.load('ZjsWeb');
		this.state = {
			detail: {},
		}
	}

	componentDidMount() {
		this.queryInfo();
	}

	componentDidUpdate(prevProps) {
		const {query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryInfo();
		}
	}

	queryInfo = () => {
		let params = {
			invitationId: this.props.router.query.id
		};
		inviteDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					detail: res.data
				})
			} else {
				console.log(res.msg)
			}
		}).catch(error => {
			console.log(error)
		})
	};

	//投标须知
	showShouldKnow = () => {
		Modal.confirm({
			width: '600px',
			title: '投标须知',
			cancelButtonProps: {style: {display: 'none'}},
			okText: '我知道啦',
			content: <div>
				<h4 className="mt1" style={{lineHeight: '1.5'}}>仅限工品行已注册并已认证了公司信息的用户投标。</h4>
				<h4 className="mt1" style={{lineHeight: '1.5'}}>招投标流程：</h4>
				<h4 className="mt1">1. 招标人发布招标公告；</h4>
				<h4 className="mt1" style={{lineHeight: '1.5'}}>2. 符合要求的供应商网上投标+根据招标方要求提供纸质招标文件；</h4>
				<h4 className="mt1">3. 招标方组织开标，评标；</h4>
				<h4 className="mt1">4. 招标方定标，并发布中标公告；</h4>
				<h4 className="mt1">5. 招标方与中标方线下进行后续履约事宜；</h4>
				<h4 className="mt1" style={{lineHeight: '1.5'}}>备注：招标项目如有变化，招标方会发布变更公告，已投标的供应商也会受到相关消息提醒。</h4>
			</div>
		})
	};

	//去发布招标
	applyInvite = () => {
		if (!this.userInfo) {
			Router.push('/login')
		} else {
			isInquiryFun(this.userInfo.userCode).then(res => {
				if (res.data.isAuthCom === 1 || res.data.isAuthCom === 2) {
					Router.push({pathname: '/invite/tender', query: {id: this.props.router.query.id}})
				} else {
					Modal.confirm({
						title: '提示',
						okText: '立即前往',
						cancelText: '晚点再说',
						onOk() {
							Router.push('/account/set-user/search-companyAuther')
						},
						content: (
							<div>认证企业信息之后方可投标，是否立即前往认证？</div>
						)
					});
				}
			})
		}
	};

	render() {
		const {detail} = this.state;
		const inviteTable = [
			{key: '招标单位', value: detail.companyName},
			{key: '集团单位', value: detail.conglomerateName},
			{key: '项目名称', value: detail.projectName},
			{key: '项目地址', value: detail.projectProvince + detail.projectCity + detail.projectArea + detail.projectAddress},
			{key: '截标日期', value: moment(detail.endTime).format('YYYY-MM-DD HH时')},
			{key: '定标日期', value: moment(detail.calibrationTime).format('YYYY-MM-DD HH时')},
			{key: '投标保证金(元)', value: detail.margin},
			{key: '招标形式', value: detail.form},
			{key: '预计进场日期', value: moment(detail.planTime).format('YYYY-MM-DD')},
			{key: '增值税发票', value: detail.isInvoice === 0 ? '需要' + detail.invoiceType : '不需要'},
		];
		const columns = [
			{
				title: '序号',
				align: 'center',
				width: '5%',
				dataIndex: 'invitationId',
				render: (text, record, index) => `${index + 1}`,
			}, {
				title: '标的物名称',
				align: 'center',
				width: '18%',
				dataIndex: 'materialsName',
			}, {
				title: '规格型号',
				align: 'center',
				width: '18%',
				dataIndex: 'specsModels',
			}, {
				title: '数量',
				align: 'center',
				width: '14%',
				dataIndex: 'quantity',
			}, {
				title: '单位',
				align: 'center',
				dataIndex: 'unit',
				width: '12%',
			}, {
				title: '备注',
				align: 'center',
				width: '10%',
				dataIndex: 'remark',
			}
		];
		return (
			<Layout title='招标公告-招标详情' menuIndex={'1'} mainMenuIndex={'inquiry'}>
				<section>
					{/*招标与投标路径*/}
					<Breadcrumb separator=">" className='text-lightgrey ptb1 show'>
						<Breadcrumb.Item>
							<a href="/invite/home">招标公告</a>
						</Breadcrumb.Item>
						<Breadcrumb.Item>
							<span className="text-primary">{detail.title}</span>
						</Breadcrumb.Item>
					</Breadcrumb>
					<aside className='bg-white p4'>
						<Row>
							<Col span={12} className='h0 text-darkgrey inviteTitle'>
								{detail.title}
								<span className={`icon-tender-${detail.invitationStatus} iconTender show`} />
							</Col>
							<Col span={12} className="text-right">
								{
									!this.userInfo ?
										<Button type="primary" className="bg-primary-linear text-white border-radius" size="large"
										        onClick={this.applyInvite}>我要投标</Button>
										:
										''
								}
								{
									//标书状态是投标中
									//不是当前用户发布的标书
									//当前用户没有投过标书
									// 才显示“我要投标”按钮
									this.userInfo &&
									detail.invitationStatus === 1 &&
									detail.userCode !== this.userInfo.userCode &&
									detail && detail.userCodeList && detail.userCodeList.filter(item => item === this.userInfo.userCode).length <= 0
										?
										<Button type="primary" className="bg-primary-linear text-white border-radius" size="large"
										        onClick={this.applyInvite}>我要投标</Button>
										:
										''
								}
								{detail && detail.userCodeList && this.userInfo && detail.userCodeList.indexOf(this.userInfo.userCode) >= 0
									?
									<span className="text-primary h2">已投标</span>
									:
									''
								}
								<div type="link"
								     style={{verticalAlign: 'top', cursor: 'pointer'}}
								     className="show text-center prl1"
								     onClick={this.showShouldKnow}
								>
									<IconFont type="iconfont-bangzhu" className="h1" />
									<h5 className="text-muted">投标须知</h5>
								</div>
							</Col>
						</Row>
						<div className="text-muted h5">
							<span>公告日期：{moment(detail.createTime).format('YYYY-MM-DD')}</span>
							<span style={{marginLeft: '72px'}}>招标编号：{detail.invitationCode}</span>
						</div>
						<InviteTable inviteTable={inviteTable} />
						{
							detail.modifyTime ?
								<div className="h6 text-primary bg-white ptb1">
									<IconFont type="iconfont-tongzhi2" className="h1" /> 本公告在首次发布的基础上有修改，请以本公告内容为准
								</div>
								:
								''
						}
						{
							this.userInfo && this.userInfo.userCode ?
								''
								:
								<div className="text-center h3 ptb2 mt1 border-radius" style={{border: 'solid 1px #FC9F30'}}>
									<span className="text-primary">登录</span>或<span className="text-primary">注册</span>后方可查看标书的全部信息
								</div>
						}
					</aside>
					<Tabs defaultActiveKey="0" className="invite-tabs bg-white mt2" animated={false}>
						<TabPane tab="招标详情" key="0" className="p4">
							<div className="h5">
								<label className="text-muted">标的物类型：</label><span className="text-black">{detail.materialType}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">标的物明细：</label>
							</div>
							<Table columns={columns} dataSource={detail.materials} pagination={false} className="mt1" rowKey={record => record.materialsId} />
							<div className="h5 mt1">
								<label className="text-muted">报价方式：</label><span className="text-black">{detail.quotingWay}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">支付说明：</label><span className="text-black">{detail.paymentInstructions}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">需要送样：</label><span className="text-black">{detail.isSpecimen ? '需要' : '不需要'}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">送货上门：</label><span className="text-black">{detail.isDelivery ? '需要' : '不需要'}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">送货地址：</label>
								<span className="text-black">
									{detail.receiverProvince}
									{detail.receiverCity}
									{detail.receiverArea}
									{detail.receiverAddress}
								</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">联系人：</label><span className="text-black">{detail.linkman}</span>
							</div>
							<div className="h5 mt1">
								<label className="text-muted">联系电话：</label><span className="text-black">{detail.phone}</span>
							</div>
						</TabPane>
						<TabPane tab="招标人介绍" key="1" className="p4">
							<div>
								<label className="text-muted">招标单位介绍</label>
								<div className="mt1">
									<img style={{width: '154px', height: '110px'}}
									     src={detail.companyImage ? baseUrl + detail.companyImage : '/static/images/notData.png'} />
									<span className="prl1 h5 text-black">{detail.companyDesc}</span>
								</div>
							</div>
							<div className='mt5'>
								<label className="text-muted">项目介绍</label>
								<div className="mt1">
									<img style={{width: '154px', height: '110px'}}
									     src={detail.projectImage ? baseUrl + detail.projectImage : '/static/images/notData.png'} />
									<span className="prl1 h5 text-black">{detail.projectDesc}</span>
								</div>
							</div>
						</TabPane>
						{
							this.userInfo && this.userInfo.userCode ?
								<TabPane tab="附件下载" key="2" className="p4">
									{
										detail.attachmentList && detail.attachmentList.length
											?
											detail.attachmentList.map((item, index) => {
												return <div key={index} className={index > 0 ? 'mt1' : ''}>
													<label className="text-muted">附件{index + 1}：</label>
													<a href={baseUrl + item.filePath} className="text-primary">{item.fileName}</a>
												</div>
											})
											:
											<div>暂无附件</div>
									}
								</TabPane>
								:
								''
						}
					</Tabs>
				</section>
			</Layout>
		);
	}
}

export default withRouter(DetailIndex);
