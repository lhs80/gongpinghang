import React, {Component, Fragment} from 'react';
import {Tabs, List, Avatar, Icon, Row, Col, Radio, Divider, Checkbox, Pagination, message, Modal, Button} from 'antd';
import {baseUrl, iconUrl} from 'config/evn'
import 'swiper/dist/css/swiper.min.css'
import './style.less'
import moment from 'moment'
import {getProductEvaluateListFun} from 'server';

const {TabPane} = Tabs;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

/**
 * @return {null}
 */
function ScoreLevel(props) {
	let {score} = props;
	let content = null;
	switch (score) {
		case 1:
			content = <span className="prl3 text-danger">好评<IconFont type="iconfont-haoping1" /></span>;
			break;
		case 2:
			content = <span className="prl3 text-primary">中评<IconFont type="iconfont-zhongping1" /></span>;
			break;
		case 3:
			content = <span className="prl3 text-muted">差评<IconFont type="iconfont-chaping1" /></span>;
			break;
	}
	return content;
}

class ProductDepictEvaluateIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
			filterType: '',
			evaluateInfo: [],
			commodities: [],
			isContent: '',
			previewVisible: false,
			activeTab: '1'
		}
	}

	componentDidMount() {
		this.getProductEvaluateList();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.pid !== this.props.pid)
			this.getProductEvaluateList();
	}

	rateTypeChange = (e) => {
		this.setState({
			filterType: e.target.value
		}, () => {
			this.getProductEvaluateList()
		})
	};

	isContentChange = (e) => {
		this.setState({
			isContent: e.target.checked ? 1 : ''
		}, () => {
			this.getProductEvaluateList()
		})
	};

	//分页
	onPageChange = (page, pageSize) => {
		let {searchParams} = this.state;
		searchParams.pageNum = page - 1;
		this.setState({
			searchParams
		}, () => {
			this.queryMaterialList();
		});
	};

	//评价列表
	getProductEvaluateList = () => {
		let params = {
			score: this.state.filterType,
			isContent: this.state.isContent,
			pageNum: 1,
			pageSize: 20,
			productId: this.props.pid
		};
		getProductEvaluateListFun(params).then(res => {
			this.setState({
				evaluateInfo: res.data
			})
		}).catch(error => {
			message.error(error)
		})
	};


