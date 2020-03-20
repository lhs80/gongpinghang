import React from 'react'
import Link from 'next/link'
import {Icon, Layout, Menu, Badge} from 'antd';
import {userMsgCountFun} from 'server'
import cookie from 'react-cookies';
import './style.less'

const {Sider} = Layout;

export default class SlideBar extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			inquiryCount: '',//询价消息数量
			systemCount: '',//系统消息数量
            bidNum:''
		}
	}

	componentDidMount() {
		this.queryUserMsgCount();
	}

	/*----询价消息--系统消息数量--*/
	/**
	 * 查询用户消息数量
	 * */
	queryUserMsgCount() {
		userMsgCountFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryCount: res.data.inquiryNum,
					systemCount: res.data.systemNum,
                    bidNum:res.data.bidNum
				})
			}
		})
	}

	render() {
		const {inquiryCount, systemCount,bidNum} = this.state;
		return (
			<Sider className="userInfo-slider">
				<h4 className="p2 bg-lightgrey">
					<span style={{color: '#3b465f'}}><Icon type="appstore" theme="filled" style={{color: '#929fad', marginRight: '19px'}} />消息中心</span>
				</h4>
				<Menu mode="inline" defaultSelectedKeys={['3']} selectedKeys={[this.props.menuIndex]} className="messageSlider">
					<Menu.Item key="1">
						<Link href='/account/message/inquiryMessage'>
							<a>询价消息<Badge count={inquiryCount <= 10 ? inquiryCount : '...'} className="newsCount" /></a>
						</Link>
					</Menu.Item>
					{/*<Menu.Item key="4">*/}
						{/*<Link href='/account/message/invite-message'>*/}
							{/*<span>招投标消息<Badge count={bidNum <= 10 ? bidNum : '...'} className="newsCount" /></span>*/}
						{/*</Link>*/}
					{/*</Menu.Item>*/}
					<Menu.Item key="2">
						<Link href='/account/message/systemMessage'>
							<a>系统消息<Badge count={systemCount <= 10 ? systemCount : '...'} className="newsCount" /></a>
						</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link href='/account/message/sessionMessage'>
							<a>会话消息<Badge count={this.props.newsTotal} className="newsCount" /></a>
						</Link>
					</Menu.Item>
				</Menu>
			</Sider>
		)
	}
}
