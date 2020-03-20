/**
 * 商家信息的头部
 * */
import React from 'react'
import {Menu, Layout} from 'antd'
import cookie from 'react-cookies' //操作cookie
import Link from 'next/link'
import './style.less'
const {Header} = Layout;

export default class IndexHeader extends React.Component {
	constructor(props) {
		super(props);
		let cookies = cookie.load('ZjsWeb');
		this.state = {
			token: cookies ? cookies.token : null,
			userCode: cookies ? cookies.userCode : null,
		}
	}

	render() {
		/**
		 * 父组件异步传值，只有放在render中可以获取
		 * */
		return (
			<Header className="page-head page-head-small" style={{height:'130px !important'}}>
				<aside className="page-head-wrapper">
					<aside className="page-head-wrapper maxWidth">
						<aside className="page-head-search maxWidth">
							<div className="page-head-search-left">
								<a href="/"><i className="icon-logo" /></a>
							</div>
							<div className="page-head-search-right">
								<Menu defaultSelectedKeys={['home']} mode="horizontal" className="page-head-menu">
									<Menu.Item key="home">
										<Link href='/mall/home'>积分商城</Link>
									</Menu.Item>
									<Menu.Item key="info">
										<Link href='/account/custom-center/my-income-integral'>我的积分</Link>
									</Menu.Item>
									<Menu.Item key="list">
										<Link href='/account/custom-center/earn-points'>玩赚积分</Link>
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
