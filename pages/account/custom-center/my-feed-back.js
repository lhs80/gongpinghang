/*----个人中心--意见反馈----*/
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, Select, Form, Input, Radio, Upload, Modal, message} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {userCodeFun, picUploadFun, feedBackFun} from 'server'
import cookie from 'react-cookies'
import './style.less'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {Option} = Select;
const {Content} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class feedbackForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			questionValue: '投诉',
			proposalLength: 0,
			//附件图片
			previewVisible: false,
			previewImage: '',
			imageUrl: 'images/default-header.png',
			fileList: [],
			imgData: []
		}
	}

	/*----表单提交---*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			let imagePath = this.state.imgData.join(',');
			if (!err) {
				let params = {
					msg: values.proposal,
					imageBase64List: [imagePath],
					userCode: this.userCode
				};
				feedBackFun(params).then(res => {
					if (res.result === 'success') {
						this.props.form.resetFields();
						message.success(('提交成功，感谢您的反馈!'))
					}
				})
			}
		});
	};
	/*----问题类型----*/
	onChangeQuestion = (e) => {
		this.setState({
			questionValue: e.target.value,
		});
	};
	/*---意见与建议----*/
	proposalChange = (e) => {
		this.setState({
			proposalLength: e.target.value.length
		})
	};

	/*----附件图片-----*/
	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	beforeUpload(file) {
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		/*return isLt2M;*/
		this.getBase64(file, (imageUrl) => {
			this.setState({
				imageUrl,
				loading: false
			});
			if (imageUrl) {
				let u = imageUrl.substring(imageUrl.indexOf(',') + 1, imageUrl.length);
				let data = {
					image_name: file.name,
					image_data: u
				};
				let headUp = {
					userCode: this.state.userCode,
					file: imageUrl
				};
				/*--提交图片---*/
				let params = {
					file: imageUrl,
					type: 'question'
				};
				picUploadFun(params).then(res => {
					if (res.result === 'success') {
						const {fileList, imgData} = this.state;
						let imgUrl = baseUrl + res.msg;
						imgData.push(res.msg);
						this.setState({
							fileList,
							imgData
						});
					}
				});
			}
		});
	}

	/*----关闭放大的图片时---*/
	handleCancel = () => {
		this.setState({previewVisible: false});
	};
	/*---点击文件链接或预览图标时(放大)--*/
	handlePreview = (file) => {
		this.setState({
			previewImage: file.url || file.thumbUrl,
			previewVisible: true,
		});
	};
	/*-----上传的图片删除时---*/
	removeImg = (file) => {
		const {fileList, imgData} = this.state;
		for (let i in fileList) {
			if (fileList[i].uid === file.uid) {
				fileList.splice(i, 1)
				imgData.splice(i, 1)
			}
		}
		this.setState({
			fileList,
			imgData
		});
	};
	/*---图片上传成功---*/
	handleChange = ({fileList}) => this.setState({fileList});

	render() {
		const {getFieldDecorator} = this.props.form;
		const {previewVisible, previewImage, fileList} = this.state;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 24},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 24},
			},
		};
		const uploadButton = (
			<div>
				<Icon type="plus" style={{fontSize: '30px'}} />
				<div className="ant-upload-text">点击上传</div>
			</div>
		);
		return (
			<Layout menuIndex={'10'} mainMenuIndex={'home'} title="意见反馈">
				<section className="page-content mt1">
					<aside className="bg-white" style={{padding: '60px 132px 20px 132px'}}>
						{/*<aside className="h4 text-grey feedBackMenu" style={{lineHeight: '32px'}}>*/}
						{/*<p>尊敬的用户:</p>*/}
						{/*<p>您好！为了给您提供更好的服务,我们希望收集您使用工品行时的看法或建议。</p>*/}
						{/*<p>您也可以联系我们，衷心感谢您的配合和支持！</p>*/}
						{/*</aside>*/}
						<section>
							<Form className="feedBackForm text-grey" onSubmit={this.handleSubmit}>
								{/*<FormItem*/}
								{/*{...formItemLayout}*/}
								{/*label="请选择问题类型"*/}
								{/*>*/}
								{/*{getFieldDecorator('questionType', {*/}
								{/*initialValue: this.state.questionValue,*/}
								{/*})(*/}
								{/*<RadioGroup onChange={this.onChangeQuestion}>*/}
								{/*<Radio value="投诉">投诉</Radio>*/}
								{/*<Radio value="建议">建议</Radio>*/}
								{/*<Radio value="bug">bug</Radio>*/}
								{/*<Radio value="举报">举报</Radio>*/}
								{/*</RadioGroup>*/}
								{/*)}*/}
								{/*</FormItem>*/}
								<FormItem
									{...formItemLayout}
									label="反馈内容"
								>
									{getFieldDecorator('proposal', {
										initialValue: '',
										rules: [{
											required: true, message: '请输入反馈内容',
										}],
									})(
										<div className="buyRemark">
											<Input.TextArea placeholder="请输入反馈内容"
											                style={{background: '#fafafa', padding: '16px 20px'}} rows={18}
											                maxLength={500} onChange={this.proposalChange}
											                autosize={{minRows: 6, maxRows: 18}}
											>
											</Input.TextArea>
											<div className="textLength">
												<span>{this.state.proposalLength}</span>
												<span>/</span>
												<span>500</span>
											</div>
										</div>
									)}
								</FormItem>
								<FormItem>
									<div className="h4 text-grey">
										附件上传 <span className="text-muted">(&nbsp;最多可上传5张图片&nbsp;)</span>
									</div>
									{getFieldDecorator('materialsImg', {
										initialValue: []
									})(
										<div className="mt1">
											<Upload
												action=""
												listType="picture-card"
												accept="image/*"
												fileList={fileList}
												beforeUpload={this.beforeUpload.bind(this)}
												onPreview={this.handlePreview}
												onChange={this.handleChange}
												onRemove={this.removeImg}
											>
												{fileList.length >= 5 ? null : uploadButton}
											</Upload>
											<Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} centered>
												<img alt="example" style={{width: '100%'}} src={previewImage} />
											</Modal>
										</div>
									)}
								</FormItem>
								{/*<FormItem*/}
								{/*{...formItemLayout}*/}
								{/*label="手机/邮箱"*/}
								{/*>*/}
								{/*{getFieldDecorator('mobileEmail', {*/}
								{/*rules: [{*/}
								{/*required: true, message: '请输入手机号或电子邮箱',*/}
								{/*}],*/}
								{/*})(*/}
								{/*<Input placeholder="请输入手机号或电子邮箱" size="large" style={{width: '300px', height: '50px'}}*/}
								{/*className="mt1" maxLength={30} />*/}
								{/*)}*/}
								{/*</FormItem>*/}
								<FormItem {...formItemLayout} className="mt8">
									<div style={{width: '300px', margin: 'auto'}} className="text-center h3">
										<Button type="primary" size="large" htmlType="submit" block
										        className='bg-primary-linear border-radius'
										        style={{height: '50px'}}>提交</Button>
										<Button>清空</Button>
									</div>
								</FormItem>
							</Form>
						</section>
					</aside>
				</section>
			</Layout>
		)
	}
}

const MyFeedBack = Form.create()(feedbackForm);
export default MyFeedBack
