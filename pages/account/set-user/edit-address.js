//编辑收货地址
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Button, Row, Col, Form, Input, Select, Checkbox} from 'antd';
import cookie from 'react-cookies';
import {checkPhone} from 'config/regular';
import {iconUrl, baseUrl} from 'config/evn'
import {userAddressFun, addAddressFun, getAreaCityFun} from 'server'
import './style.less'

const Option = Select.Option;
const FormItem = Form.Item;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});


class EditAddressForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			customerData: [],
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			data: [],
			province: cookie.load('editAddress') ? cookie.load('editAddress').province : null,
			city: cookie.load('editAddress') ? cookie.load('editAddress').city : null,
			county: cookie.load('editAddress') ? cookie.load('editAddress').area : null,
			id: cookie.load('editAddress') ? cookie.load('editAddress').id : null,
			provinces: [],
			cities: [],
			counties: [],
			isDefault: cookie.load('editAddress') ? cookie.load('editAddress').isDefault : 0,
			checked: false
		}
	}

	componentWillMount() {
		if (cookie.load('editAddress') && cookie.load('editAddress').isDefault === '1') {
			this.setState({
				checked: true
			});
		}
	}

	componentDidMount() {
		this.getAllArea();
		this.getUserAddress();
		const form = this.props.form;
		/*----获取从收货地址页面带来的编辑地址数据----*/
		let editData = cookie.load('editAddress');
		if (editData) {
			form.setFields({
				userName: {
					value: editData.userName,
				},
				mobile: {
					value: editData.userPhone,
				},
				addressDetail: {
					value: editData.address,
				}
			});
		}
	}

	/*----收件人名称校验----*/
	userName = (rule, value, callback) => {
		if (value && value.indexOf(' ') !== -1) {
			callback('姓名格式不正确')
		}
		callback();
	};
	/*-----收件人手机号校验-----*/
	userPhone = (rule, value, callback) => {
		const form = this.props.form;
		if (value && !checkPhone(value)) {
			callback('请输入正确的手机号码');
		} else {
			this.setState({
				seller: false
			});
			callback();
		}
	};
	/*-----省市区联动----city county-*/
	handleChangeprovince = (value) => {
		const {data} = this.state;
		this.setState({
			cities: data[value.key].cities,
			province: value.label,
			city: data[value.key].cities[0].cityName,
			county: data[value.key].cities[0].areas[0].areaName
		});
	};

	handleChangecity = (value) => {
		const {cities} = this.state;
		this.setState({
			counties: cities[value.key].areas,
			city: value.label,
			county: cities[value.key].areas[0].areaName
		});
	};

	handleChangecounty = (value) => {
		this.setState({
			county: value.label
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
		const {province, city, county, isDefault, id, userCode} = this.state;
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				/*----提交收货地址----*/
				let params = {
					userCode: userCode,
					username: values.userName,
					userPhone: values.mobile,
					province: province,
					city: city,
					area: county,
					address: values.addressDetail,
					isDefault: isDefault,
					id: id
				};
				addAddressFun(params).then(res => {
					if (res.result === 'success') {
						Router.push('/account/set-user/receiving-address')
						// this.props.history.push(`/receivindAddress`)
					}
				})
			}
		});
	};

	/*----获取地区json----*/
	getAllArea = () => {
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

	getUserAddress = () => {
		let params = {
			userCode: this.state.userCode
		};
		/*---用户收货地址---*/
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let userData = res.data;
				for (let i in userData) {
					if (!userData[i].street) {
						userData[i].street = ''
					}
				}
				this.setState({
					customerData: userData
				})
			}
		})
	};

	render() {
		const {provinces, cities, counties, customerData} = this.state;
		const provinceOptions = provinces.map((province, index) => <Option value={index} key={index}>{province}</Option>);
		const cityOptions = this.state.cities.map((city, index) => <Option value={index} key={index}>{city.cityName}</Option>);
		const countiesOptions = this.state.counties.map((county, index) => <Option value={index} key={index}>{county.areaName}</Option>);
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 8},
			},
		};
		return (
			<Layout title="编辑收货地址" mainMenuIndex={'setting'} menuIndex={'7'}>
				<section className="bg-white p4 addAddress" style={{height: '766px'}}>
					<p className="h0 mt2 addTitle prl2 text-grey" style={{marginLeft: '64px'}}>编辑收货地址</p>
					<Form onSubmit={this.handleSubmit} className="mt4 myForm">
						<FormItem
							{...formItemLayout}
							label="收件人姓名"
						>
							{getFieldDecorator('userName', {
								rules: [
									{required: true, message: '姓名应为1-25个字符'},
									{validator: this.userName}
								]
							})(
								<Input type="text" placeholder="姓名应为1-25个字符" size="large" maxLength={25} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="收件人电话"
						>
							{getFieldDecorator('mobile', {
								rules: [
									{required: true, message: '请输入正确的手机号'},
									{validator: this.userPhone}
								]
							})(
								<Input type="text" placeholder="请输入收件人电话" size="large" maxLength={11} />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="收件地址"
						>
							{getFieldDecorator('address', {})(
								<div className="selectAddress">
									<Select labelInValue style={{width: 90, marginRight: '4px'}} onChange={this.handleChangeprovince}
									        size="large" value={{key: this.state.province}}>
										{provinceOptions}
									</Select>
									<Select labelInValue style={{width: 100, marginRight: '4px'}} onChange={this.handleChangecity}
									        size="large" value={{key: this.state.city}}>
										{cityOptions}
									</Select>
									<Select labelInValue style={{width: 100}} onChange={this.handleChangecounty} size="large"
									        value={{key: this.state.county}}>
										{countiesOptions}
									</Select>
								</div>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="详细地址"
						>
							{getFieldDecorator('addressDetail', {
								rules: [
									{required: true, message: '详细地址不少于5个字符'},
									{validator: this.addressInfo}
								]
							})(
								<Input.TextArea placeholder="详细地址不少于5个字符" rows={4} min={5} maxLength={50}>
								</Input.TextArea>
							)}
						</FormItem>
						<FormItem>
							<Row>
								<Col span={8} offset={8}>
									<Checkbox onChange={this.onChangeDefault} defaultChecked={this.state.checked}>设为默认地址</Checkbox>
								</Col>
							</Row>
						</FormItem>
						<FormItem>
							<div style={{width: '300px', margin: 'auto'}} className="mt3">
								<Button type="primary" size="large" htmlType="submit" block className="bg-primary-linear border-radius"
								        style={{height: '50px'}}>保存</Button>
							</div>
						</FormItem>
					</Form>
				</section>
			</Layout>
		)
	}
}

const EditAddress = Form.create()(EditAddressForm);
export default EditAddress
