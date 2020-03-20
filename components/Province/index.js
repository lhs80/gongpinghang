import React, {Component} from 'react';
import {Select, Row, Col, Form} from 'antd';
import {getAreaCityFun} from '../../server';

class ProvinceIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
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

	/*-----省市区联动-----*/
	ProvinceChange = (value) => {
		this.props.form.resetFields([this.props.city]);
		this.props.form.resetFields([this.props.area]);
		const {data} = this.state;
		const {cities} = data.filter(item => item.provinceName === value)[0];
		this.setState({
			cities
		});
	};

	CityChange = (value) => {
		this.props.form.resetFields([this.props.area]);
		const {cities} = this.state;
		const {areas} = cities.filter(item => item.cityName === value)[0];
		this.setState({
			counties: areas
		});
	};

	render() {
		const {provinces} = this.state;
		const {getFieldDecorator} = this.props.form;
		const {province, city, area, isValidate, defaultValue} = this.props;
		const provinceOptions = provinces.map((province, index) => <Select.Option value={province} key={index}>{province}</Select.Option>);
		const cityOptions = this.state.cities.map((city, index) => <Select.Option value={city.cityName} key={index}>{city.cityName}</Select.Option>);
		const countiesOptions = this.state.counties.map((county, index) => <Select.Option value={county.areaName}
		                                                                                  key={index}>{county.areaName}</Select.Option>);
		return (
			<Row className="selectAddress" gutter={20}>
				<Col span={8}>
					<Form.Item style={{marginBottom: '0'}}>
						{getFieldDecorator(province, {
							initialValue: defaultValue ? defaultValue[0] : undefined,
							rules: [{
								required: isValidate, message: '请选择省',
							}]
						})(
							<Select onChange={this.ProvinceChange} placeholder="请选择" size="large">
								{provinceOptions}
							</Select>
						)}
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item style={{marginBottom: '0'}}>
						{getFieldDecorator(city, {
							initialValue: defaultValue ? defaultValue[1] : undefined,
							rules: [{
								required: isValidate, message: '请选择市',
							}]
						})(
							<Select onChange={this.CityChange} placeholder="请选择" size="large">
								{cityOptions}
							</Select>
						)}
					</Form.Item>
				</Col>
				<Col span={8}>
					<Form.Item style={{marginBottom: '0'}}>
						{getFieldDecorator(area, {
							initialValue: defaultValue ? defaultValue[2] : undefined,
							rules: [{
								required: isValidate, message: '请选择区',
							}]
						})(
							<Select placeholder="请选择" size="large">
								{countiesOptions}
							</Select>
						)}
					</Form.Item>
				</Col>
			</Row>
		);
	}
}

export default ProvinceIndex;
