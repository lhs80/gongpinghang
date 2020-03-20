import React, {Fragment} from 'react'
import Link from 'next/link'
import './style.less'
import {getMaterialClassByIndexCard} from 'server'
import {baseUrl, iconUrl} from 'config/evn';
import {message, Row, Col, Icon} from 'antd';
import {indexTextColor} from 'config/data'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class TypeCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			typeList: [],//所有分类列表
			selClassify: [],//当前显示的产品分类
		}
	}

	componentDidMount() {
		getMaterialClassByIndexCard().then(res => {
			if (res.result === 'success') {
				let {selClassify} = this.state;
				if (res.data) {
					res.data.forEach(item => {
						selClassify.push(item.recommendVO[0].twoClassId)
					});
					this.setState({
						typeList: res.data,
						selClassify
					});
				}
			}
		}).catch(error => {
			message.error(error)
		})
	}

	//改变选中的二级分类
	//传入当前分类的索引，二级分类的id
	changeTwoClass = (index, classId) => {
		let {selClassify} = this.state;
		selClassify[index] = classId;
		this.setState({
			selClassify
		})
	};

	render() {
		const {typeList, selClassify} = this.state;
		return (
			<aside style={{marginTop: '5px'}}>
				{
					typeList.map((item, index) => {
						return (
							<div key={index} className='type-card' id={`floor${index + 1}`}>
								<Fragment>
									<div className="type-card-tabs" style={{borderBottomColor: `${indexTextColor[index]}`}}>
										{
											item.recommendVO && item.recommendVO.map((typeItem, typeIndex) => {
												return <span className={`type-card-tabs_tab ${typeItem.twoClassId === selClassify[index] ? 'active' : ''}`}
												             style={{color: `${typeItem.twoClassId === selClassify[index] ? indexTextColor[index] : '#38414C'}`}}
												             key={typeIndex}
												             onClick={() => this.changeTwoClass(index, typeItem.twoClassId)}
												>
														{typeItem.title}
													</span>
											})
										}
									</div>
									<div className="left">
										<div className="top" style={{backgroundImage: `url(${baseUrl + item.imgPath})`}}>
											<Row type="flex" align="middle">
												<Col span={12}>
													<div className="floot">{index + 1}F</div>
												</Col>
												<Col span={12} className="text-right">
													<div className="h5">品质保障</div>
													<div className="h3"><b>{item.title}</b></div>
												</Col>
											</Row>
										</div>
										<div className="bottom">
											{
												item.keyWord && item.keyWord.split(',').map((subItem, subIndex) => {
													if (subIndex < 6)
														return (
															<span key={subIndex} className="tips">
																<Link href={{
																	pathname: '/search/material',
																	query: {keyword: subItem}
																}}>
																	<a>{subItem}</a>
																</Link>
															</span>
														)
												})
											}
										</div>
									</div>
									<div className="main">
										{
											item.recommendVO && item.recommendVO.map((pwItem, pwIndex) => {
												return <div className={`product-wrapper  ${pwItem.twoClassId === selClassify[index] ? 'block' : 'hide'}`} key={pwIndex}>
													{
														pwItem.recommendProducts.length ?
															pwItem.recommendProducts.map((pItem, pIndex) => {
																return <div className={`product-item`} key={pIndex}>
																	<div className='coverImage'>
																		<Link href={{pathname: '/material/detail', query: {id: pItem.id}}}>
																			<img src={pItem.imgPath ? baseUrl + pItem.imgPath.split(',')[0] : ''} alt='' />
																		</Link>
																	</div>
																	<div className="title">
																		<Link href={{pathname: '/material/detail', query: {id: pItem.id}}}><i>{pItem.brandName} {pItem.name}</i></Link>
																	</div>
																	<div className='price'>
																		<Link href={{pathname: '/material/detail', query: {id: pItem.id}}}>{`￥${pItem.price}`}</Link>
																	</div>
																</div>
															})
															:
															<div className="text-center ptb6">
																<div className="mt8"><IconFont type="iconfont-zanwushuju" style={{fontSize: '120px'}} /></div>
																<div className="text-muted">正在上线，敬请期待</div>
															</div>
													}
												</div>
											})
										}
									</div>
									{/*changed by zhaoquan*/}
									<div className='right' style={{display: 'none'}}>
										<h3 className='text-grey mt2 prl2'> {item.title}·品牌 </h3>
										<h6 className="text-muted mt1 prl2">专业推荐</h6>
										<div
											className='mt2'>
											<img src='/static/images/img-brand.png' alt='' />
											<img
												src='/static/images/img-brand.png'
												alt=''
												style={
													{
														marginTop: '1px'
													}
												}
											/>
											<img src="/static/images/img-brand.png" alt="" style={{marginTop: '1px'}} />
											<img
												src='/static/images/img-brand.png'
												alt=''
												style={
													{
														marginTop: '1px'
													}
												}
											/>
											<img src="/static/images/img-brand.png" alt="" style={{marginTop: '1px'}} />
										</div>
									</div>
								</Fragment>
							</div>
						)
					})
				}
			</aside>
		)
	}
};
