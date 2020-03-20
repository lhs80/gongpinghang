import React from 'react'
import './style.less'
import {Carousel, Col, Row} from 'antd';
import {
	queryNewsMaterialShopFun,
	timeToString
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'

export default class NewCompany extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shops: []
		}
	}

	componentDidMount() {
		this.queryNewsMaterialShop();
	}

	/**
	 * 查询新入驻供货商
	 * */
	queryNewsMaterialShop = () => {
		let params = {
			shopId: ''
		};
		queryNewsMaterialShopFun(params).then(res => {
			this.setState({
				shops: res.data
			})
		})
	};

	render() {
		return (
			<div>
				<h5><b>最新加入供应商</b></h5>
				{/*<Carousel vertical={true} autoplay className="mt1" dots={false} rows={3}>*/}
				{
					this.state.shops.map((item, index) => {
						if (index < 3) {
							return (
								<Row key={index} className="h6 mt1">
									<Col span={16} className="text-ellipsis" style={{color: '#3b3b3b'}}>{item.shopName}</Col>
									<Col span={8} className="text-right" style={{color: '#3b3b3b'}}>{timeToString(item.createTime)}</Col>
								</Row>
							)
						}
					})
				}
				{/*</Carousel>*/}
			</div>
		)
	}
};
