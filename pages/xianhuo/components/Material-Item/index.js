import React from 'react'
import {Icon, Row, Col, Button, Avatar} from 'antd'
import Link from 'next/link';
import {iconUrl, baseUrl} from 'config/evn'
import AddInquiry from 'components/AddInquiry';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
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
		const {materialList, searchKeyWord} = this.props;
		return (
			<section>
				{
					materialList && materialList.length > 0
						?
						materialList.map((item, index) => {
							return (
								<div className="material-item" key={index}>
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
									<a href={`/material/detail?id=${item.materialId}`} target="_blank">
										<Row className="price" type="flex" align="bottom">
											<Col span={12} className="text-primary">￥<b className='h4'>{item.price}</b>/{item.unit}</Col>
											<Col span={12} className="text-right text-lightgrey h6">月销{item.monMateSellCount}笔</Col>
										</Row>
									</a>
									<div className="name">
										<a href={`/material/detail?id=${item.materialId}`} target="_blank">
											{item.materialName}
										</a>
									</div>
									<div className="text-muted h5" style={{marginTop: '8px'}}>
										{/*<Link href={{pathname: '/shop/home', query: {id: item.shopId}}}>*/}
										<a href={`/shop/home?id=${item.shopId}`} target="_blank">
											<i className="iconfont iconfont-dianpu1" /> {item.shopName}
										</a>
										{/*</Link>*/}
									</div>
								</div>
							)
						})
						:
						<div className="material-list-empty">
							<div className="icon-nodata img" />
							<div className="content">
								<h4 className="text-darkgrey">商品正在上架，敬请期待，如急需请联系客服</h4>
								<h5 className="text-lightgrey">您可以：</h5>
								<h5 className=" text-lightgrey">1. 缩短或修改您的搜索词，重新搜索；</h5>
								<h5 className=" text-lightgrey">2. 写下您的采购需求，快速获得多个供应商报价。</h5>
								<AddInquiry type={'primary'} class="btn-add-inquiry" text={'发布询价'} icon="iconfont-xunjia" />
							</div>
						</div>
				}
			</section>
		)
	}
}
