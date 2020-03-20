import React, {Fragment} from 'react'
import {Checkbox, Row, Col, Form, Input, Select, Modal, message} from 'antd';
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
			data: [],//地址数据
			provinces: [],//省
			cities: [],//市
			counties: [],//区
			receiveAddrInfo: {}//用户选择的收货地址信息
		}
	}

	componentDidMount() {
		//获取地址数据
		this.getAllArea();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.addressInfo !== this.props.addressInfo) {
			this.setState({
				receiveAddrInfo: nextProps.addressInfo
			})
		}
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
	//region
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
	//endregion
	/*-----省市区联动 end-----*/

	/*-----表单提交----*/
	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let params = {
					userCode: this.userCode,
					...values,
					type: 1,//0：收货地址；1：发票地址
					isDefault: values.isDefault ? 1 : 0,
					id: this.state.receiveAddrInfo.id
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

	queryReceiveAddr = (e) => {
		let newAddress = this.props.queryReceiveAddress();
		if (!newAddress) {
			message.error('您还没有选择收货地址！');
			return false;
		}
		let tempId = this.state.receiveAddrInfo.id;
		this.setState({
			receiveAddrInfo: {
				...newAddress,
				id: tempId
			}
		})
	};

	setDefaultAddress = (e) => {
		let {receiveAddrInfo} = this.state;
		receiveAddrInfo.isDefault = e.target.value ? '1' : '0';
		this.setState({
			receiveAddrInfo
		})
	};

	render() {
		const {provinces, receiveAddrInfo} = this.state;
		const provinceOptions = provinces.map((province, index) => <Option value={province} key={index}>{province}</Option>);
		const cityOptions = this.state.cities.map((city, index) => <Option value={city.cityName} key={index}>{city.cityName}</Option>);
		const countiesOptions = this.state.counties.map((county, index) => <Option value={county.areaName} key={index}>{county.areaName}</Option>);

		const {getFieldDecorator} = this.props.form;

		const formItemLayout = {
			labelCol: {span: 4},
			wrapperCol: {span: 20},
		};

		const formItemTail = {
			wrapperCol: {span: 20, offset: 4},
		};
		return (
			<Modal
				title="收票地址"
				centered
				visible={this.props.show}
				onOk={this.handleSubmit}
				onCancel={this.props.close}
				cancelButtonProps={{style: {display: 'none'}}}
				okText="保存"
			>
				<Form onSubmit={this.handleSubmit}>
					<FormItem {...formItemLayout} label="收标地址" style={{marginBottom: '10px'}}>
						<Checkbox onChange={this.queryReceiveAddr}>同收货地址</Checkbox>
					</FormItem>
					<FormItem {...formItemLayout} label="收件人" style={{marginBottom: '10px'}}>
						{getFieldDecorator('userName', {
							initialValue: receiveAddrInfo.userName,
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
							initialValue: receiveAddrInfo.userPhone,
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
										initialValue: receiveAddrInfo.province,
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
										initialValue: receiveAddrInfo.city,
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
										initialValue: receiveAddrInfo.area,
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
							initialValue: receiveAddrInfo.address,
							validateFirst: true,
							rules: [
								{required: true, message: '详细地址不少于5个字符'},
								{min: 5, message: '详细地址不少于5个字符'},
								{whitespace: true, message: '请输入非空白内容'}
							]
						})(
							<Input placeholder="详细地址不少于5个字符" />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="邮箱(选填)" style={{marginBottom: '10px'}}>
						{getFieldDecorator('email', {
							initialValue: receiveAddrInfo.email,
							validateFirst: true,
							rules: [
								{whitespace: true, message: '请输入正确的邮箱'}
							]
						})(
							<Input placeholder="详细地址不少于5个字符" />
						)}
					</FormItem>
					<FormItem {...formItemTail} style={{marginBottom: '10px'}}>
						{getFieldDecorator('isDefault', {})(
							<Checkbox checked={receiveAddrInfo.isDefault === '1'} onChange={this.setDefaultAddress}>设为默认</Checkbox>
						)}
					</FormItem>
				</Form>
			</Modal>
		)
	}
}

const Address = Form.create()(AddAddressForm);
export default Address
