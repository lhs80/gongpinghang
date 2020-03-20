// 我的招标
import React, {Component} from 'react';
import Layout from 'components/Layout/invite'
import {withRouter} from 'next/router'
import InviteTable from './components/InviteTable'
import {Breadcrumb, Tabs, Row, Col, Button, Icon, Table, Avatar, Modal, Divider} from 'antd'
import {inviteDetailFun} from 'inviteApi';
import './style.less'
import {iconUrl, baseUrl} from '../../config/evn';
import moment from 'moment'
import cookie from 'react-cookies';
import {isInquiryFun, timestampToTime} from '../../server';
import Link from 'next/dist/client/link';
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
				<h4 className="mt1" style={{lineHeight: '1.5'}}>仅限工品行——筑卖通已入驻，并已完善了公司相关信息的供应商投标。招投标流程：</h4>
				<h4 className="mt1">招标人发布招标公告；</h4>
				<h4 className="mt1" style={{lineHeight: '1.5'}}>符合要求的供应商网上投标+根据招标方要求提供纸质招标文件；</h4>
				<h4 className="mt1">招标方组织开标，评标；</h4>
				<h4 className="mt1">招标方定标，并发布中标公告；</h4>
				<h4 className="mt1">招标方与中标方线下进行后续履约事宜；</h4>
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

	getStatusText = (status) => {
		switch (status) {
			case 4:
				return '投标终止';
			case 5:
				return '流标';
			case 6:
				return '废标';
			default:
				return this.state.detail.winning ? this.state.detail.winning.companyName : ''
		}
	};

	render() {
		const {detail} = this.state;
		const inviteTable = [
			{key: '中标单位', value: this.getStatusText(detail.invitationStatus)},
			{key: '中标时间', value: detail.winning ? moment(detail.winning.winTime).format('YYYY-MM-DD') : '--'},
		];
		const inviteTableOne = [
			{key: '招标单位', value: detail.companyName},
			{key: '集团单位', value: detail.conglomerateName},
			{key: '项目名称', value: detail.projectName},
			{key: '项目地址', value: detail.projectProvince + detail.projectCity + detail.projectArea + detail.projectAddress},
			{key: '招标编号', value: detail.invitationCode},
			{key: '', value: ''},
		];
		return (
			<Layout title='招标公告-招标详情' menuIndex={'1'} mainMenuIndex={'inquiry'}>
				<section>
					{/*招标与投标路径*/}
					<Breadcrumb separator=">" className='text-lightgrey ptb1 show'>
						<Breadcrumb.Item>
							<a href="/invite/win">中标公告</a>
						</Breadcrumb.Item>
						<Breadcrumb.Item>
							<span className="text-primary">{detail.title}</span>
						</Breadcrumb.Item>
					</Breadcrumb>
					<aside className='bg-white p4'>
						<div className='h0 text-grey inviteTitle'>
							{detail.title}
						</div>
						<div className="text-muted h5 mt1">
							<span>公告日期：{moment(detail.createTime).format('YYYY-MM-DD')}</span>
						</div>
						<div className="mt2">
							<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} />
							<b className="h4">中标信息</b>
						</div>
						<InviteTable inviteTable={inviteTable} />
						<div className="mt2">
							<Divider type="vertical" className="bg-primary border-radius" style={{width: '6px', height: '18px'}} />
							<b className="h4">招标信息</b>
						</div>
						<InviteTable inviteTable={inviteTableOne} />
						<div className="h4 mt2 text-muted">
							{
								detail.invitationStatus >= 4 ?
									'该招标已停止，深感抱歉，请继续关注我司其他招标项目。'
									:
									'备注： 招标单位将在2-3个工作日内联系中标单位，进行后续履约事宜。'
							}
						</div>
						<div className="text-center mt4">
							<Button type="primary" size="large" className="bg-primary-linear text-white border-radius"
							        onClick={() => {
								        Router.push({pathname: '/invite/detail', query: {id: this.props.router.query.id}}
								        )
							        }}
							>查看招标公告</Button>
						</div>
					</aside>
				</section>
			</Layout>
		);
	}
}

export default withRouter(DetailIndex);
