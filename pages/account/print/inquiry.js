// 用户中心
import React, {Fragment} from 'react'
import {Button, Row, Col} from 'antd';
import {queryInquiryDetailFun, timestampToTime} from 'server'
import cookie from 'react-cookies';
import {withRouter} from 'next/router'

class PrintInquiry extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			inquiryInfo: {},
			materialList: [],
			shopList: []
		}
	}

	componentDidMount() {
		this.queryInquiryDetail();
	}

	/**
	 * 询价单详情
	 * */
	queryInquiryDetail() {
		let params = {
			userCode: this.userCode,
			inquirySheetId: this.props.router.query.id
		}
		queryInquiryDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryInfo: res.data,
					materialList: res.data.inquirySheetMaterials,
					shopList: res.data.inquirySheetShops
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
		const {inquiryInfo} = this.state;
		const shopName = this.state.shopList.map((item, index) => {
			return item.shopName + ',';
		});
		return (
			<section className="bg-white" style={{minHeight: '100%'}} title="打印询价单详情">
				<div style={{width: '800px', margin: '0 auto'}} className="p1">
					<div className="text-right">
						<Button type="primary" onClick={this.print}>打印</Button>
					</div>
					<div id="billDetails">
						<div className="h0 text-center">询价单</div>
						<div style={{border: 'dashed 1px #ddd'}} className="prl1 mt1 ptb2">
							<Row className="h6">
								<Col span={12}>
									询价单标题：{inquiryInfo.title}
								</Col>
								<Col span={12}>
									询价单编号:{inquiryInfo.inquiryCode}
								</Col>
							</Row>
							{/*<Row className="mt1 h6">*/}
								{/*<Col>*/}
									{/*买家身份：{inquiryInfo.buyerIdentity}*/}
								{/*</Col>*/}
							{/*</Row>*/}
							<Row className="mt1 h6">
								<Col span={12}>
									最后发送时间：{timestampToTime(inquiryInfo.modifyTime)}
								</Col>
								<Col span={12}>
									截止报价时间：{timestampToTime(inquiryInfo.validityTime)}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									报价要求： {this.computedQuoteRequirement()}
								</Col>
							</Row>
							<Row className="mt1 h6">
								<Col>
									报价供应商：{shopName}
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
											</tr>
										)
									})
								}
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

export default withRouter(PrintInquiry)
