import React from 'react'
import Router, {withRouter} from 'next/router'
import cookie from 'react-cookies';
import {baseUrl} from 'config/evn'
import moment from 'moment'
import Layout from 'components/Layout/index'
import {
	shopAllInfo, addShopInfo, inquiryAddFun, photoUploadFun,
	picUploadFun, unitListFun, queryMaterialDetailFun, userInfoFun,
	userCodeFun, queryInquiryDetailFun, queryShopInfoFun, isInquiryFun, ofenShopMaterialFun, getAreaCityFun
} from 'server'
import AddBusiness from 'components/AddBusiness/'
import AddMaterialModal from 'components/AddMaterialModal'
import {
	Row, Col, Form, Input, Button, Tag, Select, Icon, Table, Popconfirm, Upload, Modal,
	Checkbox, DatePicker, message, Radio
} from 'antd'
import './style.less'
import XLSX from 'xlsx-style';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

/*----材料的tableCell----*/
class EditableCell extends React.Component {
	state = {
		value: this.props.value,
	};

	handleChange(e) {
		const value = e.target.value;
		if (this.props.onChange) {
			this.props.onChange(value);
		}
		this.setState({value});
	}

	handleMaterialName(e) {
		let whiteSpaceName = e.target.value.split(' ').join('');
		let value = '';
		if (whiteSpaceName) {
			value = e.target.value
		}
		if (this.props.onChange) {
			this.props.onChange(value);
		}
		this.setState({value});
	}

	render() {
		const {value} = this.state;
		return (
			<div>
				<Input
					size="large"
					value={value}
					placeholder={this.props.tip}
					onChange={e => this.handleChange(e)}
					onBlur={e => this.handleMaterialName(e)}
					maxLength={this.props.maxNum}
				/>
			</div>
		);
	}
}

/*----材料中数量的tableCell--输入有限制---*/
class EditableCellNum extends React.Component {
	state = {
		value: this.props.value
	};

	handleChange(e) {
		let value = '';
		if (e.target.value && isNaN(e.target.value)) {
			value = e.target.value.replace(/\D/g, '')
		} else if (e.target.value && e.target.value.indexOf('.') !== -1) {
			value = e.target.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
		} else if (e.target.value && e.target.value.indexOf('-') !== -1) {
			value = e.target.value.replace(/\D/g, '')
		} else if (e.target.value && e.target.value.indexOf(' ') !== -1) {
			value = e.target.value.replace(/\ +/g, '')
		} else if (e.target.value && Number(e.target.value) >= 999999.99) {
			//最大值999999.99
			value = '999999.99'
		} else {
			value = e.target.value
		}
		if (this.props.onChange) {
			this.props.onChange(value);
		}
		this.setState({value});
	}

	render() {
		const {value} = this.state;
		return (
			<div>
				<Input
					size="large"
					value={value}
					placeholder="请输入数量(最大6位整数)"
					onChange={e => this.handleChange(e)}
				/>
			</div>
		);
	}
}

class InquirySheet extends React.Component {
	constructor(props) {
		super(props);
		/*---材料table---*/
		this.columns = [{
			title: '序号',
			width: 60,
			dataIndex: 'order',
			render: (text, record, index) => `${index + 1}`,
		}, {
			title: '材料名称',
			dataIndex: 'materialName',
			render: (text, record, index) => (
				<EditableCell
					value={text}
					tip={'请输入材料名称(1-30个字数)'}
					maxNum={30}
					onChange={this.handleMaterialChange(index, 'materialName')}
				/>
			),
		}, {
			title: '品牌',
			dataIndex: 'materialBrand',
			render: (text, record, index) => (
				<EditableCell
					value={text}
					tip={'请输入品牌(1-15个字数)'}
					maxNum={15}
					onChange={this.handleMaterialChange(index, 'materialBrand')}
				/>
			),
		}, {
			title: '单位',
			dataIndex: 'materialUnit',
			render: (text, record, index, value) =>
				<Select size="large" style={{width: '200px'}} defaultValue={text ? text : undefined} placeholder="请选择"
				        onChange={this.handleUnitChange(text, record, index, value)}>
					{
						this.state.unitList.map((item, index) => {
							return (
								<Option value={item} key={index}>{item}</Option>
							)
						})
					}
				</Select>
			,
		}, {
			title: '数量',
			dataIndex: 'quantity',
			render: (text, record, index) => (
				<EditableCellNum
					value={text}
					onChange={this.handleMaterialChange(index, 'quantity')}
				/>
			),
		}, {
			title: '商品描述(选填)',
			dataIndex: 'remark',
			render: (text, record, index) => (
				<Input size="large" placeholder="请输入规格型号等(限30个字)" maxLength={30} onChange={(e) => this.descChange(e, index)} />
			),
		}, {
			title: '操作',
			width: 60,
			dataIndex: 'operation',
			render: (text, record, index) => {
				return (
					this.state.materialData.length > 1 ?
						(
							<a onClick={() => this.onDelete(index)}>删除</a>
						) : null
				);
			}
		}];
		this.state = {
			data: [],
			provinces: [],
			cities: [],
			modifyProvince: '',
			modifyCity: '',
			//链接url的参数
			type: this.props.router.query.type,//this.props.match.params.type,
			id: this.props.router.query.id,//this.props.match.params.id,
			//商家增加弹窗
			showAddModel: 'none',
			//添加商家的所有信息
			inquiryAllData: [],
			tags: [],
			shopInfoData: [],
			removeShopInfo: [],
			//买家身份
			identity: '个人',
			companyName: '',
			//收货地址
			showBtn: false,
			/*---1为个人，2位企业---*/
			flag: 1,
			identityName: '',
			showTip: 'none',
			showAddMaterial: 'none',
			materialData: [],
			selectMaterialData: [],
			//附件图片
			previewVisible: false,
			previewImage: '',
			imageUrl: '/static/images/default-header.png',
			fileList: [],
			imgData: [],
			buyRemark: '',//再来一单备注
			remarkLength: 0,
			/*---报税---*/
			plainOptions: [
				{label: '含税', value: '含税'},
				{label: '含运费', value: '含运费'},
			],
			tax: 0,
			quoteRequirement: [],
			/*----询价时间---*/
			inquiryTime: '',
			time: '',
			token: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').token ? cookie.load('ZjsWeb').token : null : null,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			form: null,
			//材料单位
			unitList: [],
			//个人中心带的材料参数
			materialId: this.props.router.query.id,//this.props.match.params.id,
			integral: false,//积分
			addClick: false,
			materialTip: false,
			count: 1,
			anotherOrder: false,//再来一单过来地址更新为true
			selectDay: '',
			exportMaterial: false,
			exportValue: '',
			showModalKind: 0
		};
	}

