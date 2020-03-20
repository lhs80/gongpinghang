import React from 'react'
import {Row, Col, Button, Carousel} from 'antd'
import './style.less'
import {timeToString} from '../../../../server';

export default class Banner extends React.Component {
	render() {
		return (
			<aside className="service-panel">
				<Row>
					<Col className="left">
						<h2><b>工品行 · 金融服务</b></h2>
						<Row>
							<Col span={12} className="adv-panel">
								<h1 style={{lineHeight: '1',color:'#3b3b3b'}}>先收货后付款，账期最长 <span className="text-primary large">90</span> 天</h1>
								<h4 style={{lineHeight: '1',color:'#3b3b3b'}} className="mt2">采购更放心！</h4>
								<Button>买家开通></Button>
								<div className="icon-img-buyer cover-image" />
							</Col>
							<Col span={12} className="adv-panel">
								<h1 style={{lineHeight: '1',color:'#3b3b3b'}}>利率低至年化 <span className="text-plus large">4.35%</span></h1>
								<h4 style={{lineHeight: '1',color:'#3b3b3b'}}>赊销卖建材，回款不担心！</h4>
								<Button>卖家开通></Button>
								<div className="icon-img-saler cover-image" />
							</Col>
						</Row>
					</Col>
					<Col className="right">
						<h2><b>最新开通</b></h2>
						<Carousel vertical={true} autoplay className="mt2" dots={false} rows={8}>
							<div className='item'><span className="flag"><i>赊</i></span>广州石联新材料制造有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>合肥市爱佳建筑幕墙系统有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>泰州江山消防器材有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>南京耀青幕墙工程有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>苏州世煦机电设备有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>合肥飞磊涂料有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>广州雅通建材有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>嘉兴市敏达环保设备有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>柳州远信钢结构有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>温州昌达建筑机械租赁有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>嘉兴阀门和旋塞公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>柳州名标建材有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>沈阳科尼消防设备有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>台州永胜船用阀门有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>青岛安基诺钢结构有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>青岛润昊氟涂料科技有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>沈阳仁辉消防科技有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>石家庄捷成门窗有限公司</div>
							<div className='item'><span className="flag"><i>赊</i></span>深圳煌发石材有限公司</div>
						</Carousel>
					</Col>
				</Row>
			</aside>
		)
	}
};
