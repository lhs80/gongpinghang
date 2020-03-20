import React from 'react'
import Link from 'next/link'
import {Row, Col, Layout, Button} from 'antd'
import './style.less'

const {Footer} = Layout;

export default class MainFooter extends React.Component {
	render() {
		return (
			<Footer className="main-foot">
				<aside className="bg-white text-center">
					<ul className="adv">
						<li className="adv-item">
							<div className="icon-quan" />
							<div className="name">品类齐全</div>
						</li>
						<li className="adv-item">
							<div className="icon-shou" />
							<div className="name">专属客服</div>
						</li>
						<li className="adv-item">
							<div className="icon-cheng" />
							<div className="name">诚信服务</div>
						</li>
						<li className="adv-item">
							<div className="icon-zheng" />
							<div className="name">正品货源</div>
						</li>
					</ul>
				</aside>
				<aside className="text-center">
					<ul className="info">
						<li className="info-item new">
							<h4>新手指南</h4>
							<div className="h5" style={{marginTop: '35px'}}>
								<span><Link href={{pathname: '/help/index', query: {curId: 1, parentId: 2}}}>账号相关</Link></span>
								<span><Link href={{pathname: '/help/index', query: {curId: 3, parentId: 10}}}>卖家指南</Link></span>
							</div>
							<h5 className="mt2">
								<span><Link href={{pathname: '/help/index', query: {curId: 2, parentId: 1}}}>买家指南</Link></span>
								<span><Link href='/contact/index'>联系我们</Link></span>
							</h5>
						</li>
						<li className="info-item notice">
							<h4>平台声明</h4>
							<div className="h5" style={{marginTop: '35px'}}><Link href='/file/protocol'>注册协议</Link></div>
							<h5 className="mt2"><Link href='/file/law'>法律声明</Link></h5>
						</li>
						<li className="info-item tel">
							<div className="h0 text-grey text-center" style={{lineHeight: '1'}}><b>400-893-8990</b></div>
							<div className="text-muted h5 text-center" style={{marginTop: '15px', lineHeight: '1'}}>周一至周五 9：00-18：00</div>
							{/*<div className="service">一对一在线客服</div>*/}
							<a className="service" href="http://wpa.qq.com/msgrd?v=3&uin=2438518624&site=qq&menu=yes" target="_blank">一对一在线客服</a>
						</li>
					</ul>
				</aside>
				<div className="mt3 text-muted text-center">
					<a href="http://www.beian.miit.gov.cn" target="_blank">苏ICP备19067992号</a>
					<span>Copyright © 中卅网络科技（苏州）有限公司</span>
				</div>
				<div className="text-muted text-center ptb1">
					<span className="netWord-report show">
						<a href='http://www.cyberpolice.cn/wfjb/' target="_blank">网络警察</a>
					</span>
					<span className="netWord-police show" style={{marginLeft: '40px'}}>
						<a href='http://www.js12377.cn/' target="_blank">江苏互联网举报中心</a>
					</span>
				</div>
			</Footer>
		)
	}
}
