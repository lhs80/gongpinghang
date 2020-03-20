// 深度认证第三步
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Form, Button} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {checkBank} from 'config/regular'
import cookie from 'react-cookies';
import {picUploadFun, autherInfoFun, dapthCertifyFun, userCodeFun} from 'server'
import './style.less'

const Step = Steps.Step;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DepthAuding extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
		};
	}

	render() {
		return (
			<Layout title="深度认证-提交信息待审核" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white p4" style={{height: '974px'}}>
					<Row style={{paddingLeft: '30px'}}>
						<h1 className="h0">
							企业深度认证
						</h1>
					</Row>
					<Row>
						<Col span={22} offset={1}>
							<Steps current={2} className="mt3 settingStep">
								<Step title="填写企业信息" status="process" />
								<Step title="完善管理人信息" status="process" />
								<Step title="提交信息待审核" />
								<Step title="等待收款，回填金额" />
								<Step title="完成认证" />
							</Steps>
						</Col>
					</Row>
					<section style={{width: '490px', margin: '80px auto 0'}} className="text-center">
						<span><IconFont type="iconfont-shenhe" style={{fontSize: '100px', color: '#18bcc9'}} /></span>
						<p className="h3 mt1 text-grey" style={{margin: '0px'}}>提交信息成功，待审核</p>
						<p className="text-center mt2 text-muted">平台将在1-2个工作日完成审核，审核通过后会向您的企业对公账号打一笔款项，请在收到打款后回到本页面填写打款金额以完成认证</p>
						<div style={{width: '300px', margin: '100px auto 0'}}>
							<Button type="primary" size="large" block style={{height: '50px', lineHeight: '50px'}}
							        onClick={()=>{
							        	Router.push({pathname:'/account/set-user/index'})
							        }}>返回账户资料</Button>
						</div>
					</section>
				</section>
			</Layout>
		)
	}
}

export default DepthAuding
