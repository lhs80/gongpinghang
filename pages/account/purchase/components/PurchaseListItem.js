import React, {Component} from 'react';
import Router, {withRouter} from 'next/router'
import Link from 'next/link'
import {Avatar, Button, Col, Row, Table, Icon, Input, Modal} from 'antd';
import {baseUrl, iconUrl} from 'config/evn';
import ButtonMenus from './button-menu'
import cookie from 'react-cookies';
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
const {Column} = Table;

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class PurchaseListItem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cancelReason: '',
			execptionReason: '',
			showConnect: 'none',
			toUserCode: ''
		}
	}

	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};
	connectCustomer = (e) => {
		e.stopPropagation();
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block',
				toUserCode: this.props.item.shopUserCode
			})
		} else {
			Router.push('/login/index');
		}
	};

	render() {
		const {item, orderType} = this.props;
		return (
			<div className="mt2">
				{item && item.list ?
					<Table
						size="small"
						pagination={false}
						className="purchase-item"
						rowKey={(record, index) => record.productId + record.attributeValue + index}
						dataSource={item.list}
						footer={() => {
							return (
								<Link href={{pathname: '/account/purchase/detail', query: {id: item.orderId}}}>
									<Row type='flex' align='bottom'>
										<Col span={8}>
											<span className="text-muted">共<i className="text-primary">{item.list.length}</i>种产品</span>
										</Col>
										<Col span={8}>
											<span className="text-muted">订单号：</span>
											<span className="text-black">{item.orderCode}</span>
											{item.isBatch ? <IconFont type="iconfont-pifa" className="text-danger h3" /> : ''}
										</Col>
										<Col span={8} className="text-right">
											<span className="text-muted">合计：（含运费￥{item.freight}）</span>
											<small>￥</small>
											<span className="h3 text-primary">{Number(item.orderAmount) + Number(item.freight)}</span>
										</Col>
									</Row>
								</Link>
							)
						}}
						onRow={record => {
							return {
								onClick: event => {
									Router.push({pathname: '/account/purchase/detail', query: {id: item.orderId}})
								}, // 点击行
							};
						}}
						onHeaderRow={column => {
							return {
								onClick: () => {
									Router.push({pathname: '/account/purchase/detail', query: {id: item.orderId}})
								}, // 点击表头行
							};
						}}
					>
						<Column
							width={orderType === '1' ? 150 : 280}
							title={
								<div>
									<span className='text-ellipsis' style={{display: 'inline-block', maxWidth: '100px'}} title={item.shopName}> {item.shopName}</span>
									<IconFont type="iconfont-liaotian" className="text-info h3" style={{verticalAlign: 'baseline'}}
									          onClick={(e) => this.connectCustomer(e)} />
								</div>
							}
							dataIndex="image"
							render={(text, record) => (
								<div className="product-item-name">
									{orderType === '1' ? null : <Avatar shape="square"
									                                    src={record.image ? baseUrl + record.image.split(',')[0] : '/static/images/nologin.png'}
									                                    size={38} />}
									{orderType === '1' ?
										<div>
											<div className="h5 prl1" style={{wordBreak: 'break-word'}}>{record.materialBrand} {record.materialName}</div>
											<div className="text-lightgrey text-left h6"
											     style={{marginTop: '5px'}}>品牌：{record.materialBrand}</div>
										</div>
										:
										<div style={{marginLeft: '14px'}}>
											<div className="h5 prl1" style={{wordBreak: 'break-word'}}>{record.materialBrand} {record.materialName}</div>
											{record.optionalAttribute ? <div className="text-lightgrey text-left h6"
											                                 style={{marginTop: '5px'}}>{record.optionalAttribute}：{record.attributeValue}</div> : ''}
										</div>}
								</div>
							)}
						/>
						<Column
							title='数量'
							dataIndex='quantity'
							align='center'
						/>
						<Column
							title='单价（元）'
							dataIndex='unitPrice'
							align='center'
						/>
						<Column
							title='金额（元）'
							dataIndex='materialUnit'
							align='center'
							render={(text, record) => <span
								className="text-muted">{parseFloat(record.quantity * record.unitPrice).toFixed(2)}</span>}
						/>
						{
							orderType === '1' ? <Column
								title='描述'
								dataIndex='remark'
								align='center'
								render={(text, record) => <span
									className="text-muted">{record.remark || '--'}</span>}
							/> : ''
						}
						<Column
							title='状态'
							align='center'
							width={100}
							render={(value, row, index) => {
								const obj = {
									children: <Button type="link" className="text-primary">{item.statusName}</Button>,
									props: {},
								};
								if (index === 0) {
									obj.props.rowSpan = item.list.length;
								} else {
									obj.props.rowSpan = 0;
								}
								return obj;
							}
							}
						/>
						<Column
							title='操作'
							align='center'
							width={100}
							render={(value, row, index) => {
								const obj = {
									children: <ButtonMenus item={item} type='list' amount={Number(item.orderAmount) + Number(item.freight)} reload={this.props.reload}
									                       invoiceId={item.invoiceId} />,
									props: {},
								};

								if (index === 0) {
									obj.props.rowSpan = item.list.length;
								} else {
									obj.props.rowSpan = 0;
								}
								return obj;
							}}
						/>
					</Table>
					:
					''
				}
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.toUserCode} closeModal={this.closeModal} />
			</div>
		);
	}
}

export default withRouter(PurchaseListItem);
