/*-----新增收货地址-----*/
import React from 'react'
import Router from 'next/router'
import {Icon, Layout, Button, Row, Col, Form, Input, Select, Checkbox} from 'antd';
import cookie from 'react-cookies';
import {checkPhone, validatePhone} from 'config/regular';
import {userAddressFun, addAddressFun, getAreaCityFun} from 'server'
// import "style/setUser.less"

const Option = Select.Option;
const FormItem = Form.Item;

class AddAddressForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null;
		this.state = {
			customerData: [],//用户收货地址
			data: [],
			provinces: [],
			cities: [],
			counties: [],
			isDefault: 0,
			modifyProvince: '',
			modifyCity: '',
			modifyArea: '',
		}
	}

	componentDidMount() {
		this.getCustomerAddressList();
		this.getAllArea();
	}


	/*----收件人名称校验----*/
	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};

	/*-----省市区联动-----*/
	handleChangeprovince = (value) => {
		const {data} = this.state;
		this.setState({
			cities: data[value.key].cities,
			province: value.label,
			counties: data[value.key].cities[0].areas,
			modifyProvince: value.label,
			modifyCity: data[value.key].cities[0].cityName,
			modifyArea: data[value.key].cities[0].areas[0].areaName
		}, () => {
			this.props.form.setFieldsValue({
				address: [this.state.province, this.state.modifyCity, this.state.modifyArea]
			})
		});
	};

	handleChangecity = (value) => {
		const {cities} = this.state;
		this.setState({
			counties: cities[value.key].areas,
			city: value.label,
			modifyCity: value.label,
			modifyArea: cities[value.key].areas[0].areaName
		});
	};

	handleChangecounty = (value) => {
		this.setState({
			county: value.label,
			modifyArea: value.label
		}, () => {
			/*this.props.form.setFieldsValue({
					address: [this.state.province, this.state.city, this.state.county]
			})*/
		});
	};

	/*-----详细地址的校验----*/
	addressInfo = (rule, value, callback) => {
		if (value && value.replace(/\ +/g, '').length < 5) {
			callback('详细地址不少于5个字符')
		}
		callback();
	};
	/*----默认地址的选择-----*/
	onChangeDefault = (e) => {
		if (e.target.checked) {
			this.setState({
				isDefault: 1
			})
		}
	};
	/*-----表单提交----*/
	handleSubmit = (e) => {
		const {isDefault} = this.state;
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				/*----提交收货地址----*/
				let params = {
					userCode: this.userCode,
					username: values.userName,
					userPhone: values.mobile,
					/*province: values.address[0],
					city: values.address[1],
					area: values.address[2],*/
					province: this.state.modifyProvince,
					city: this.state.modifyCity,
					area: this.state.modifyArea,
					address: values.addressDetail,
					isDefault: isDefault,
				};
				addAddressFun(params).then(res => {
					if (res.result === 'success') {
						this.props.form.resetFields();
						if (this.props.type) {
							Router.push('/account/set-user/receiving-address')
							// this.props.history.push(`/receivindAddress`)
						} else {
							let status = false;
							this.props.changeBlackLast(status, res.data);
						}
					}
				})
			}
		});
	};

	/*---用户收货地址---*/
	getCustomerAddressList() {
		userAddressFun(this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					customerData: res.data
				})
			}
		})
	}

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

	blackLast = () => {
		let status = false;
		this.props.changeBlackLast(status);
	};

	render() {
		const {provinces, customerData, modifyProvince, modifyCity, modifyArea} = this.state;

		const provinceOptions = provinces.map((province, index) => <Option value={index} key={index}>{province}</Option>);
		const cityOptions = this.state.cities.map((city, index) => <Option value={index} key={index}>{city.cityName}</Option>);
		const countiesOptions = this.state.counties.map((county, index) => <Option value={index} key={index}>{county.areaName}</Option>);

		const {getFieldDecorator} = this.props.form;

		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 6},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 18},
			},
		};
		return (
			<Form onSubmit={this.handleSubmit} className={`${this.props.type === '1' ? 'myForm' : ''}`}>
				<FormItem {...formItemLayout} label="收件人姓名">
					{getFieldDecorator('userName', {
						rules: [
							{required: true, message: '姓名应为1-25个字符'},
							{validator: this.userName}
						]
					})(
						<Input type="text" placeholder="姓名应为1-25个字符" size="large" maxLength={25} />
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="收件人电话">
					{getFieldDecorator('mobile', {
						rules: [
							{required: true, message: '请输入正确的手机号'},
							{validator: validatePhone}
						]
					})(
						<Input type="text" placeholder="请输入收件人电话" size="large" maxLength={11} />
					)}
				</FormItem>
				<FormItem{...formItemLayout} label="收件地址">
					{getFieldDecorator('address', {
						rules: [
							{
								type: 'array', required: true, len: 3, message: '请输入地区',
								fields: {
									0: {type: 'string', required: true, message: '请输入省份',},
									1: {type: 'string', required: true, message: '请输入城市',},
									2: {type: 'string', required: true, message: '请输入地区',}
								}
							},
						],
					})(
						<div className="selectAddress">
							<Select labelInValue style={{width: '31.5%', marginRight: '8px'}} onChange={this.handleChangeprovince} placeholder="请选择"
							        size="large" getPopupContainer={triggerNode => triggerNode.parentNode}
							        value={{key: modifyProvince}}>
								{provinceOptions}
							</Select>
							<Select labelInValue style={{width: '31.5%', marginRight: '8px'}} onChange={this.handleChangecity} placeholder="请选择"
							        size="large" getPopupContainer={triggerNode => triggerNode.parentNode}
							        value={{key: modifyCity}}>
								{cityOptions}
							</Select>
							<Select labelInValue style={{width: '31.5%'}} onChange={this.handleChangecounty} placeholder="请选择" size="large"
							        getPopupContainer={triggerNode => triggerNode.parentNode} value={{key: modifyArea}}>
								{countiesOptions}
							</Select>
						</div>
					)}
				</FormItem>
				<FormItem{...formItemLayout} label="详细地址" className="detailAddress">
					{getFieldDecorator('addressDetail', {
						rules: [
							{required: true, message: '详细地址不少于5个字符'},
							{validator: this.addressInfo}
						]
					})(
						<Input.TextArea placeholder="详细地址不少于5个字符" rows={4} minLength={5} maxLength={50} />
					)}
				</FormItem>
				<FormItem>
					{
						customerData.length >= 1 ?
							<Row>
								<Col span={8} offset={6}>
									<Checkbox onChange={this.onChangeDefault}>设为默认地址</Checkbox>
								</Col>
							</Row>
							: null
					}
				</FormItem>
				{
					this.props.type === '1' ?
						<FormItem>
							<div style={{width: '300px', margin: 'auto'}} className="mt3">
								<Button type="primary" size="large" htmlType="submit" block  className="bg-primary-linear border-radius" style={{height: '50px'}}>保存</Button>
							</div>
						</FormItem>
						: <FormItem>
							<div className="text-center">
								<Button size="large"
								        ghost
								        style={{marginRight: '8px'}}
								        type="primary"
								        className={`h5 ${this.props.hideBtn ? 'hide' : 'show'}`}
								        onClick={this.blackLast}>
									返回上一级
								</Button>
								<Button type="primary" style={{width: '120px'}} size="large" htmlType="submit" className="bg-primary-linear border-radius">保存</Button>
							</div>
						</FormItem>
				}
			</Form>
		)
	}
}

const Address = Form.create()(AddAddressForm);
export default Address
