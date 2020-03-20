// 个人认证成功
import React from 'react'
import {Icon, Row, Steps} from 'antd';
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {iconUrl} from 'config/evn'
import Link from 'next/link'
import cookie from 'react-cookies'
import './style.less'

const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MakePersonal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	componentDidMount() {
		let timer = setTimeout(() => {
			Router.push('/account/set-user/makeover-personalAuth');
		}, 5000);
	}

	render() {
		return (
			<Layout title="个人认证成功" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white">
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							个人认证
						</h1>
					</Row>
					<section className="text-center mt6">
						<IconFont type="iconfont-wancheng" className="makePhone" />
						<p className="mt2 h3">恭喜您，认证成功！</p>
						<p>页面将在<span style={{color: '#f5222d'}}>5秒</span>之后自动跳转到已认证的信息页面，是否</p>
						{/*<span className="text-primary" onClick={this.jumpLogin.bind(this)} style={{cursor:"pointer"}}>立即跳转</span>*/}
						<Link className="text-primary" style={{cursor: 'pointer'}} to={'/personalAuth'}>立即跳转</Link>
					</section>
				</section>
			</Layout>
		)
	}
}

export default MakePersonal