	componentDidMount() {
		if (!cookie.load('ZjsWeb')) {
			Router.push('/login/index')
		}
		this.isHaveRole();
		this.getUserCodeFun();
		/*-----材料单位----*/
		this.materialUnit();
		this.inquiryFun();
		window.scrollTo(0, 0);
		this.getAllArea();
	}

	isHaveRole() {
		//用户是否登录
		isInquiryFun(this.state.userCode).then(res => {
			//已认证
			if (res.data.isAuthPri) {
				let closeShop = -1;
				if (this.props.shopInfo) {
					closeShop = this.props.shopInfo.findIndex(shop => {
						return shop.shopState === '0'
					});
				}
				if (closeShop >= 0) {
					this.changeType(4);
				} else {
					Router.push({pathname: '/enquiry/add', query: {...this.props.urlParams}})
				}
			} else {
				//未认证
				this.changeType(5);
			}
		});
	}

	changeType = (type) => {
		this.setState({
			showModalKind: type
		})
	};

	closeModal = () => {
		Router.push('/');
	};
	getUserCodeFun = () => {
		let params = {
			userCode: this.state.userCode
		};
		/*----获取买家身份与公司名称----*/
		userCodeFun(params).then(res => {
			if (res.data.isAuthCom === 2 || res.data.isAuthPri === 1) {
				this.setState({
					flag: 2,
					companyName: res.data.companyName
				});
				if (!this.state.type) {
					this.setState({
						identity: res.data.companyName
					})
				}
			}
		});
	};
	/*--材料每行的删除----*/
	onDelete = (index) => {
		const newMaterialData = [...this.state.materialData];
		newMaterialData.splice(index, 1);
		this.setState({
			materialData: newMaterialData,
		});
	};

	/*----监听材料每个inputValue变化---*/
	handleMaterialChange(index, key) {
		let rowLine = 1;
		return (value) => {
			if (value.split(' ').join('')) {
				if (key === 'materialName') {
					rowLine = 1
				} else if (key === 'quantity' && Number(value) !== 0) {
					rowLine = 4
				}
			}
			const materialData = [...this.state.materialData];
			materialData[index][key] = value;
			this.setState({
				materialData
			}, () => {
				this.greyColor(rowLine, index, 'input');
				this.checkTableTip();
			});
		};
	}

