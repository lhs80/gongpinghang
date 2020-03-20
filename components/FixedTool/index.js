import React from 'react'
import Router from 'next/router'
import {queryServiceInfoFun} from 'server'
import cookie from 'react-cookies' //操作cookie
import {Col, Icon} from 'antd'
import {iconUrl} from 'config/evn'
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			neteaseUserId: '',
			showConnect: 'none'
		}
	}

	componentDidMount() {
		this.queryServiceInfo()
	}

	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					neteaseUserId: res.data[0].neteaseUserId
				})
			}
		})
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
			Router.push('/login/index');
		}
	};

	render() {
		return (
			<div>
				<div className="flex-type-bar-right">
					<ul>
						<li>
							<a href="/account/home">
								<IconFont type='iconfont-gerenzhongxin' />
								<i className="explain">个人中心</i>
							</a>
						</li>
						<li className="mt1">
							<a href="http://wpa.qq.com/msgrd?v=3&uin=2438518624&site=qq&menu=yes" target="_blank">
								<IconFont type='iconfont-kefu3' />
								<i className="explain">在线咨询</i>
							</a>
						</li>
						<li style={{marginTop: '1px'}}>
							<a href="/account/custom-center/my-collection">
								<IconFont type='iconfont-shoucang4' />
								<i className="explain">我的收藏</i>
							</a>
						</li>
						<li style={{marginTop: '1px'}}>
							<a href="/account/message/inquiryMessage">
								<IconFont type='iconfont-xiaoxi1' />
								<i className="explain">我的消息</i>
							</a>
						</li>
						<li className="mt1">
							<a href="/account/custom-center/my-feed-back">
								<IconFont type='iconfont-fankui' />
								<i className="explain">意见反馈</i>
							</a>
						</li>
						{
							this.props.showGoTop ?
								<li style={{marginTop: '1px'}} onClick={this.props.goToTop}>
									<IconFont type='iconfont-zhiding1' className="h2" />
								</li>
								:
								null
						}
					</ul>
				</div>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />
			</div>
		)
	}
}
