import React, {Fragment} from 'react'
import {withRouter} from 'next/router'
import {Button, Row, Col} from 'antd';
import {quoteDetailFun, timestampToTime, queryInquiryDetailFun} from 'server'
import '../style.less'

class PrintQuote extends React.Component {
	constructor(props) {
		super(props);
		this.shopId = this.props.router.query.shopId;//this.props.match.params.id;
		this.sheetId = this.props.router.query.sheetId;//this.props.match.params.sheetId;
		this.state = {
			inquiryInfo: {},
			materialList: [],
			shopList: [],
			quoteInfo: {}
		}
	}

	componentDidMount() {
		this.queryInquiryDetail();
		this.queryDetail();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.shopId !== this.props.router.query.shopId || prevProps.router.query.sheetId !== this.props.router.query.sheetId) {
			this.queryInquiryDetail();
			this.queryDetail();
		}
	}

	/**
	 * 报价单详情
	 * */
	queryInquiryDetail() {
		let params = {
			shopId: this.props.router.query.shopId,
			inquirySheetId: this.props.router.query.sheetId,
		};
		quoteDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					quoteInfo: res.data[0],
					materialList: res.data[0].inquirySheetMaterials
				});
			}
		})
	}

	/**
	 * 询价单详情
	 * */
	queryDetail() {
		let params = {
			userCode: this.userCode,
			inquirySheetId: this.props.router.query.sheetId,
		};
		queryInquiryDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryInfo: res.data,
				});
			}
		})
	}

	computedQuoteRequirement() {
		switch (this.state.inquiryInfo.quoteRequirement) {
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
		const {inquiryInfo, quoteInfo} = this.state;
		const shopName = this.state.shopList.map((item, index) => {
			return item.shopName + ',';
		});
		return (
			<section className="bg-white" style={{minHeight: '100%'}}>
				<div style={{width: '800px', margin: '0 auto'}} className="p1">
					<div className="text-right">
						<Button type="primary" onClick={this.print}>打印</Button>
					</div>
					<div id="billDetails">
						<div className="h0 text-center">报价单</div>
						<div style={{border: 'dashed 1px #ddd'}} className="prl1 mt1 ptb2">
							<Row className="h6">
								<Col span={12}>
									询价单标题：{inquiryInfo.title}
								</Col>
								<Col span={12}>
									询价单编号:{inquiryInfo.inquiryCode}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									报价商家：{quoteInfo.shopName}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col span={12}>
									报价日期：{timestampToTime(inquiryInfo.modifyTime)}
								</Col>
								<Col span={12}>
									报价有效期：{timestampToTime(inquiryInfo.validityTime)}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									报价要求： {this.computedQuoteRequirement()}
								</Col>
							</Row>
							{/*<Row className="mt1 h6">
                <Col span={12}>
                  收货人：{inquiryInfo.consigneeName}
                </Col>
                <Col span={12}>
                  联系电话：{inquiryInfo.consigneePhone}
                </Col>
              </Row>
              <Row className="mt1 h6">
                <Col>
                  收货地址：{inquiryInfo.consigneeAddress}
                </Col>
              </Row>*/}
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
									<td colSpan="2" className="text-right">材料总价：</td>
									<td className="text-right prl1">{quoteInfo.totalPrice}元</td>
									<td colSpan="2" className="text-right">税金金额：</td>
									<td className="text-right prl1">{quoteInfo.totalTaxes}元</td>
								</tr>
								<tr>
									<td colSpan="3" />
									<td colSpan="2" className="text-right">优惠金额：</td>
									<td className="text-right prl1">{quoteInfo.discountAmount}元</td>
									<td colSpan="2" className="text-right">最终报价：</td>
									<td className="text-right prl1">{quoteInfo.finalOffer}元</td>
								</tr>
								</tbody>
							</table>
							<h6 className="mt1">
								买家备注：{inquiryInfo.buyerNote ? inquiryInfo.buyerNote : '无'}
							</h6>
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default withRouter(PrintQuote)
