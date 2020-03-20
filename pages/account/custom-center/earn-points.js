//我的收益赚积分
import React from 'react'
import {Icon, Row, Col} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import Layout from 'components/Layout/account'
import './style.less'
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class EarnPoints extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<Layout title={'我的积分'} mainMenuIndex={'home'} menuIndex={'7'}>
				<div className="bg-white" style={{padding: '60px 140px'}}>
					<span className="h0 text-primary">赚积分</span>
					<Row>
						<Col span={4}>
							<span className="h5 text-muted" style={{letterSpacing: '4px'}}>积分提现金</span>
						</Col>
						<Col span={20}>
							<span className="show linePoints" />
							<img src="/static/images/intrgralText.png" alt="" className="intrgralText" />
						</Col>
					</Row>
					<section className="mt5">
						<div className="p3 getPointsWrapper" style={{boxShadow: ' 0 0 10px 0 #dae6e0'}}>
							<Row className="mt4">
								<Col span={6}>
									<img src="/static/images/integral.png" alt="" />
								</Col>
								<Col span={18}>
									<h3>攻略一&nbsp;询价得积分</h3>
									<p className="h5 text-grey mt2" style={{marginBottom: '0'}}>在线提交询价单获取积分。</p>
									<p className="h5 text-grey">提交建材询价单，且询价商家数量不少于3家，可获得5积分</p>
								</Col>
							</Row>
							<p className="h5 text-muted" style={{marginBottom: '0'}}>注意事项：</p>
							<p className="h5 text-muted" style={{marginBottom: '0'}}>用户完成企业认证后&nbsp;,&nbsp;即可获得每天20次免费询价次
								数&nbsp;;&nbsp;询价单取消后&nbsp;,&nbsp;本次询价获得的积分会被扣除。</p>
							<img src="/static/images/integral-5.png" alt="" className="getPoints" />
						</div>
						<div className="p3 getPointsWrapper mt2" style={{boxShadow: ' 0 0 10px 0 #dae6e0'}}>
							<Row className="mt4">
								<Col span={5}>
									<img src="/static/images/strategy.png" alt="" />
								</Col>
								<Col span={19}>
									<h3>攻略二&nbsp;采购得积分</h3>
									<p className="h5 text-grey mt2" style={{marginBottom: '0'}}>在线提交建材采购单获取积分。</p>
									<p className="h5 text-grey">询价后根据商家报价选择满意商家提交采购单&nbsp;,&nbsp;且商家确认订单后&nbsp;,&nbsp;可获得15积分</p>
								</Col>
							</Row>
							<p className="h5 text-muted" style={{marginBottom: '0'}}>注意事项：</p>
							<p className="h5 text-muted" style={{marginBottom: '0'}}>采购单经商家确认后不可在线取消&nbsp;,&nbsp;可自行联系商家取消订单
								&nbsp;;&nbsp;活动最终解释权归工品行所有。</p>
							<img src="/static/images/integral-15.png" alt="" className="getPoints" />
						</div>
					</section>
					<p className="text-center mt2 h5 text-muted">积分提现金&nbsp;,&nbsp;满10000积分可兑换至现金账户&nbsp;,&nbsp;
						10000积分=1000元现金&nbsp;;&nbsp;21314积分=2000元现金+1314积分</p>
				</div>
			</Layout>
		)
	}
}
