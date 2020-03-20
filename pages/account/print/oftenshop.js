// 用户中心
import React, {Fragment} from 'react'
import {withRouter} from 'next/router'
import {Button,} from 'antd';
import {oftenShopPrintListFun, ofenShopMaterialFun} from 'server'
import cookie from 'react-cookies';
import '../style.less'
import {saveAs, s2ab} from 'config/export'

class OftenShop extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			oftenShopList: [],//常购材料列表
		}
	}

	componentDidMount() {
		//this.getOftenShopList();
		this.getPrintMaterial();
	}

	/**
	 * 常购材料
	 * */
	getOftenShopList() {
		oftenShopPrintListFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					oftenShopList: res.data,
				})
			}
		})
	}

	/*----选中的打印常购材料----*/
	getPrintMaterial = () => {
		ofenShopMaterialFun(this.props.router.query.ids).then(res => {
			if (res.result === 'success') {
				this.setState({
					oftenShopList: res.data,
				})
			}
		})
	};
	print = () => {
		window.document.body.innerHTML = window.document.getElementById('billDetails').innerHTML;
		window.print();
		window.location.reload();
	};

	render() {
		return (
			<section className="bg-white" style={{minHeight: '100%'}} title="常购材料打印预览">
				<div style={{width: '800px', margin: '0 auto'}} className="text-right p1">
					<Button type="primary" onClick={this.print}>打印</Button>
					<div id="billDetails">
						<div className="h0 text-center">常购材料清单</div>
						<div className="prl1 mt1 ptb2">
							<table className="mt1 h6 text-center tb-print-module">
								<tbody>
								<tr>
									<th>序号</th>
									<th>材料名称</th>
									<th>品牌</th>
									<th>单位</th>
								</tr>
								{
									this.state.oftenShopList.map((item, index) => {
										return (
											<tr key={index}>
												<td>{index + 1}</td>
												<td>{item.name}</td>
												<td>{item.brand}</td>
												<td>{item.unit}</td>
											</tr>
										)
									})
								}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default withRouter(OftenShop)
