import React, {Component, Fragment} from 'react';
import Router, {withRouter} from 'next/router';
import Layout from 'components/Layout/account'
import {queryOrderDetail, rateOrder, getOrderMaterialForEvaluateFun, evaluateOrderAndMaterialFun} from 'server'
import {Avatar, Button, message, Table, Input, Icon, Radio, Upload, Divider, Rate, Modal} from 'antd';
import {baseUrl, iconUrl, apiText} from 'config/evn';
import './style.less'
import cookie from 'react-cookies';

const {Column} = Table;
const {TextArea} = Input;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
let msgBox = null;

class RateOrder extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			detail: [],
			score: '',
			evaluate: '',
			fileList: [],
			productEvaluateList: [],
			answerDescription: null,
			serviceAttitude: null,
			deliverySpeed: null,
			previewImgUrl: '',
			showPreImgDlg: false
		}
	}

	componentDidMount() {
		this.getOrderDetail();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.router.query.id !== prevProps.router.query.id)
			this.getOrderDetail()
	}

	getOrderDetail = () => {
		let params = {
			orderId: this.props.router.query.id
		};
		getOrderMaterialForEvaluateFun(params).then(res => {
			let {productEvaluateList} = this.state;
			this.setState({
				detail: res.data
			}, () => {
				res.data.forEach(item => {
					productEvaluateList.push({
						productId: item.productId,
						specsId: item.specsId,
						score: '1',
						evaluate: '',
						evaluateImage: ''
					})
				});
				this.setState({
					productEvaluateList
				});
			})
		}).catch(error => {
			// message.error(error)
		})
	};

	submit = () => {
		if (!this.state.answerDescription || !this.state.serviceAttitude || !this.state.deliverySpeed) {
			if (!msgBox) {
				msgBox = message.warn('请评价店铺！', .5, () => {
					msgBox = null;
				});
			}
			return false;
		}
		const {detail, answerDescription, productEvaluateList, serviceAttitude, deliverySpeed} = this.state;
		let params = {
			orderId: this.props.router.query.id,
			shopId: detail[0].shopId,
			userCode: this.userCode,
			answerDescription,
			productEvaluateList,
			serviceAttitude,
			deliverySpeed
		};

		evaluateOrderAndMaterialFun(params).then(res => {
			Router.push({pathname: '/account/purchase/detail', query: {id: this.props.router.query.id}});
		}).catch(error => {
			message.error(error)
		})
	};

	onRateChange = (index, e) => {
		let {productEvaluateList} = this.state;
		productEvaluateList[index].score = e.target.value;
		this.setState({
			productEvaluateList
		})
	};

	onEvaluateChange = (e, index) => {
		let {productEvaluateList} = this.state;
		productEvaluateList[index].evaluate = e.target.value;
		this.setState({
			productEvaluateList
		})
	};

	uploadImageChange = (file) => {
		if (file.file.status === 'done') {
			let {data} = file.file.response;
			let {productEvaluateList} = this.state;
			productEvaluateList[data.productId].evaluateImage += data.list[0] + ',';
			this.setState({
				productEvaluateList
			});
		}
	};

	//预览评价图片
	previewImg = (url) => {
		this.setState({
			showPreImgDlg: true,
			previewImgUrl: url
		});
	};

	//删除评价图片
	delRateImg = (index, imageUrl) => {
		let {productEvaluateList} = this.state;
		productEvaluateList[index].evaluateImage = productEvaluateList[index].evaluateImage.replace(imageUrl + ',', '');
		this.setState({
			productEvaluateList
		});
	};

	render() {
		const {detail, productEvaluateList} = this.state;
		return (
			<Layout title="评价" mainMenuIndex='home'>
				<aside className="bg-white ptb4">
					<div className="purchase-rate-title">填写评价</div>
					<div className="evaluate-wrapper mt4">
						{
							detail && detail.map((item, index) => {
								return (
									<Fragment key={index}>
										<div className="evaluate-item">
											<div className="evaluate-product-info">
												<Avatar src={item.image ? baseUrl + item.image : '../../static/images/defaultHead.png'} shape="square" size={140} />
												<h5 className="text-ellipsis mt1"><b>{item.name}</b></h5>
												<div className="text-lightgrey h5"
												     style={{marginTop: '5px'}}>{item.optionalAttribute}{item.optionalAttribute ? ':' : ''}{item.attributeValue}</div>
											</div>
											<div className="evaluate-content">
												<Radio.Group onChange={(e) => this.onRateChange(index, e)}
												             value={productEvaluateList[index] ? productEvaluateList[index].score : 1}>
													<Radio value='1'>
														好评 <i className="iconfont iconfont-haoping1 text-danger h1" style={{verticalAlign: 'sub'}} />
													</Radio>
													<Radio value='2'>中评 <i className="iconfont iconfont-zhongping1 text-warn h1" style={{verticalAlign: 'sub'}} /></Radio>
													<Radio value='3'>差评 <i className="iconfont iconfont-chaping1 text-muted h1" style={{verticalAlign: 'sub'}} /></Radio>
												</Radio.Group>
												<div className="ptb1">
												<TextArea rows={6} placeholder="写点评价吧，您的评价对卖家有很大帮助！限500字"
												          onChange={(e) => this.onEvaluateChange(e, index)}
												          maxLength={500}
												          style={{resize: 'none'}}
												/>
												</div>
												<div>
													{
														productEvaluateList.length && productEvaluateList[index].evaluateImage ?
															productEvaluateList[index].evaluateImage.split(',').map((image, key) => {
																if (image)
																	return (
																		<div className="rate-image-wrapper" key={key}>
																			<Avatar src={baseUrl + image} shape="square" size={60} />
																			<span className="rate-image-handle">
																				<IconFont type="iconfont-htmal5icon17" className="h4" onClick={() => this.delRateImg(index, image)} />
																				<Icon type="eye" onClick={() => this.previewImg(image)} />
																			</span>
																		</div>
																	)
															})
															:
															''
													}
													<Upload
														action={baseUrl + apiText + '/file/uploadImgMore'}
														showUploadList={false}
														onChange={this.uploadImageChange}
														name="files"
														data={{
															productId: index
														}}
													>
														{
															productEvaluateList[index] ?
																productEvaluateList[index].evaluateImage.split(',').length <= 6
																	?
																	<Button type="link">晒图<span className="text-muted">(最多6张)</span></Button>
																	:
																	''
																:
																''
														}
													</Upload>
												</div>
											</div>
										</div>
										<Divider dashed />
									</Fragment>
								)
							})
						}
					</div>
					<div className="evaluate-item">
						<div className="purchase-detail-sub-title-middle ptb5 h4" style={{marginRight: '32px'}}><b>店铺动态评分：</b></div>
						<div className="h5">
							<div><b>商品与描述相符</b> <Rate className="h0" onChange={(number) => this.setState({answerDescription: number})} /></div>
							<div><b>卖家的服务态度</b> <Rate className="h0" onChange={(number) => this.setState({serviceAttitude: number})} /></div>
							<div><b>卖家的发货速度</b> <Rate className="h0" onChange={(number) => this.setState({deliverySpeed: number})} /></div>
						</div>
					</div>
					<div className="p3">
						<Button onClick={this.submit} className="bg-primary-linear" type='primary' size='large'>提交</Button>
					</div>
					<Modal title="查看大图"
					       visible={this.state.showPreImgDlg}
					       onCancel={() => {
						       this.setState({showPreImgDlg: false})
					       }}
					       okButtonProps={{style: {display: 'none'}}}
					       cancelButtonProps={{style: {display: 'none'}}}
					>
						<img src={baseUrl + this.state.previewImgUrl} alt='' style={{width: '100%'}} />
					</Modal>
				</aside>
			</Layout>
		);
	}
}

export default withRouter(RateOrder);
