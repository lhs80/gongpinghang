import React from 'react'
import {Col, Icon, Row, Radio, Card, Pagination} from 'antd';
import Link from 'next/link';
import Layout from 'components/Layout/mall'
import {baseUrl, iconUrl} from 'config/evn'
import {queryGoodsFun} from 'server'
import cookie from 'react-cookies';
import './style.less'

const {Meta} = Card;

export default class MallIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			queryType: '0',
			sortType: 0,
			list: [],
			loading: true,
		}
	}

	componentDidMount() {
		this.queryGoods();
	}

	/**
	 * 查询的商品类型改变
	 * */
	queryTypeChange = (e) => {
		this.setState({
			queryType: e.target.value
		}, () => {
			this.queryGoods();
		})
	};

	/**
	 * 排序试改变
	 * */
	changeSortType = () => {
		this.setState({
			sortType: this.state.sortType ? 0 : 1
		}, () => {
			this.queryGoods();
		})
	};

	queryGoods = () => {
		queryGoodsFun(this.state.sortType, this.state.queryType, this.userCode).then(res => {
			this.setState({
				list: res.data
			}, () => {
				this.setState({
					loading: false
				})
			})
		})
	};

	render() {
		return (
			<Layout title="积分商城" showBigImage={true}>
				<section className="page-content-wrapper">
					<Row type="flex" align="center">
						<Col span={12}>
							<Radio.Group value={this.state.queryType} onChange={this.queryTypeChange}>
								<Radio.Button value="0">全部礼品</Radio.Button>
								<Radio.Button value="1">推荐礼品</Radio.Button>
								<Radio.Button value="2">我能兑换</Radio.Button>
							</Radio.Group>
						</Col>
						<Col span={12} className="text-right">
              <span onClick={this.changeSortType} style={{cursor: 'pointer'}}>
                积分排序 <Icon type={this.state.sortType === 0 ? 'caret-up' : 'caret-down'} style={{color: '#d9d9d9'}} />
              </span>
						</Col>
					</Row>
					<aside className=" mt2">
						<Row gutter={16} className="mall-list">
							{
								this.state.list.map((item, index) => {
									return (
										<Col span={6} key={index}>
											<Card
												loading={this.state.loading}
												bordered={false}
												style={{width: 293}}
												cover={
													<Link href={{pathname: '/mall/detail', query: {id: item.id}}}>
														<img style={{width: 293}} alt="商品主图" src={`${baseUrl}${item.productImages}`} />
													</Link>
												}
												className={index >= 4 ? 'mt2' : ''}
											>
												<Meta
													title={item.productName}
													description={
														<Row gutter={5} type="flex" align="bottom">
															<Col span={12} className="text-right" style={{color: '#f66f6a'}}><b
																className="h2">{item.credits}</b> 积分</Col>
															<Col span={12} style={{textDecoration: 'line-through'}}>市场价：{item.settlement}元</Col>
														</Row>
													}
												/>
											</Card>
										</Col>
									)
								})
							}
						</Row>
					</aside>
				</section>
			</Layout>
		)
	}
}
