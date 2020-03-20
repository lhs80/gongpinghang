/**
 * 商家信息的头部
 * */
import React from 'react'
import {Menu, Layout} from 'antd'
import cookie from 'react-cookies' //操作cookie
import Link from 'next/link'
import './style.less'

const {Header} = Layout;

export default class HelpHeader extends React.Component {
	constructor(props) {
		super(props);
		let cookies = cookie.load('ZjsWeb');
		this.state = {
			token: cookies ? cookies.token : null,
			userCode: cookies ? cookies.userCode : null,
		}
	}

	render() {
		return (
			<Header className="page-head" style={{height:'130px !important'}}>
				<aside className="page-head-wrapper">
					<aside className="page-head-wrapper">
						<aside className="page-head-search maxWidth">
							<div className="page-head-search-left">
								<a href="/" target="_blank" className="page-head-search-left">
									<i className="icon-logo" />
								</a>
							</div>
							<div className="page-head-search-right">
								<Menu defaultSelectedKeys={[this.props.mainMenuIndex]} mode="horizontal" className="page-head-menu">
									<Menu.Item key="home">
										<a href="/">返回首页</a>
									</Menu.Item>
									<Menu.Item key="help">
										<Link href={'/help/index'}>常见问题</Link>
									</Menu.Item>
									<Menu.Item key="contact">
										<Link href="/contact">联系方式</Link>
									</Menu.Item>
								</Menu>
							</div>
						</aside>
					</aside>
				</aside>
			</Header>
		)
	}
}
