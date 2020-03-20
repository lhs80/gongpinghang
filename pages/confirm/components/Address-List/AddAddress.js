/*-----新增收货地址-----*/
import React, {Fragment} from 'react'
import {Button, Row, Col, Form, Input, Select, Modal, Switch} from 'antd';
import cookie from 'react-cookies';
import {validatePhone} from 'config/regular';
import {addAddressFun, getAreaCityFun} from '../../../../server/index'

const Option = Select.Option;
const FormItem = Form.Item;

class AddAddressForm extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null;
		this.state = {
			data: [],
			provinces: [],
			cities: [],
			counties: [],
		}
	}

	componentDidMount() {
		this.getAllArea();
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

	/*-----省市区联动 begin-----*/
	handleChangeprovince = (value) => {
		const {data} = this.state;
		let cities = data.filter(item => item.provinceName === value);
		this.setState({
			cities: cities[0].cities,
			counties: cities[0].cities[0].areas,
		});
		this.props.form.setFieldsValue({city: '', area: ''})
	};

	handleChangecity = (value) => {
		const {cities} = this.state;
		let counties = cities.filter(item => item.cityName === value);
		this.setState({
			counties: counties[0].areas,
		});
		this.props.form.setFieldsValue({area: ''})
	};

	handleChangecounty = (value) => {
		this.setState({
			county: value.label,
			modifyArea: value.label
		});
	};
	/*-----省市区联动 end-----*/

	/*-----表单提交----*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let params = {
					userCode: this.userCode,
					...values,
					type: 0,//0：收货地址；1：发票地址
					isDefault: values.isDefault ? 1 : 0
				};
				addAddressFun(params).then(res => {
					if (res.result === 'success') {
						this.props.form.resetFields();
						this.props.close();
					}
				})
			}
		});
	};

	render() {
		const {provinces} = this.state;
		const provinceOptions = provinces.map((province, index) => <Option value={province} key={index}>{province}</Option>);
		const cityOptions = this.state.cities.map((city, index) => <Option value={city.cityName} key={index}>{city.cityName}</Option>);
		const countiesOptions = this.state.counties.map((county, index) => <Option value={county.areaName} key={index}>{county.areaName}</Option>);

		const {getFieldDecorator} = this.props.form;

		const formItemLayout = {
			labelCol: {span: 4},
			wrapperCol: {span: 20},
		};

		return (
			<Modal
				title="编辑收货人信息"
				centered
				visible={this.props.show}
				onOk={this.handleSubmit}
				onCancel={this.props.close}
				cancelButtonProps={{style: {display: 'none'}}}
				okText="保存收货人信息"
			>
				<Form onSubmit={this.handleSubmit}>
					<FormItem {...formItemLayout} label="收件人" style={{marginBottom: '10px'}}>
						{getFieldDecorator('userName', {
							rules: [
								{required: true, message: '姓名应为1-25个字符'},
								{whitespace: true, message: '请输入收件人'}
							]
						})(
							<Input type="text" placeholder="请输入收件人" maxLength={25} />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="手机号码" style={{marginBottom: '10px'}}>
						{getFieldDecorator('userPhone', {
							rules: [
								{required: true, message: '请输入正确的手机号'},
								{validator: validatePhone}
							]
						})(
							<Input type="text" placeholder="请输入收件人电话" maxLength={11} />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="所在地区" style={{marginBottom: '10px'}}>
						<Row gutter={10}>
							<Col span={8}>
								<FormItem style={{marginBottom: '0'}}>
									{getFieldDecorator('province', {
										rules: [
											{required: true, message: '请选择省'},
										]
									})(
										<Select onChange={this.handleChangeprovince} placeholder="请选择">
											{provinceOptions}
										</Select>
									)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem style={{marginBottom: '0'}}>
									{getFieldDecorator('city', {
										rules: [
											{required: true, message: '请选择市'},
										]
									})(
										<Select onChange={this.handleChangecity} placeholder="请选择">
											{cityOptions}
										</Select>
									)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem style={{marginBottom: '0'}}>
									{getFieldDecorator('area', {
										rules: [
											{required: true, message: '请选择区'},
										]
									})(
										<Select onChange={this.handleChangecounty} placeholder="请选择">
											{countiesOptions}
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
					</FormItem>
					<FormItem {...formItemLayout} label="详细地址" style={{marginBottom: '10px'}}>
						{getFieldDecorator('address', {
							validateFirst: true,
							rules: [
								{required: true, message: '详细地址不少于5个字符'},
								{min: 5, message: '详细地址不少于5个字符'},
								{whitespace: true, message: '请输入非空白内容'}
							]
						})(
							<Input.TextArea placeholder="详细地址不少于5个字符" rows={4} minLength={5} maxLength={50} />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="默认地址" style={{marginBottom: '10px'}}>
						{getFieldDecorator('isDefault', {})(
							<Switch />
						)}
					</FormItem>
				</Form>
			</Modal>
		)
	}
}

const Address = Form.create()(AddAddressForm);
export default Address
