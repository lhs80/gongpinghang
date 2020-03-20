import React, {Component, Fragment} from 'react';
import {Avatar, Divider, Icon, Table, Button, Row, Col, Input} from 'antd';
import {baseUrl, iconUrl} from '../../../config/evn';
import Link from 'next/dist/client/link';

const {Column} = Table;
const {TextArea} = Input;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class GoodList extends Component {

	render() {
		const {orderInfo} = this.props;
		return (
			<Fragment>
				<Row className="common-title" type="flex" align="middle">
					<Col span={12}>
						<Divider type="vertical" className="line" />
						配送清单
					</Col>
					<Col span={12} className="text-right">
						<Button type="link" href="/account/cart/home">返回购物车修改</Button>
					</Col>
				</Row>
				<div className="bg-muted" style={{margin: '0 20px'}}>
					{
						orderInfo && orderInfo.orderList && orderInfo.orderList.map((item, key) => {
							return (
								item.list.length ?
									<Table
										className="mt1"
										size="small"
										pagination={false}
										dataSource={item.list}
										key={key}
										rowKey={record => record.productCartId}
									>
										<Column
											width={380}
											title={
												<span>
													<Link href={`/shop/home?id=${item.shopId}`}>
													<a>商家：{item.shopName}</a>
													</Link>
													<IconFont type="iconfont-liaotian" className="text-info h4"
													          onClick={() => this.connectCustomer(item.sellerUserCode)} />
												</span>
											}
											render={(text, record) => (
												<div className="product-item-name">
													<Link href={`/material/detail?id=${record.productId}`}>
														<Avatar shape="square"
														        src={record.image ? baseUrl + record.image.split(',')[0] : '/static/images/nologin.png'}
														        size={60}
														/>
													</Link>
													<div className="prl1" style={{verticalAlign: 'middle', cursor: 'pointer', display: 'inline-block'}}>
														<Link href={`/material/detail?id=${record.productId}`}>
															<h5 className="text-ellipsis" style={{width: '320px'}}>{record.materialBrand} {record.productName}</h5>
														</Link>
														{record.optionalAttribute ?
															<div className="text-muted h5"
															     style={{marginTop: '5px'}}>{record.optionalAttribute}：{record.attributeValue}</div>
															:
															''
														}
													</div>
												</div>
											)}
										/>
										<Column
											title="单价"
											width={150}
											dataIndex='price'
											align='center'
											render={(value, row, index) => {
												const {rangePrice, price} = row;
												let obj = {};
												let newPrice = price;
												if (rangePrice && row.num > 0) {
													newPrice = rangePrice.filter(
														item =>
															item.end === 0 && Number(item.start) <= row.num
															||
															item.end !== 0 && Number(item.start) <= row.num && Number(item.end) >= row.num
													);
													obj = {
														children: <h5>￥{newPrice.length ? newPrice[0].price : rangePrice[0].price}</h5>
													}
												} else {
													obj = {
														children: <h5>￥{newPrice}</h5>
													};
												}
												return obj;
											}}
										/>
										<Column
											title="数量"
											width={100}
											dataIndex='num'
											align='center'
										/>
										<Column
											title="小计"
											width={100}
											dataIndex='materialUnit'
											align='center'
											render={(text, record) => <span>￥{(record.num * record.price).toFixed(2)}</span>}
										/>
										<Column
											width={280}
											render={(text, record, index) => {
												let obj = {
													children: <Fragment>
														<div>备注</div>
														<TextArea placeholder="请填写订单备注(选填)" autosize={{minRows: 4, maxRows: 4}} maxLength={50}
														          onChange={(e) => this.props.orderNoteChange(e, key)} />
														<div className="mt2">运费：{item.freight}元</div>
													</Fragment>,
													props: {}
												};
												if (index === 0) {
													obj.props.rowSpan = 2
												}
												if (index > 0) {
													obj.props.rowSpan = 0
												}
												return obj;
											}
											}
										/>
									</Table>
									:
									null
							)
						})
					}
				</div>
			</Fragment>
		);
	}
}

export default GoodList;
