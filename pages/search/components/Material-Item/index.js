import React from 'react'
import {Icon, Row, Col, Button} from 'antd'
import Link from 'next/link';
import {iconUrl, baseUrl} from 'config/evn'
import '../../style.less'
import AddInquiry from 'components/AddInquiry/index'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			totalInfo: 200,
			rz: '已认证',
			notRz: '未认证',
			content: '关键词搜索进入该页面，显示商家结果，并根据关键词展示该商',
			away: '',
			showSale: true,
		}
	}

	render() {
		const {materialList, searchKeyWord, showType, isLoading} = this.props;

		return (
			<section>
				{
					materialList && materialList.length > 0
						?
						showType === 'list' ?
							<table className="tb-material-item">
								<tbody>
								<tr>
									<th className="text-center">商品图</th>
									<th className="text-center">商品名</th>
									<th>起批量</th>
									<th>支持寄样</th>
									<th>商品交付</th>
									<th>价格</th>
								</tr>
								{
									materialList.map((item, index) => {
										return (
											<tr key={index}>
												<td className="cover-image">
													<a href={`/material/detail?id=${item.materialId}`} target="_blank">
														{
															item.image ?
																<img src={baseUrl + item.image.split(',')[0]} alt="" />
																:
																<img src={'images/material-nodata.png'} alt="" />
														}
													</a>
												</td>
												<td className="name">
													<a href={`/material/detail?id=${item.materialId}`} target="_blank">{item.brandName} {item.materialName}</a>
												</td>
												<td className="start-sale">≥{item.startSale}/{item.unit}</td>
												<td className="send-sample-wapper">
													{
														item.isSend === '1' ?
															<span className="send-sample">可寄样</span>
															:
															null
													}
												</td>
												<td className="pay-way">{!item.payWay ? `${item.payWay}天账期` : '现货'}</td>
												<td className="price">
													<span className="text-primary h3">{item.price < 0 ? '待询价' : '￥' + item.price}</span>
												</td>
											</tr>
										)
									})
								}
								</tbody>
							</table>
							:
							materialList.map((item, index) => {
								return <div className="material-item" key={index}>
									<div className="cover-image">
										<a href={`/material/detail?id=${item.materialId}`} target="_blank">
											{
												item.image ?
													<img src={baseUrl + item.image.split(',')[0]} alt="" />
													:
													<img src={'images/material-nodata.png'} alt="" />
											}
										</a>
									</div>
									<div className="menu">
										{
											item.collectionStatus ?
												<span><IconFont type="iconfont-shoucang4" className="icon" />已收藏</span>
												:
												<span onClick={() => this.props.addCollectPro(item.materialId)}>
													<IconFont type="iconfont-favorite" className="icon" />收藏
												</span>
										}
										<span><IconFont type='iconfont-kefu1' className="icon" /> 联系客服</span>
									</div>
									{/*<a href={`/material/detail?id=${item.materialId}`} target="_blank">*/}
									<Row className="price" type="flex" align="bottom">
										<Col span={12} className="text-primary h0">
											<small>{item.price < 0 ? '' : '￥'}</small>
											<span>{item.price < 0 ? '待询价' : item.price}</span>
										</Col>
										<Col span={12} className="text-right">
											{
												item.isSend === '1' ?
													<span className="send-sample">可寄样</span>
													:
													null
											}
										</Col>
									</Row>
									{/*</a>*/}
									<div className="name">
										<a href={`/material/detail?id=${item.materialId}`} target="_blank">{item.brandName} {item.materialName}</a>
									</div>
									<div className="shop">
										<a href={`/shop/home?id=${item.shopId}`} target="_blank" className="text-ellipsis show"
										   style={{width: '100%'}}>{item.shopName}</a>
									</div>
								</div>
							})
						:
						this.props.isLoading ?
							<div className="text-center mt6">
								<h3>
									<Icon type="loading" /> 数据加载中
								</h3>
							</div>
							:
							<div className="material-list-empty">
								<div className="icon-nodata img" />
								<div className="content">
									<h4 className="text-darkgrey">商品正在上架，敬请期待，如急需请联系客服</h4>
									<h5 className="text-lightgrey">您可以：</h5>
									<h5 className=" text-lightgrey">1. 缩短或修改您的搜索词，重新搜索；</h5>
									<h5 className=" text-lightgrey">2. 写下您的采购需求，快速获得多个供应商报价。</h5>
									<AddInquiry size="large" type={'primary'} class="border-radius mt2" text={'发布询价'} icon="iconfont-xunjia" />
								</div>
							</div>
				}
			</section>
		)
	}
}
