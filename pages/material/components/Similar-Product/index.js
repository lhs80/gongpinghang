import React, {Component} from 'react';
import {queryBroweListFun} from 'newApi'
import {Row, Col, message} from 'antd'
import {baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import {guessLikeFun} from 'server';//同类商品
import './style.less'


class SimilarProductIndex extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			guessList: []
		}
	}

	componentDidMount() {
		this.getGuessListProduct();
	}

	componentDidUpdate(nextProps) {
		if (nextProps.threeId !== this.props.threeId) {
			this.getGuessListProduct();
		}
	}

	//猜你喜欢
	getGuessListProduct = () => {
		if (!this.props.threeId) return;
		let params = {
			threeId: this.props.threeId
		};
		guessLikeFun(params).then(res => {
			this.setState({
				guessList: res.data
			})
		}).catch(error => {
			message.error(error)
		})
	};

	render() {
		return (
			<aside className="bg-white" style={{padding: '20px 20px 0 20px'}}>
				<h4>同类商品</h4>
				<Row>
					{
						this.state.guessList.map((item, index) => {
							if (index < 6)
								return <Col span={4} key={index}>
									<a href={`/material/detail?id=${item.productId}`}>
										<div className="similar-product">
											<div className="cover-img">
												<img alt="img" src={item.image ? baseUrl + item.image.split(',')[0] : ''} />
											</div>
											<div className="name">
												{item.brandName} {item.productName}
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

export default SimilarProductIndex;
