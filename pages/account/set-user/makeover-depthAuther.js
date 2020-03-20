// 企业深度认证最后一步
import React from 'react'
import {withRouter} from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Button, Row, Col, Steps} from 'antd';
import cookie from 'react-cookies';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun} from 'server'
import './style.less'

const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DepthAuthComOver extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			status: this.props.router.query.status,//this.props.match.params.status,
			autherError: 'none',
			autherOk: 'none',
			count: 5
		}
	}

	/*------重新认证-----*/
	againAuther = () => {
		this.props.history.push(`/depthAuther`)
	};
	/*------返回用户资料----*/
	blackPersonalCenter = () => {
		this.props.history.push(`/userinfo`)
	};
	/*-----立即跳转----*/
	jumpAuther = () => {
		this.props.history.push(`/companyAuthCom`)
	};

	componentDidMount() {
		const {status} = this.state;
		if (status === 'error') {
			this.setState({
				autherError: 'block',
				autherOk: 'none'
			})
		} else if (status === 'success') {
			this.setState({
				autherError: 'none',
				autherOk: 'block'
			})
			this.countDown();
		}
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
				clearInterval(countdown);
				self.props.history.push(`/userinfo`);
			}
			count--;
		}
	};

	render() {
		const {autherOk, autherError} = this.state;
		return (
			<Layout title="完成认证" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white" style={{padding: '40px 70px 0 70px', height: '899px'}}>
					<Row>
						<h1 className="h0">
							企业深度认证
						</h1>
					</Row>
					<Row>
						<Col span={22} offset={1}>
							<Steps current={4} className="mt3 settingStep">
								<Step title="填写企业信息" status="process" />
								<Step title="完善管理人信息" status="process" />
								<Step title="提交信息待审核" status="process" />
								<Step title="等待收款，回填金额" status="process" />
								<Step title="完成认证" />
							</Steps>
						</Col>
					</Row>
					<section className="text-center" style={{paddingTop: '80px'}}>
						<div style={{display: autherOk}}>
               <span>
                   <IconFont type="iconfont-wancheng" style={{fontSize: '100px', color: '#18bcc9'}} />
               </span>
							<p className="text-darkgrey h3 mt2">认证成功</p>
							<p>
								页面将在<span style={{color: '#f5222d'}}>{this.state.count}秒</span>之后自动跳转到已认证的信息页面，是否
								<span className="text-primary" onClick={this.jumpAuther.bind(this)} style={{cursor: 'pointer'}}>立即跳转</span>
							</p>
							<div className="text-darkgrey text-left mt2" style={{width: '260px', margin: 'auto'}}>
								<p style={{marginBottom: '0'}}>您将获得</p>
								<p style={{marginBottom: '0'}}>1、《建材仓》模块免费询价资格；</p>
								<p style={{marginBottom: '0'}}>2、电子合同签署资格（免费）；</p>
							</div>
						</div>
						<div style={{display: autherError}}>
                                       <span>
                                           <IconFont type="iconfont-shibai" style={{fontSize: '100px', color: '#f08455'}} />
                                       </span>
							<p className="text-darkgrey h3 mt2">认证失败</p>
							<p className="text-muted h5">打款金额验证失败，您已用完所有机会</p>
							<div className="" style={{width: '300px', margin: 'auto', paddingTop: '80px'}}>
								<Button type="primary" size="large" htmlType="submit" block className="h3" style={{height: '50px', marginBottom: '10px'}}
								        onClick={this.againAuther.bind(this)}>重新认证</Button>
								<a href="javascript:;" onClick={this.blackPersonalCenter.bind(this)} className="text-primary">返回个人中心</a>
							</div>
						</div>
					</section>
				</section>
			</Layout>
		)
	}
}

export default withRouter(DepthAuthComOver)
