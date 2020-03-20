import React, {Component} from 'react';
import {queryBroweListFun} from 'newApi'
import {Row, Col, Card} from 'antd'
import {baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import './style.less'

class RecentViewIndex extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			list: []
		}
	}

	componentWillMount() {
		this.queryBroweList();
	}

	queryBroweList = () => {
		let params = {
			userCode: this.userCode
		};
		queryBroweListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					list: res.data
				})
			}
		})
	};

	render() {
		return (
			<aside className="bg-white" style={{padding: '20px 20px 0 20px'}}>
				<h4>最新浏览</h4>
				<Row gutter={20}>
					{
						this.state.list.map((item, index) => {
							if (index < 8)
								return <Col span={3} key={index}>
									<a href={`/material/detail?id=${item.productId}`}>
										<div className="recent-view-product">
											<div className="cover-img">
												<img alt="img" src={item.image ? baseUrl + item.image.split(',')[0] : ''} />
											</div>
											<div className="name">
												{item.brandName} {item.name}
											</div>
											<div className="price">
												{item.price < 0 ? '待询价' : '￥' + item.price}
											</div>
										</div>
									</a>
								</Col>
						})
					}
				</Row>
			</aside>
		);
	}
}

export default RecentViewIndex;
