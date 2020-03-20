import React from 'react'
import Link from 'next/link'
import {getInquiryList, timeToString, getLiveData} from 'server'
import {Icon, Row, Col, Divider, Statistic, message, Carousel} from 'antd';
import {iconUrl} from 'config/evn'
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const {Countdown} = Statistic;

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			list: [],//询价单列表,
			liveData: [],//实时数据
		}
	}

	componentDidMount() {
		this.queryInquiryData();
		this.queryLiveData();
	}

	queryInquiryData = () => {
		getInquiryList().then(res => {
			this.setState({
				list: res.data,
			})
		}).catch(error => {
			message.error(error)
		})
	};

	queryLiveData = () => {
		getLiveData().then(res => {
			this.setState({
				liveData: res.data,
			})
		}).catch(error => {
			message.error(error)
		})
	};

	render() {
		const {list, liveData} = this.state;
		return (
			<section className="index-material-inquiry-panel">
				<aside className="left">
					<Row type="flex" align="middle" style={{lineHeight: '1'}}>
						<Col span={12} className="h2"><h2><b>询价大厅</b></h2></Col>
						<Col span={12} className="text-right text-muted"><a href="/enquiry/index" target="_blank">更多 >></a></Col>
					</Row>
					<Row>
						{
							list && list.map((item, index) => {
								return (
									<Col span={8} className="item" key={index}>
										<Link href={{pathname: '/enquiry/detail', query: {id: item.inquirySheetId}}}>
											<div style={{cursor: 'pointer'}}>
												<h4 className="title" style={{width: '90%'}}>{item.title}</h4>
												<h6 className="identity">买家身份：{item.buyerIdentity}</h6>
												<h6 className="area">收货地区：{item.province}{item.city}</h6>
												<div className="icon-inquiry-flag flag">{item.materialCount}种</div>
												<Row className="info">
													<Col span={7} className="text-plus">
														<IconFont type='iconfont-baojia1' />
														<span> {item.quotationCount}家已报价</span>
													</Col>
													<Col span={17} className="text-right text-primary">
														<IconFont type="iconfont-jishiqi" />
														<Countdown
															title="倒计时"
															value={item.validityTime}
															format="D天H时m分s秒"
															valueStyle={{fontSize: '12px', color: '#FFB432'}} />
													</Col>
												</Row>
											</div>
										</Link>
									</Col>
								)
							})
						}
					</Row>
				</aside>
				<aside className="right">
					<div><h2><b>实时数据</b></h2></div>
					<Row className="mt2">
						<Col span={10} className="text-center">
							<h6 className="text-muted">正在询价</h6>
							<div className="text-primary-linear h0 mt1"><b>{liveData.inquiryCount}</b></div>
						</Col>
						<Col span={2} className="text-center">
							<Divider type="vertical" style={{height: '55px'}} />
						</Col>
						<Col span={10} className="text-center">
							<h6 className="text-muted">当前报价</h6>
							<div className="text-primary-linear h0 mt1"><b>{liveData.quotationCount}</b></div>
						</Col>
					</Row>
					<h5 className="mt4"><b>最新成交</b></h5>
					<Row className='ptb1' style={{borderBottom: 'solid 1px #E2E2E2'}}>
						<Col span={12} className="text-muted h6">卖家名称</Col>
						<Col span={12} className="text-muted text-right h6">金额（元）</Col>
					</Row>
					{/*<Carousel vertical={true} autoplay dots={false} rows={5}>*/}
					{
						liveData && liveData.latestOrder && liveData.latestOrder.map((item, index) => {
							if (index < 4)
								return (
									<Row style={{marginTop: '8px'}} className="h6 mt1" key={index}>
										<Col span={12} className="text-darkgrey text-ellipsis">{item.shopName}</Col>
										<Col span={12} className="text-lightgrey text-right">{item.orderAmount}</Col>
									</Row>
								)
						})
					}
					{/*</Carousel>*/}
					{/*{*/}
					{/*liveData && liveData.latestOrder && liveData.latestOrder.map((item, index) => {*/}
					{/*if (index < 4)*/}
					{/*return (*/}
					{/*<Row style={{marginTop: '8px'}} key={index}>*/}
					{/*<Col span={12} className="text-darkgrey text-ellipsis">{item.shopName}</Col>*/}
					{/*<Col span={12} className="text-lightgrey text-right">{item.orderAmount}</Col>*/}
					{/*</Row>*/}
					{/*)*/}
					{/*})*/}
					{/*}*/}
				</aside>
			</section>
		)
	}
}
