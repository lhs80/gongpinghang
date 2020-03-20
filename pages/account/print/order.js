// 用户中心
import React, {Fragment} from 'react'
import {withRouter} from 'next/router'
import {Button, Row, Col} from 'antd';
import {orderDetailFun, timestampToTime} from 'server'

class PriceOrderInfo extends React.Component {
	constructor(props) {
		super(props);
		// this.shopId = this.props.match.params.id;
		// this.sheetId = this.props.match.params.sheetId;
		this.state = {
			orderInfo: {},
			materialList: [],
			shopList: [],
		}
	}

	componentDidMount() {
		this.queryInquiryDetail();
	}


	queryInquiryDetail() {
		orderDetailFun(this.props.router.query.id).then(res => {
			if (res.result === 'success') {
				this.setState({
					orderInfo: res.data,
					materialList: res.data.materialOrderSheetMaterialList,
				});
			}
		})
	}

	computedQuoteRequirement() {
		switch (this.state.orderInfo.quoteRequirement) {
			case 0:
				return '无要求';
			case 1:
				return '含税 不含运费';
			case 2:
				return '不含税 含运费';
			case 3:
				return '含税 含运费'
		}
	}

	print = () => {
		window.document.body.innerHTML = window.document.getElementById('billDetails').innerHTML;
		window.print();
		window.location.reload();
	};

	render() {
		const {orderInfo} = this.state;
		const shopName = this.state.shopList.map((item, index) => {
			return item.shopName + ',';
		});
		return (
			<section className="bg-white" style={{minHeight: '100%'}} title="询价单详情打印预览">
				<div style={{width: '800px', margin: '0 auto'}} className="p1">
					<div className="text-right">
						<Button type="primary" onClick={this.print}>打印</Button>
					</div>
					<div id="billDetails">
						<div className="h0 text-center">采购单</div>
						<div style={{border: 'dashed 1px #ddd'}} className="prl1 mt1 ptb2">
							<Row className="h6">
								<Col span={12}>
									采购单编号：{orderInfo.orderCode}
								</Col>
								<Col span={12}>
									提交日期:{timestampToTime(orderInfo.createTime)}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									发送商家：{orderInfo.shopName}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									报价要求： {this.computedQuoteRequirement()}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col span={12}>
									收货人：{orderInfo.consigneeName}
								</Col>
								<Col span={12}>
									联系电话：{orderInfo.consigneePhone}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									收货地址：{orderInfo.consigneeAddress}
								</Col>
							</Row>
							<table className="mt1 h6 text-center tb-print-module">
								<tbody>
								<tr>
									<th>序号</th>
									<th>材料名称</th>
									<th>品牌</th>
									<th>单位</th>
									<th>数量</th>
									<th>单价(元)</th>
									<th>税率</th>
									<th>材料款(元)</th>
									<th>税金(元)</th>
								</tr>
								{
									this.state.materialList.map((item, index) => {
										return (
											<tr key={index}>
												<td>{index + 1}</td>
												<td>{item.materialName}</td>
												<td>{item.materialBrand}</td>
												<td>{item.materialUnit}</td>
												<td>{item.quantity}</td>
												<td>{item.unitPrice}</td>
												<td>{item.taxRate}</td>
												<td>{item.totalPrice}</td>
												<td>{item.taxes}</td>
											</tr>
										)
									})
								}
								<tr>
									<td colSpan="3" />
									<td colSpan="2" className="text-right">采购单金额：</td>
									<td className="text-right prl1">{orderInfo.orderAmount}元</td>
									<td colSpan="2" className="text-right">材料总价：</td>
									<td className="text-right prl1">{orderInfo.totalAmount}元</td>
								</tr>
								<tr>
									<td colSpan="3" />
									<td colSpan="2" className="text-right">税金金额：</td>
									<td className="text-right prl1">{orderInfo.totalTaxes}元</td>
									<td colSpan="2" className="text-right">优惠总价：</td>
									<td className="text-right prl1">{orderInfo.discountAmount}元</td>
								</tr>
								</tbody>
							</table>
							<h6 className="mt1">
								订单备注：{orderInfo.orderNote ? orderInfo.orderNote : '无'}
							</h6>
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default withRouter(PriceOrderInfo)
