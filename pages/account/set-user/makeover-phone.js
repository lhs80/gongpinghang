// 账户设置
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col} from 'antd';
import cookie from 'react-cookies';
import {iconUrl} from 'config/evn'
import Link from 'next/link'
import './style.less'


const {Content} = Layout;
const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MakePhone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			count: 5
		}
	}

	/*----跳转到登录页----*/
	jumpLogin = () => {
		cookie.remove('ZjsWeb');
		Router.push(`/login/index`);
	};

	/*---手机号----*/
	componentDidMount() {
		this.countDown();
	}

	countDown = () => {
		let count = 5;
		let countdown = setInterval(CountDown, 1000);
		let self = this;

		function CountDown() {
			self.setState({
				count: count,
			});
			if (count === 1) {
				cookie.remove('ZjsWeb');
				clearInterval(countdown);
				Router.push('/login/index')
				// self.props.history.push(`/login`);
			}
			count--;
		}
	};

	render() {
		return (
			<Layout title="设置成功" mainMenuIndex={'setting'} menuIndex={'3'}>
				<section className="bg-white p4" style={{height: '766px'}}>
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							更改手机号
						</h1>
					</Row>
					<Row>
						<Col span={18} offset={3}>
							<Steps current={2} className="mt3 settingStep">
								<Step title="手机号验证" status="process" />
								<Step title="输入新手机号" status="process" />
								<Step title="完成" />
							</Steps>
						</Col>
					</Row>
					<section className="text-center mt6">
						<IconFont type="iconfont-wancheng" className="makePhone" />
						<p className="mt2 h3">手机号码更换成功</p>
						<p>页面将在<span style={{color: '#f5222d'}}>{this.state.count}秒</span>之后自动跳转到登录页面</p>
						<span className="text-primary" onClick={this.jumpLogin.bind(this)} style={{cursor: 'pointer'}}>立即跳转</span>
					</section>
				</section>
			</Layout>
		)
	}
}

export default MakePhone
