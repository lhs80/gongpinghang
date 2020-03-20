// 个人中心-意见反馈列表
import React from 'react'
import Layout from 'components/Layout/account'
import {List, Icon, Row, Col, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, feedBackListFun, timestampToTime} from 'server'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class FeedBack extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			feedBackList: [],
			feedBackImg: [],
			collapseDes: false,//描述是否展开，
			previewVisible: false,
			previewImage: ''
		};
	}

	componentDidMount() {
		this.getFeedBackList();
	}

	/*----图片查看---*/
	showPreview(url) {
		this.setState({
			previewVisible: true,
			previewImage: url
		})
	}

	/*----获取意见反馈的列表----*/
	getFeedBackList = () => {
		feedBackListFun(this.userCode).then(res => {
			if (res.result === 'success') {
				let listData = res.data;
				for (let i in listData) {
					if (listData[i].imagePath !== '') {
						listData[i].imagePath = listData[i].imagePath.split(',');
					} else {
						listData[i].imagePath = [];
					}
					listData[i].openDes = true;
				}
				this.setState({
					feedBackList: listData,
				})
			}
		})
	};
	/*-----描述----*/
	collapseDes = (index) => {
		const {feedBackList} = this.state;
		feedBackList[index].openDes = !feedBackList[index].openDes;
		for (let i in feedBackList) {
			if (Number(index) !== Number(i)) {
				feedBackList[i].openDes = true;
			}
		}
		this.setState({
			feedBackList
		})
	};

	render() {
		return (
			<Layout title="个人中心-意见反馈" menuIndex={'10'} mainMenuIndex={'home'}>
				<section className="bg-white" style={{paddingBottom: '40px'}}>
					<p style={{borderBottom: '1px solid #e6e6e6', margin: '0', paddingLeft: '34px', lineHeight: '60px'}}
					   className="h4">意见反馈列表</p>
					<section className="prl6">
						{
							this.state.feedBackList.length > 0 ?
								this.state.feedBackList.map((item, index) => {
									return (
										<div key={index} className="feedBackMenu ptb3">
											<Row className="h4">
												<Col span={12}>
													<span className="text-muted">问题类型&nbsp;:&nbsp;</span>
													<span className="text-grey">{item.type}</span>
													<span className="prl3 text-muted">{timestampToTime(item.createTime)}</span>
												</Col>
												<Col span={12} className="text-right">
                          <span
	                          className={`text-muted ${item.status === '1' ? 'questionability' : ''}`}>
                              {item.status === '0' ? '待解决' : '已解决'}
                          </span>
												</Col>
											</Row>
											<div className="h4 feedBackDes">
												<span className="text-muted text">问题描述&nbsp;:&nbsp;</span>
												<span className={`text-grey show text ${item.openDes ? 'text-ellipsis' : null}`}
												      style={{width: '760px'}}>{item.msg}</span>
												<a href="javascript:;" className="text text-muted" style={{marginLeft: '8px'}}
												   onClick={() => this.collapseDes(index)}>
													{
														item.openDes ?
															<IconFont type="iconfont-xiajiantou" />
															: <IconFont type="iconfont-xiangshang" />
													}
												</a>
											</div>
											<div>
												{
													item.imagePath.map((imgItem, index) => {
														return (
															<div key={index} className="feedImg show">
																<img src={baseUrl + imgItem} alt="" />
																<span className="feedImg-masker">
                                    <IconFont type='iconfont-yanjing'
                                              onClick={() => this.showPreview(baseUrl + imgItem)} />
                                </span>
															</div>
														)
													})
												}
											</div>
											{
												item.solution ?
													<div className="feedBackReply mt2 text-grey">
														<span className="text-muted">回复时间</span>
														<span className="prl3 text-muted">{timestampToTime(item.operatorTime)}</span>
														<div>{item.solution}</div>
													</div>
													: null
											}
										</div>
									)
								})
								: <div className="text-center mt2">
                    <span className="show">
                        <img src="/static/images/icon-nodata.png" alt="" />
                    </span>
									<p className="mt1 text-muted">你还没有反馈过哦~</p>
								</div>
						}
					</section>
				</section>
				<Modal visible={this.state.previewVisible} footer={null} onCancel={() => {
					this.setState({previewVisible: false})
				}}>
					<img alt="example" style={{width: '100%'}} src={this.state.previewImage} />
				</Modal>
			</Layout>

		)
	}
}
