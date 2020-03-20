import React from 'react'
import {Icon, Row, Col} from 'antd'
import Link from 'next/link';
import {iconUrl, baseUrl} from 'config/evn'
import './style.less'
import AddInquiry from 'components/AddInquiry/index'

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			totalInfo: 200,
			rz: '已认证',
			notRz: '未认证',
			content: '关键词搜索进入该页面，显示商家结果，并根据关键词展示该商',
			away: '',
			showSale: true,
		}
	}

	render() {
		const {materialList, searchKeyWord, num, isLoading} = this.props;
		return (
			<section className='ptb1 bg-white mt2'>
				{
					materialList && materialList.length > 0
						?
						materialList.map((item, index) => {
							return (
								<div className={`product-material-item-${num}`} key={index}>
									<div className="cover-image">
										<a href={`/material/detail?id=${item.materialId || item.productId}`} target="_blank">
											{
												item.image ?
													<img src={baseUrl + item.image.split(',')[0]} alt="" />
													:
													<img src={'images/material-nodata.png'} alt="" />
											}
										</a>
									</div>
									<a href={`/material/detail?id=${item.materialId || item.productId}`} target="_blank">
										<Row className="price" type="flex" align="bottom">
											<Col span={14} className="text-primary">
												<span>{item.price < 0 ? '' : '￥'}</span>
												<b className='h4'>{item.price < 0 ? '待询价' : item.price}</b>{item.price < 0 ? '' : '/' + item.unit}
											</Col>
											<Col span={10} className="text-right text-lightgrey h6">月销{item.monMateSellCount}笔</Col>
										</Row>
									</a>
									<div className="name">
										<a href={`/material/detail?id=${item.materialId || item.productId}`}
										   target="_blank">{item.brandName} {item.materialName || item.productName}
										</a>
									</div>
									<div className="text-muted h5" style={{marginTop: '8px'}}>
										<a href={`/shop/home?id=${item.shopId}`} target="_blank" className="text-ellipsis show" style={{width: '100%'}}>
											<i className="iconfont iconfont-dianpu1 h5" /> {item.shopName}
										</a>
									</div>
								</div>
							)
						})
						:
						isLoading ?
							<div className="text-center ptb4">
								<h3 className="text-muted">
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
									<AddInquiry type='primary' text=' 发布询价' icon="iconfont-xunjia" />
								</div>
							</div>
				}
			</section>
		)
	}
}