	/*------材料中的单位变化---text, record, index, value--*/
	handleUnitChange = (text, record, index) => {
		return (value) => {
			const materialData = [...this.state.materialData];
			record.materialUnit = value;
			this.setState({
				materialData
			}, () => {
				this.unitGreyColor(3, index);
				this.checkTableTip();
			})
		};
	};
	/*----材料增加每行---*/
	addMaterialLine = () => {
		const {materialData, count} = this.state;
		//let count = materialData.length;
		const newData = {
			key: count,
			materialBrand: '',
			materialName: '',
			materialUnit: '',
			quantity: ''
		};
		this.setState({
			materialData: [...materialData, newData],
			count: count + 1
		});
	};
	/*----从常购材料中添加------*/
	regularMaterial = (e) => {
		const {materialData} = this.state;
		e.preventDefault();
		this.setState({
			materialData,
			showAddMaterial: 'block'
		});
	};
	/*---接收材料子组件传过来的display--*/
	changeMaterial = (status) => {
		this.setState({
			showAddMaterial: status
		})
	};
	/*----接收子组件提交添加的材料数据---*/
	selectMaterialInfo = (selectMaterialData, status) => {
		const {count} = this.state;
		let materialData = this.state.materialData;
		let data = [];
		Object.keys(materialData).forEach((item) => {
			if (materialData[item].materialBrand || materialData[item].materialName || materialData[item].materialUnit || materialData[item].quantity) {
				data.push(materialData[item])
			}
		});
		//把接收过来的数组处理一下满足提交的要求
		let materialItem = {};
		for (let i in selectMaterialData) {
			materialItem = {
				materialBrand: selectMaterialData[i].brand,
				materialName: selectMaterialData[i].name,
				materialUnit: selectMaterialData[i].unit,
				quantity: selectMaterialData[i].quantity,
				key: Number(i) + count
			};
			data.push(materialItem);
		}
		this.setState({
			materialData: data,
			showAddMaterial: status,
			count: count + selectMaterialData.length
		});
	};
	/*-----询价标题----*/
	inquiryTitle = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			if (value.replace(/\ +/g, '').length === 0) {
				callback('标题字数为1-30个字符')
			}
		}
		callback()
	};
	/*---商家tags关闭----*/
	handleClose = (removedTag) => {
		const tags = this.state.tags.filter(tag => tag !== removedTag);
		this.setState({
			tags,
			shopInfoData: tags,
			removeShopInfo: tags
		});
	};
	/*----增加商家弹窗的show-hidden---*/
	showAddSeller = () => {
		this.setState({
			showAddModel: 'block',
		});
	};
	/*----接收子组件增加发送商家的信息---*/
	sellerName = (sellerName, status) => {
		const form = this.props.form;
		if (sellerName.length > 0) {
			form.setFields({
				sendBusiness: {
					errors: [new Error('')],
				},
			});
		}
		for (let i in sellerName) {
			sellerName[i].from = 1
		}
		this.setState({
			tags: sellerName,
			shopInfoData: sellerName,
			showAddModel: status
		});
	};
	/*----发送商家关闭---*/
	changeDisplay = (status) => {
		let closeInfo = this.state.tags.filter(item => item.from === 1);
		this.setState({
			tags: closeInfo,
			showAddModel: status,
			shopInfoData: closeInfo
		})
	};
	/*----身份选择时---*/
	identityChange = (value) => {
		this.setState({
			identity: value
		});
	};
	//input边框变红色
	red = (num, index, classTag) => {
		let Btn = document.getElementsByClassName('ant-table-row');
		let errorInput = Btn[index].cells[num].getElementsByTagName(classTag)[0];
		errorInput.className += ' hasError'
	};
	//input边框变灰色
	greyColor = (num, index, classTag) => {
		let Btn = document.getElementsByClassName('ant-table-row');
		let errorInput = Btn[index].cells[num].getElementsByTagName(classTag)[0];
		errorInput.setAttribute('class', 'ant-input ant-input-lg');
	};
	//单位变化
	unitRed = (num, index) => {
		let Btn = document.getElementsByClassName('ant-table-row');
		let errorInput = Btn[index].cells[num].getElementsByClassName('ant-select-selection')[0];
		errorInput.className += ' hasError'
	};
	unitGreyColor = (num, index) => {
		let Btn = document.getElementsByClassName('ant-table-row');
		let errorInput = Btn[index].cells[num].getElementsByClassName('ant-select-selection')[0];
		errorInput.setAttribute('class', 'ant-select-selection ant-select-selection--single')
	};
	/*----发送商家校验-----*/
	checkSend = () => {
		const form = this.props.form;
		let flag = false;
		if (this.state.tags.length > 0) {
			form.setFields({
				sendBusiness: {
					errors: [new Error('')],
				},
			});
			flag = true;
		} else {
			form.setFields({
				sendBusiness: {
					errors: [new Error('请添加商家')],
				},
			});
			flag = false;
		}
		return flag;
	};
	checkTableTip = () => {
		const {materialData} = this.state;
		let materialNamearr = [];
		let materialUnitarr = [];
		let materialQuantityarr = [];
		let quantityarr = -1;
		quantityarr = materialData.findIndex(material => {
			return Number(material.quantity) === 0
		});
		for (let i in materialData) {
			materialNamearr.push(materialData[i].materialName);
			materialUnitarr.push(materialData[i].materialUnit);
			materialQuantityarr.push(materialData[i].quantity);
		}
		//整个table只有其中一个input的value为空就提示错误信息，否则合格校验
		if (this.state.materialTip) {
			if (materialNamearr.indexOf('') === -1 && materialUnitarr.indexOf('') === -1 && materialQuantityarr.indexOf('') === -1 && quantityarr === -1) {
				this.setState({
					materialTip: false
				});
			}
		}
	};
	/*----校验材料表格table----*/
	checkTable = () => {
		const form = this.props.form;
		const {materialData} = this.state;
		let flag = false;
		let materialBrandarr = [];
		let materialNamearr = [];
		let materialUnitarr = [];
		let materialQuantityarr = [];
		let reg = /^(\-)*(\d+)\.(\d\d).*$/;
		for (let i in materialData) {
			materialNamearr.push(materialData[i].materialName);
			materialUnitarr.push(materialData[i].materialUnit);
			materialQuantityarr.push(materialData[i].quantity);
			//材料名称所有的列如果其中一列为空red(1,i)，否则greyColor(1,i)
			if (materialData[i].materialName === '') {
				this.red(1, i, 'input');
				this.setState({
					materialTip: true
				})
			} else {
				this.greyColor(1, i, 'input');
				this.setState({
					materialTip: false
				})
			}
			//单位所有的列如果其中一列为空red(2,i)，否则greyColor(2,i)
			if (materialData[i].materialUnit === '') {
				this.unitRed(3, i)
				this.setState({
					materialTip: true
				})
			} else {
				this.unitGreyColor(3, i)
				this.setState({
					materialTip: false
				})
			}
			//数量所有的列如果其中一列为空red(2,i)，否则greyColor(2,i)
			if (materialData[i].quantity === '' || Number(materialData[i].quantity) === 0) {
				this.red(4, i, 'input')
				this.setState({
					materialTip: true
				})
			} else {
				this.greyColor(4, i, 'input');
				this.setState({
					materialTip: false
				})
			}
		}
		//整个table只有其中一个input的value为空就提示错误信息，否则合格校验
		if (materialNamearr.indexOf('') === -1 && materialUnitarr.indexOf('') === -1 && materialQuantityarr.indexOf('') === -1) {
			this.setState({
				materialTip: false
			});
			flag = true;
		} else {
			this.setState({
				materialTip: true
			});

			flag = false;
		}
		//数量输入0,00,0.00等值为0时
		let materialError = -1;
		materialError = materialQuantityarr.findIndex(material => {
			return Number(material) === 0
		});

		if (materialError >= 0) {
			this.setState({
				materialTip: true
			});
			flag = false;
		}
		//材料名称长达大于30
		return flag;
	};
	//验证表单
	checkForm = () => {
		let ids = this.state.inquiryType === 1 ? [this.checkSend(), this.checkTable()] : [this.checkTable()];
		let sum = 0;
		let flag = false;
		for (let i = 0; i < ids.length; i++) {
			if (eval(ids[i])) sum++;
		}
		if (ids.length === sum) {
			flag = true
		}
		return flag;
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
				let u = imageUrl.substring(imageUrl.indexOf(',') + 1, imageUrl.length)
				/*--提交图片---*/
				let params = {
					file: imageUrl,
					type: 'material'
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
		let imgs = [];
		for (let i in fileList) {
			if (fileList[i].uid === file.uid) {
				fileList.splice(i, 1)
				imgData.splice(i, 1)
			} else {
				imgs.push(fileList[i].url)
			}
		}
		this.setState({
			fileList,
			imgData
		});
	};
	/*---图片上传成功---*/
	handleChange = ({fileList}) => this.setState({fileList});
	/*----报税----*/
	taxChange = (checkedValues) => {
		let hs = checkedValues.indexOf('含税');
		let hyf = checkedValues.indexOf('含运费');
		let tax = 0;
		if (hs === -1 && hyf === -1) tax = 0;
		if (hs !== -1 && hyf === -1) tax = 1;
		if (hs === -1 && hyf !== -1) tax = 2;
		if (hs !== -1 && hyf !== -1) tax = 3;
		this.setState({
			quoteRequirement: checkedValues,
			tax: tax
		});
	};
	/*----有效期选择----*/
	timeChange = (value, dateString) => {
		this.setState({
			inquiryTime: dateString,
			selectDay: dateString[8] + dateString[9]
		});
	};
	timeOk = (value, dateString) => {
	};
	checkInquiryTime = (rule, value, callback) => {
		let date = new Date();
		let nowDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
		if (value && new Date(this.state.inquiryTime.replace(/\-/g, '\/')) < new Date(nowDate.replace(/\-/g, '\/'))) {
			callback('请选择一个有效的时间')
		} else {
			callback();
		}
	};
	/*---表单提交时--*/
	handleSubmit = (e) => {
		e.preventDefault();
		//材料在最上面错误时，提交表单时直接滚动到材料列表
		if (this.state.tags.length > 0 && !this.checkForm()) {
			window.scrollTo(0, 700);
		}
		this.props.form.validateFieldsAndScroll((err, values) => {
			const {tags} = this.state;
			let tagsInfo = [];
			for (let i in tags) {
				tagsInfo.push({
					shopId: tags[i].id,
					shopName: tags[i].shopName,
				})
			}
			let params = {
				userCode: this.state.userCode,
				title: values.inquiryTitle,
				shops: tagsInfo,
				// buyerIdentity: this.state.identity,
				materials: this.state.materialData,
				imgs: this.state.imgData,
				buyerNote: values.buyRemark,
				quoteRequirement: this.state.tax,
				validityTime: this.state.inquiryTime,
				type: values.inquiryType,
				consigneeProvince: this.state.modifyProvince,
				consigneeCity: this.state.modifyCity,
			};
			this.checkForm();
			if (!err && this.checkForm()) {
				/*if (!err) {*/
				/*----满足条件时---*/
				inquiryAddFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							integral: true,
						});
						//window.onbeforeunload = null;
					} else {
						message.info(res.msg)
					}
				});
			}
		});
	};
	/*----表单提交成功的弹窗----*/
	integralOk = () => {
		this.setState({
			integral: false,
		});
		Router.push({pathname: '/account/custom-center/my-inquiry'});
		// window.location.href = `/account.html#/myinquiry`
	};

	leavePage = () => {
		window.onbeforeunload = function (e) {
			let event = window.event || e;
			event.returnValue = ('确定离开当前页面吗？');
		}
	};

	range(start, end) {
		const result = [];
		for (let i = start; i < end; i++) {
			result.push(i);
		}
		return result;
	}

	/**
	 * 设置分秒不可选
	 * 设置小于当前时间的小时不可选
	 * */
	disabledDateTime = () => {
		let nowHour = new Date().getHours();
		let nowDay = new Date().getDate();
		return {
			disabledHours: () => Number(this.state.selectDay) === nowDay ? this.range(0, 24).splice(0, nowHour + 1) : '',
			disabledMinutes: () => this.range(1, 60),
			disabledSeconds: () => this.range(1, 60),
		};
	};

	disabledDate = (current) => {
		return current && current.valueOf() < (Date.now() - 24 * 60 * 60);
	};

	/*----材料单位---*/
	materialUnit = () => {
		unitListFun(this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					unitList: res.data
				})
			}
		});
	};

	/*----0商家、1材料、2再来一单、3常购材料，与一般询价----*/
	inquiryFun = () => {
		const {userCode, type, id, tags, materialData, count} = this.state;
		// let type = this.props.router.query.type;
		/*---先判断从哪个页面进入询价的----*/
		let shopId = this.props.router.query.shopId;
		if (type === '0') {
			let params = {
				id: shopId,
				userCode
			};
			queryShopInfoFun(params).then(res => {
				if (res.result === 'success') {
					let shopInfo = {
						id: res.data.id,
						shopName: res.data.shopName,
						from: 1
					};
					this.state.tags.push(shopInfo)
					this.state.shopInfoData.push(shopInfo)
				}
				//身份
				if (this.state.flag === 2) {
					this.setState({
						identity: this.state.companyName
					})
				} else {
					this.setState({
						identity: '个人'
					})
				}
			});
			materialData.push({
				key: 0,
				materialBrand: '',
				materialName: '',
				materialUnit: '',
				quantity: ''
			})
		} else if (type === '1') {
			let shopId = this.props.router.query.shopId;
			let params = {
				id: shopId,
				userCode
			};
			queryShopInfoFun(params).then(res => {
				if (res.result === 'success') {
					let shopInfo = {
						id: res.data.id,
						shopName: res.data.shopName,
						from: 1
					};
					this.state.tags.push(shopInfo)
					this.state.shopInfoData.push(shopInfo)
				}
			});
			/*---根据材料的ID获取材料的详情，把材料信息渲染-与商家id渲染发送商家---*/
			let mparams = {
				id: this.props.router.query.mid,
				userCode
			};
			queryMaterialDetailFun(mparams).then(res => {
				if (res.result === 'success') {
					//身份
					if (this.state.flag === 2) {
						this.setState({
							identity: this.state.companyName
						})
					} else {
						this.setState({
							identity: '个人'
						})
					}
					this.setState({
						materialData: [
							{
								key: 0,
								materialBrand: res.data.detail.materialBrand,
								materialName: res.data.detail.name,
								materialUnit: res.data.detail.unit,
								quantity: ''
							}
						],
					})
				}
			});
		} else if (type === '2') {
			//再来一单
			// let sheetId = this.props.router.query.id;
			let params = {
				userCode,
				inquirySheetId: id
			};
			queryInquiryDetailFun(params).then(res => {
				if (res.result === 'success') {
					const form = this.props.form;
					let sellerData = res.data.inquirySheetShops;
					form.setFields({
						inquiryTitle: {
							value: res.data.title
						},
						buyRemark: {
							value: res.data.buyerNote
						},
						inquiryType: {
							value: res.data.type
						}
					});
					this.setState({
						buyRemark: res.data.buyerNote,
						remarkLength: res.data.buyerNote ? res.data.buyerNote.length : 0,
						modifyProvince: res.data.consigneeProvince,
						modifyCity: res.data.consigneeCity,
					});
					let inquirySheetMaterials = res.data.inquirySheetMaterials;
					for (let i in inquirySheetMaterials) {
						materialData.push({
							key: i,
							materialBrand: inquirySheetMaterials[i].materialBrand,
							materialName: inquirySheetMaterials[i].materialName,
							materialUnit: inquirySheetMaterials[i].materialUnit,
							quantity: inquirySheetMaterials[i].quantity,
							remark: inquirySheetMaterials[i].remark
						})
					}
					//商家
					for (let i in sellerData) {
						//0店铺被下架1店铺上架
						if (sellerData[i].shopState !== '0') {
							tags.push({
								id: sellerData[i].shopId,
								shopName: sellerData[i].shopName,
								from: 1
							})
							this.state.shopInfoData.push({
								id: sellerData[i].shopId,
								shopName: sellerData[i].shopName,
								from: 1
							})
						}

					}
					//含税
					if (res.data.quoteRequirement === 0) {
						this.setState({
							quoteRequirement: [],
							tax: 0
						})
					}
					if (res.data.quoteRequirement === 1) {
						this.setState({
							quoteRequirement: ['含税'],
							tax: 1
						})
					}
					if (res.data.quoteRequirement === 2) {
						this.setState({
							quoteRequirement: ['含运费'],
							tax: 2
						})
					}
					if (res.data.quoteRequirement === 3) {
						this.setState({
							quoteRequirement: ['含税', '含运费'],
							tax: 3
						})
					}
					//身份
					if (res.data.buyerIdentity !== '个人' && this.state.companyName) {
						this.setState({
							identity: this.state.companyName
						})
					} else {
						this.setState({
							identity: '个人'
						})
					}
					//附件图片
					let images = res.data.image;
					if (images) {
						images = images.split(',');
						for (let i in images) {
							this.state.fileList.push({
								uid: i,
								url: baseUrl + '/' + images[i]
							})
						}
					}
					this.setState({
						showBtn: true,
						imgData: images ? images : [],
						//count: materialData.length + 1
						count: materialData.length
					})
				}

			})
		} else if (type === '3') {
			//常购材料
			ofenShopMaterialFun(this.props.router.query.ids).then(res => {
				let materialItem = {};
				if (res.result === 'success') {
					res.data.map((item, index) => {
						materialItem = {
							key: index,
							materialBrand: item.brand,
							materialName: item.name,
							materialUnit: item.unit,
							quantity: ''
						};
						materialData.push(materialItem);
					});
					this.setState({
						materialData,
						//count: materialData.length + 1
						count: materialData.length
					})
				}
			})
		} else {
			//身份
			materialData.push({
				key: 0,
				materialBrand: '',
				materialName: '',
				materialUnit: '',
				quantity: ''
			})
		}
	};
	/*-----备注更改----*/
	remarkChange = (e) => {
		this.setState({
			buyRemark: e.target.value,
			remarkLength: e.target.value.length
		})
	};
	/*-----点击上传excel--------*/
	showResource = () => {
		let fileToSent = document.getElementById('fileExcel');
		fileToSent.click()
	};
	onImportExcel = file => {
		// 获取上传的文件对象
		const {files} = file.target;
		let size = files[0].size / 1024 / 1024;
		if (size >= 2) {
			message.info('上传文件太大！');
			return;
		}
		// 通过FileReader对象读取文件
		const fileReader = new FileReader();
		fileReader.onload = event => {
			try {
				const {result} = event.target;
				// 以二进制流方式读取得到整份excel表格对象
				const workbook = XLSX.read(result, {type: 'binary'});
				// 存储获取到的数据
				let data = [];
				// 遍历每张工作表进行读取（这里默认只读取第一张表）
				for (const sheet in workbook.Sheets) {
					// esline-disable-next-line
					if (workbook.Sheets.hasOwnProperty(sheet)) {
						// 利用 sheet_to_json 方法将 excel 转成 json 数据
						data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
						break; // 如果只取第一张表，就取消注释这行
					}
				}
				// 最终获取到并且格式化后的 json 数据
				message.success('上传成功！');
				const {materialData, count} = this.state;
				let material = [];
				Object.keys(materialData).forEach((item) => {
					if (materialData[item].materialBrand || materialData[item].materialName || materialData[item].materialUnit || materialData[item].quantity) {
						material.push(materialData[item])
					}
				});
				let arr = [];
				Object.keys(data).forEach((item) => {
					if ((data[item]['品牌\r\n(限制15个字符长度)'] || data[item]['品牌&#10;(限制15个字符长度)']) || (data[item]['材料名称*\r\n(限制30个字符)wu\'liao'] || data[item]['材料名称*&#10;(限制30个字符)']) ||
						(data[item]['单位*\r\n(请选择)'] || data[item]['单位*&#10;(请选择)']) || (data[item]['数量*\r\n(请输入)'] || data[item]['数量*&#10;(请输入)'])) {
						arr.push({
							key: Number(item) + count,
							materialBrand: data[item]['品牌\r\n(限制15个字符长度)'] || data[item]['品牌&#10;(限制15个字符长度)'],
							materialName: data[item]['材料名称*\r\n(限制30个字符)wu\'liao'] || data[item]['材料名称*&#10;(限制30个字符)'],
							materialUnit: data[item]['单位*\r\n(请选择)'] || data[item]['单位*&#10;(请选择)'],
							quantity: data[item]['数量*\r\n(请输入)'] || data[item]['数量*&#10;(请输入)']
						});
					}
				});
				//处理excel导入的数据所有不符合的
				for (let i in arr) {
					let quantity = arr[i].quantity;
					let reg = /^(\-)*(\d+)\.(\d\d).*$/;
					//品牌名称数量当为全空格时都替换'',品牌(15)与名称(30)
					if ((arr[i].materialBrand && arr[i].materialBrand.match(/^[ ]*$/)) || arr[i].materialBrand == null) {
						arr[i].materialBrand = ''
					} else if (arr[i].materialBrand && arr[i].materialBrand.length > 15) {
						arr[i].materialBrand = arr[i].materialBrand.substr(0, 15)
					}
					if ((arr[i].materialName && arr[i].materialName.match(/^[ ]*$/)) || arr[i].materialName == null) {
						arr[i].materialName = ''
					} else if (arr[i].materialName && arr[i].materialName.length > 30) {
						arr[i].materialName = arr[i].materialName.substr(0, 30)
					}
					if (arr[i].materialUnit == null) {
						arr[i].materialUnit = '';
					}
					//数量导入表格的:全是空格,不是数字类型,小数点超过2位,有负数(-),有空格时，数字大于999999.99,都设置为'';//quantity && quantity.indexOf("-") !== -1
					if ((quantity && quantity.match(/^[ ]*$/)) || (quantity && isNaN(quantity)) || (quantity && reg.test(quantity)) || (quantity && Number(quantity) <= 0)
						|| (quantity && quantity.indexOf(' ') !== -1) || (quantity && Number(quantity) >= 999999.99) || quantity == null) {
						arr[i].quantity = ''
					}

				}
				this.setState({
					exportMaterial: false,
					materialData: material.concat(arr),
					count: arr.length + count
				}, () => {
					this.checkTable();
				})
				/*this.setState({
						exportData: data
				})*/
			} catch (e) {
				// 这里可以抛出文件类型错误不正确的相关提示
				message.error('文件类型不正确！');
			}
			//判断excel表是否为空
			/*if(sheetInner.length === 0){
					alert('表单无数据,请先填写内容');
					return;
			}*/
		};
		// 以二进制方式打开文件
		fileReader.readAsBinaryString(files[0]);
	};

	descChange = (e, index) => {
		const {materialData} = this.state;
		materialData[index].remark = e.target.value;
		this.setState({
			materialData
		})
	};

	/*----获取地区json----*/
	getAllArea() {
		const provinces = [];
		getAreaCityFun().then(res => {
			if (res.result === 'success') {
				Object.assign(res.data).map(i => {
					provinces.push(i.provinceName);
				});
				this.setState({
					data: res.data,
					provinces: provinces,
				})
			}
		});
	}

	/*-----省市区联动-----*/
	handleChangeprovince = (value) => {
		const {data} = this.state;
		this.setState({
			cities: data[value.key].cities,
			province: value.label,
			counties: data[value.key].cities[0].areas,
			modifyProvince: value.label,
			modifyCity: data[value.key].cities[0].cityName,
		}, () => {
			this.props.form.setFields({
				address: {
					value: [this.state.modifyProvince, this.state.modifyCity]
				}
			});
		});
	};

	handleChangecity = (value) => {
		const {cities} = this.state;
		this.setState({
			counties: cities[value.key].areas,
			city: value.label,
			modifyCity: value.label,
		});
	};

	inquirytTypeChange = (e) => {
		this.setState({
			inquiryType: e.target.value
		})
	};

	render() {
		const {tags, previewVisible, previewImage, fileList, companyName, identity, materialData, buyRemark, provinces, modifyProvince, modifyCity, showModalKind} = this.state;
		const {getFieldDecorator} = this.props.form;
		const provinceOptions = provinces.map((province, index) => <Option value={index} key={index}>{province}</Option>);
		const cityOptions = this.state.cities.map((city, index) => <Option value={index} key={index}>{city.cityName}</Option>);
		const uploadButton = (
			<div>
				<Icon type="plus" className="text-muted" style={{fontSize: '30px'}} />
				<div className="ant-upload-text">点击上传</div>
			</div>
		);
		const formItemLayout = {
			labelCol: {
				sm: {span: 2},
			},
			wrapperCol: {
				sm: {span: 22},
			},
		};
		return (
			<Layout title="发布询价" showBigImage={true}>
				<section className="inquiryMenu">
					<section className="inquiryWrapper bg-white mt3 maxWidth">
						<div className="large sheetTitle">
							<span className="sign show" />
							确认询价单
						</div>
						<Form onSubmit={this.handleSubmit} className="inquirySheetForm">
							<FormItem
								label="询价标题"
								{...formItemLayout}
								className="inquiryLabel"
							>
								{getFieldDecorator('inquiryTitle', {
									rules: [
										{required: true, message: '询价标题不能为空'},
										{validator: this.inquiryTitle}
									],
								})(
									<Input size="large" placeholder="标题长度限制30个字" maxLength={30} style={{width: '300px'}} className="h5" />
								)}
							</FormItem>
							<FormItem label="收货地址"  {...formItemLayout} className="inquiryLabel">
								{getFieldDecorator('address', {
									initialValue: this.state.modifyProvince ? [this.state.modifyProvince, this.state.modifyCity] : [],
									rules: [{
										required: true, message: '请选择收货地址', type: 'array'
									}],
								})(
									<div className="selectAddress">
										<Select labelInValue style={{width: '300px', marginRight: '8px'}} onChange={this.handleChangeprovince} placeholder="请选择"
										        size="large" getPopupContainer={triggerNode => triggerNode.parentNode}
										        value={{key: modifyProvince}}>
											{provinceOptions}
										</Select>
										<Select labelInValue style={{width: '300px'}} onChange={this.handleChangecity} placeholder="请选择"
										        size="large" getPopupContainer={triggerNode => triggerNode.parentNode}
										        value={{key: modifyCity}}>
											{cityOptions}
										</Select>
									</div>
								)}
							</FormItem>
							<FormItem label="询价方式"  {...formItemLayout} className="inquiryLabel">
								{getFieldDecorator('inquiryType', {
									initialValue: 1,//this.state.inquiryType,
									rules: [{
										required: true, message: '请选择询价方式', type: 'number'
									}],
								})(
									<Radio.Group onChange={this.inquirytTypeChange}>
										<Radio value={2}>公开询价</Radio>
										<Radio value={1}>邀请供应商报价</Radio>
									</Radio.Group>
								)}
							</FormItem>
							{this.props.form.getFieldValue('inquiryType') === 1 ?
								<FormItem
									label="发送商家"
									{...formItemLayout}
									className="inquiryLabel"
								>
									{getFieldDecorator('sendBusiness', {
										initialValue: this.state.tags,
										rules: [{
											required: true, message: '请添加商家', type: 'array'
										}],
									})(
										<div className="sendSeller">
											{
												this.state.tags.map((tag) => {
													return (
														<Tag key={tag.shopName} closable="true" afterClose={() => this.handleClose(tag)}>{tag.shopName}</Tag>
													)
												})
											}
											<span className="addSeller" onClick={this.showAddSeller.bind(this)}>
											<Icon type="plus-circle" style={{marginRight: '10px',}} />添加
										</span>
										</div>
									)}
								</FormItem>
								:
								''
							}
							{/*<FormItem*/}
								{/*label="买家身份"*/}
								{/*{...formItemLayout}*/}
								{/*className="inquiryLabel"*/}
							{/*>*/}
								{/*{getFieldDecorator('identity', {*/}
									{/*initialValue: identity,*/}
									{/*rules: [*/}
										{/*{required: true, message: '请选择身份！',}*/}
									{/*],*/}
								{/*})*/}
								{/*(*/}
									{/*<Select size="large" onChange={this.identityChange.bind(this)} style={{width: '300px'}}>*/}
										{/*<Option value="个人">个人</Option>*/}
										{/*{*/}
											{/*this.state.flag === 2*/}
												{/*? <Option value={companyName}>{companyName}</Option>*/}
												{/*: null*/}
										{/*}*/}
									{/*</Select>*/}
								{/*)}*/}
							{/*</FormItem>*/}
							<FormItem
								className="materialList"
							>
								<Row style={{marginBottom: '10px'}}>
									<Col title="材料列表" className="text-darkgrey materialMark" span={8}>
										材料列表
									</Col>
									<Col span={16} className="text-right">
										<Button icon="upload" size="large" className="regularBtn" onClick={() => this.setState({exportMaterial: true})}>批量导入</Button>
										<Button type="primary" className="bg-primary-linear h5" onClick={this.regularMaterial.bind(this)}
										        size="large">从常购材料中添加</Button>
									</Col>
								</Row>
								<div style={{background: '#FFFAF0', paddingBottom: '30px'}}>
									<Table columns={this.columns} dataSource={materialData} pagination={false} className="materialTable"
									       ref="tablesMaterial" />
									{
										this.state.materialTip ?
											<p className="errorTip">请完善材料信息</p>
											: null
									}
									<span className="addSeller addMaterial" onClick={this.addMaterialLine}>
										<Icon type="plus-circle" style={{marginRight: '10px',}} />添加新材料
									</span>
								</div>
							</FormItem>
							<FormItem
							>
								<Row>
									<Col className="text-darkgrey">附件图片 <span className="text-muted">(&nbsp;最多可上传6张图片&nbsp;)</span></Col>
								</Row>
								{getFieldDecorator('materialsImg', {})(
									<div className="clearfix">
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
											{fileList.length >= 6 ? null : uploadButton}
										</Upload>
										<Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} centered>
											<img alt="example" style={{width: '100%'}} src={previewImage} />
										</Modal>
									</div>
								)}
							</FormItem>
							<FormItem
								label="买家备注"
							>
								{getFieldDecorator('buyRemark', {
									initialValue: buyRemark,
								})(
									<div className="buyRemark">
										<Input.TextArea placeholder="请填写备注信息(选填)" style={{background: '#FFFAF0'}} rows={4}
										                value={this.state.buyRemark} maxLength={300} onChange={this.remarkChange}>
										</Input.TextArea>
										<div className="textLength">
											<span>{this.state.remarkLength}</span>
											<span>/</span>
											<span>300</span>
										</div>
									</div>
								)}
							</FormItem>
							<FormItem>
								<Row>
									<Col style={{width: '80px'}} className="show text-darkgrey">报价要求</Col>
									<Col className="show">
										<div className="buyRemark">
											<CheckboxGroup options={this.state.plainOptions} onChange={this.taxChange.bind(this)} value={this.state.quoteRequirement} />
										</div>
									</Col>
								</Row>
							</FormItem>
							<FormItem label="询价有效期"{...formItemLayout} className="inqueryTimeWrapper">
								{getFieldDecorator('inquiryTime', {
									rules: [
										{required: true, message: '询价有效期不能为空'},
										{validator: this.checkInquiryTime}
									],
								})(
									<DatePicker
										showToday={false}
										showTime={{defaultValue: moment(`${new Date().getHours() + 1}:00:00`, 'HH:mm:ss')}}
										disabledTime={this.disabledDateTime}
										format="YYYY-MM-DD HH:mm:ss"
										placeholder="年/月/日/时"
										size="large"
										style={{width: '300px'}}
										className="inquiryTime h5"
										disabledDate={this.disabledDate}
										onChange={this.timeChange.bind(this)}
										onOk={this.timeOk.bind(this)}
									/>
								)}
							</FormItem>
							<FormItem className="text-center">
								<Button type="primary" htmlType="submit" size="large" className="bg-primary-linear"
								        style={{width: '400px', height: '50px', marginTop: '36px'}}>
									提交询价单
									<span className="materialTotal">共{this.state.materialData.length}种材料</span>
								</Button>
							</FormItem>
						</Form>
					</section>
				</section>
				{/*---添加商家---*/}
				<AddBusiness isShowAddSeller={this.state.showAddModel} showChangeAddSeller={this.changeDisplay.bind(this)}
				             sellerInfo={this.sellerName.bind(this)}
				             sentMerchants={this.state.shopInfoData} type={'inquiry'} removeShopInfo={this.state.removeShopInfo} />
				{/*---添加常购材料---*/}
				<AddMaterialModal isShowAddMaterial={this.state.showAddMaterial} showAddMaterial={this.changeMaterial.bind(this)}
				                  materialInfo={this.selectMaterialInfo.bind(this)} />
				<Modal visible={this.state.integral}
				       okText='我知道了'
				       closable={false}
				       centered
				       onOk={this.integralOk.bind(this)}
				       footer={[
					       <Button key="submit" type="primary" size="large" onClick={this.integralOk}>
						       我知道了
					       </Button>,
				       ]}
				>
					<p className="text-center h3 text-center" style={{marginTop: '70px'}}>
						提交成功，等待对方报价
					</p>
					{
						tags.length >= 3 ?
							<p className="text-center h3 text-center">
								积分+5
							</p>
							: null
					}
				</Modal>
				<Modal visible={this.state.exportMaterial}
				       closable={false}
				       centered
				       width={540}
				       footer={[
					       <Button key="submit" type="primary" size="large" onClick={() => this.setState({exportMaterial: false})}>
						       取消
					       </Button>,
				       ]}
				>
					<h2 className="text-center">从我的电脑导入</h2>
					<Row className="exportMaterial mt4">
						<Col span={10} className="text-right prl4 text-darkgrey">第1步</Col>
						<Col span={14}>
							<a href="http://www.zhuzhujiancai.com/app/uploadImg/确认询价单-材料清单模版.xlsx" className="text-primary">
								下载Excel模板</a>
						</Col>
					</Row>
					<Row className="exportMaterial mt2">
						<Col span={10} className="text-right prl4 text-darkgrey">第2步</Col>
						<Col span={14}>
							<Button type="primary" onClick={this.showResource}>上传文件</Button>
							<input type='file' accept='.xlsx' onChange={this.onImportExcel} id="fileExcel" style={{display: 'none'}}
							       value={this.state.exportValue} />
						</Col>
					</Row>
				</Modal>
				{/*已注册商家的提示*/}
				<Modal visible={showModalKind === 1}
				       okText='我知道了'
				       onCancel={this.closeModal}
				       centered={true}
				       footer={[<Button key="submit" type="primary" onClick={this.closeModal}>我知道了</Button>]}>
					<h2 className="text-center ptb4 mt4">您已成为商家用户，不可使用询价功能！</h2>
				</Modal>
				{/*存在已下架的店铺*/}
				<Modal visible={showModalKind === 4}
				       okText='继续'
				       cancelText='取消'
				       onOk={this.props.goToInquiry}
				       onCancel={this.closeModal}
				       centered={true}
				>
					<h2 className="text-center ptb4 mt4">询价单中存在已被下架的商家，继续操作将会删除已被下架的商家，是否继续？</h2>
				</Modal>
			</Layout>
		)
	}
}

const inquirySheet = Form.create()(InquirySheet);
export default withRouter(inquirySheet)
