// 帮助中心
import React from 'react'
import Router from 'next/router'
import {Layout, Divider, Icon, Row, Col, Button, Menu} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import PageLayout from 'components/Layout/concact'
import {questionListHotFun, questionListTypeFun, queryServiceInfoFun} from 'server'
import cookie from 'react-cookies';
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const {Content, Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class HelpPanel extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showConnect: 'none',
			neteaseUserId: ''
		}
	}

	componentDidMount() {
		this.queryServiceInfo()
	}

	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	connectCustomer = () => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block'
			})
		} else {
			Router.push('/login/index')
		}
	};

	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					neteaseUserId: res.data[0].neteaseUserId
				})
			}
		})
	}

	render() {
		return (
			<PageLayout title="联系方式" mainMenuIndex={'contact'}>
				<section className="bg-white ptb2">
					<h4 className="prl3 text-darkgrey">联系我们</h4>
					<Divider />
					<aside className="ptb4 prl6">
						<div>
							<img src="/static/images/img-contact.png" alt="" />
						</div>
						<Row className="mt8">
							<Col span={12}>
								<h5 className="text-darkgrey">
									<IconFont type="iconfont-kefurexian" className="h1" style={{verticalAlign: 'middle'}} />
									<span className="prl1">电话客服</span>
								</h5>
								<h5 className="mt2 text-muted">工作日 8：00-19：00</h5>
								<div className="mt4"><span className="h6 text-muted">客服热线</span><span
									className="text-primary h4 prl1">400-893-8990</span></div>
							</Col>
							<Col span={12}>
								<h5 className="text-darkgrey">
									<IconFont type="iconfont-kefu1" className="h1" style={{verticalAlign: 'middle'}} />
									<span className="prl1">热线接待</span>
								</h5>
								<h5 className="mt2 text-muted">专业高效解决您疑问</h5>
								<div className="mt4">
									<Button type="primary" size="small" onClick={this.connectCustomer}>在线咨询</Button>
								</div>
							</Col>
						</Row>
					</aside>
					<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />
				</section>
			</PageLayout>
		)
	}
}
