import React from 'react'
import Router, {withRouter} from 'next/router'
import MallLayout from 'components/Layout/mall'
import {Button, Divider, Row, Col, Input, Layout} from 'antd';

import {
	queryGoodsDetailFun,//查询商品详情
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
import cookie from 'react-cookies';

const InputGroup = Input.Group;
const {Content} = Layout;

class MallDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			goodInfo: {},
			buyNum: 1
		}
	}

	componentDidMount() {
		this.queryGoodDetail();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id)
			this.queryGoodDetail();
	}

	//材料详情
	queryGoodDetail() {
		queryGoodsDetailFun(this.props.router.query.id).then(res => {
			if (res.result === 'success') {
				this.setState({
					goodInfo: {
						...res.data
					}
				});
			}
		})
	}

	changeBuyNum = (type) => {
		if (type === 'add') {
			this.setState({
				buyNum: ++this.state.buyNum
			})
		} else if (type === 'sub') {
			if (this.state.buyNum - 1 < 1) {
				return false;
			}
			this.setState({
				buyNum: --this.state.buyNum
			})
		}
	};

	buyGood = () => {
		if (this.userCode && this.userCode !== 'guest') {
			let goodId = this.props.router.query.id;
			cookie.save('num', this.state.buyNum);
			Router.push({pathname: '/mall/order', query: {id: goodId}})
		} else {
			Router.push({pathname: '/login/index'})
		}

	};

	render() {
		const {goodInfo} = this.state;
		const instroductImage = goodInfo.productInfos ? goodInfo.productInfos.split(',') : [];
		return (
			<MallLayout title="商品详情">
				<section className="page-content-wrapper mt2">
					<aside className="material-detail">
						<div className="material-detail-img">
							<img src={baseUrl + goodInfo.productImages} alt="" width="360" height="360" style={{border: 'solid 1px #e2e2e2'}} />
						</div>
						<div className="material-detail-info">
							<div>
								<div className="h0 text-grey">{goodInfo.productName}</div>
								<h5 className="mt3 text-muted" style={{textDecoration: 'line-through'}}>市场价：{goodInfo.settlement}</h5>
								<div className="mt3">
									<span className="h0" style={{color: '#f66f6a'}}>{goodInfo.credits}</span>
									<span style={{color: '#f66f6a'}} className="prl1">积分</span>
								</div>
							</div>
							<div className="mall-detail-button">
								<Row type="flex" align="middle" gutter={5}>
									<Col span={1} className="text-muted">数量</Col>
									<Col span={5} className="prl1">
										<InputGroup compact>
											<Button type="default" size="small" style={{height: '32px'}} onClick={() => this.changeBuyNum('sub')}>-</Button>
											<Input min={0} value={this.state.buyNum} style={{width: '64px'}} className="text-center" readOnly />
											<Button type="default" size="small" style={{height: '32px'}} onClick={() => this.changeBuyNum('add')}>+</Button>
										</InputGroup>
									</Col>
								</Row>
								<div className="mt4">
									<Button type="primary" size='large' className="bg-primary-linear border-radius" onClick={this.buyGood}>立即兑换</Button>
								</div>
							</div>
						</div>
					</aside>
					<Layout className="mt2 text-center">
						<Content className="bg-white">
							<h5 className="product-detail--title">商品描述</h5>
							<Divider style={{margin: '0'}} />
							<aside className="product-detail--content">
								{instroductImage.map((item, index) => {
									return (
										<img src={item} alt="" key={index} />
									)
								})}
							</aside>
						</Content>
					</Layout>
				</section>
			</MallLayout>
		)
	}
}

export default withRouter(MallDetail)