//查看大图上一个
	previewPrev = () => {
		let {commodities, previewImageIndex} = this.state;
		if (previewImageIndex - 1 >= 0) {
			this.setState({
				previewImage: baseUrl + commodities[previewImageIndex - 1],
				previewImageIndex: previewImageIndex - 1
			})
		} else {
			if (!msgBox)
				msgBox = message.info('已经是第一张啦！', 0.2, () => {
					msgBox = null;
				});
		}
	};

	/**
	 * 查看大看
	 * */
	showPreview(url, imgIndex, index) {
		let evaluateImage = this.state.evaluateInfo.list[index].evaluateImage;
		this.setState({
			commodities: evaluateImage.substring(0, evaluateImage.length - 1).split(','),
			previewImageIndex: imgIndex,
			previewVisible: true,
			previewImage: url
		})
	}

	//查看大图下一个
	previewNext = () => {
		if (this.state.previewImageIndex + 1 <= this.state.commodities.length - 1) {
			this.setState({
				previewImage: baseUrl + this.state.commodities[this.state.previewImageIndex + 1],
				previewImageIndex: this.state.previewImageIndex + 1
			})
		} else {
			if (!msgBox)
				msgBox = message.info('已经是最后一张啦！', 0.2, () => {
					msgBox = null;
				});
		}
	};

	onTabClick = (value) => {
		this.setState({
			activeTab: value
		})
	};

	render() {
		const {depict, mustAttribute, brand} = this.props;
		const {evaluateInfo, activeTab} = this.state;
		return (
			<Fragment>
				<Tabs activeKey={activeTab} className='product-detail-tabbar' animated={false} onTabClick={this.onTabClick}>
					<TabPane tab="详细信息" key="1" className="prl3 ptb1">
						<div className="detail-other-attr-content">
							<div>
								<label className='text-muted'>品牌：</label>
								<span className='text-grey'>{brand}</span>
							</div>
							{
								mustAttribute && mustAttribute.map((item, index) => {
									if (item.key !== '品牌')
										return (
											<dl key={index}>
												<dt className='text-muted'>{item.key}</dt>
												：
												<dd title={item.value} className='text-grey'>{item.value}</dd>
											</dl>
										)
								})
							}
							{
								mustAttribute && mustAttribute.length > 9 ?
									<div className="text-right">
										<a className="prl2 text-primary" onClick={() => {
											this.setState({
												activeTab: '2'
											})
										}}>更多参数></a>
									</div>
									:
									null
							}
						</div>
						<div dangerouslySetInnerHTML={{__html: depict}} className="mt3 material-detail-panel" />
					</TabPane>
					<TabPane tab="规格参数" key="2" className="prl3 ptb1">
						<table className="detail-other-attr-params">
							<tbody>
							<tr>
								<td style={{width: '250px'}} className="text-muted">品牌</td>
								<td className='text-grey'>{brand}</td>
							</tr>
							{
								mustAttribute && mustAttribute.map((item, index) => {
									if (item.key !== '品牌')
										return (
											<tr key={index}>
												<td className="text-muted">{item.key}</td>
												<td title={item.value} className='text-grey'>{item.value}</td>
											</tr>
										)
								})
							}
							</tbody>
						</table>
					</TabPane>
					<TabPane tab={`评价(${evaluateInfo.count || 0})`} key="3" className="prl3 ptb1">
						{
							evaluateInfo.list ?
								<Fragment>
									<Row>
										<Col span={4} className="h5">好评：<span className="text-primary">{evaluateInfo.feedback}</span></Col>
										<Col span={20} className="text-right">
											<Radio.Group onChange={this.rateTypeChange} value={this.state.filterType}>
												<Radio value=''>全部({evaluateInfo.count || 0})</Radio>
												<Radio value={1}>好评({evaluateInfo.group[0].count || 0})</Radio>
												<Radio value={2}>中评({evaluateInfo.group[1].count || 0})</Radio>
												<Radio value={3}>差评({evaluateInfo.group[2].count || 0})</Radio>
											</Radio.Group>
											<Checkbox onChange={this.isContentChange}>有内容</Checkbox>
										</Col>
									</Row>
									<div className="ptb2">
										<Divider />
									</div>
								</Fragment>
								:
								''
						}
						<List
							itemLayout="horizontal"
							dataSource={evaluateInfo.list}
							locale={{
								emptyText: '暂无评价'
							}}
							renderItem={(item, index) => (
								<List.Item key={index}>
									<List.Item.Meta
										avatar={<Avatar src={baseUrl + item.headUrl} />}
										title={<Fragment>
											<div className="text-black">{item.nickName}</div>
											<div className="text-muted">
												{moment(item.createTime).format('YYYY-MM-DD')}
												<span>{item.optionalAttribute || ''}{item.optionalAttribute ? ':' : ''}{item.attributeValue || ''}</span>
												<ScoreLevel score={item.score} />
											</div>
										</Fragment>}
										description={
											<Fragment>
												<div>{item.evaluate}</div>
												{
													item.evaluateImage && item.evaluateImage.split(',').map((item, imgIndex) => {
														return (
															item ?
																<Avatar shape="square" size={44}
																        src={baseUrl + item}
																        key={imgIndex}
																        style={{marginRight: '4px'}}
																        onClick={() => this.showPreview(baseUrl + item, imgIndex, index)} />
																:
																null
														)
													})
												}
											</Fragment>
										}
									/>
								</List.Item>
							)}
						/>
						<div className="text-right">
							<Pagination defaultCurrent={1} total={evaluateInfo.count} onChange={this.onPageChange} />
						</div>
					</TabPane>
				</Tabs>
				{/*显示附件大图*/}
				<Modal
					width="650px"
					visible={this.state.previewVisible}
					footer={null}
					onCancel={() => {
						this.setState({previewVisible: false})
					}}>
					<div className="imageViewer-content" style={{height: '600px'}}>
						<div className="arrow left-arrow">
							<Icon type="left-circle" onClick={this.previewPrev} />
						</div>
						<div className="image-box">
							<img alt="图片" style={{maxWidth: '100%', maxHeight: '100%'}} src={this.state.previewImage} />
						</div>
						<div className="arrow right-arrow">
							<Icon type="right-circle" onClick={this.previewNext} />
						</div>
					</div>
				</Modal>
			</Fragment>
		);
	}
}

export default ProductDepictEvaluateIndex;
