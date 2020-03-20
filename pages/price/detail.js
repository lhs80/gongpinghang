import moment from 'moment';
import React from 'react'
import {withRouter} from 'next/router'
import Layout from 'components/Layout/index'
import {Row, Col, DatePicker, message} from 'antd'
import ReactEcharts from 'echarts-for-react';
import {materialPriceDetailFun} from 'server'
import './price.less'
import cookie from 'react-cookies'

const {MonthPicker} = DatePicker;

class PriceDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			materialPrice: {},
			chart: [],
			maxMin: [],
			option: {},
			startTime: '',
			endTime: '',
			value: [],
			mode: ['month', 'month'],
		}
	}

	componentDidMount() {
		if (!cookie.load('ZjsWeb')) {
			window.location.href = `/account.html#/login/${encodeURIComponent(window.location.href)}`
		}
		this.materialPriceDetail();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id)
			this.materialPriceDetail();
	}

	/**
	 * 查询材料详情
	 * */
	materialPriceDetail = () => {
		materialPriceDetailFun(this.props.router.query.id).then(res => {
			if (res.result === 'success') {
				this.setState({
					materialPrice: res.data.materialPrice,
					maxMin: res.data.maxMin,
					chart: res.data.chart,
				}, () => {
					this.getOption()
				})
			}
		})
	};

	getOption = () => {
		let xAxisData = [], seriesOne = [], seriesTwo = [], {startTime} = this.state, {endTime} = this.state;
		this.state.chart.forEach((item, index) => {
			if (!startTime && !endTime) {
				xAxisData.push(item.period);
				seriesOne.push(item.unitPrice);
				seriesTwo.push(item.unitSellingPrice)
			} else if (startTime && !endTime) {
				if (new Date(item.period) >= new Date(startTime)) {
					xAxisData.push(item.period);
					seriesOne.push(item.unitPrice);
					seriesTwo.push(item.unitSellingPrice)
				}
			} else if (!startTime && endTime) {
				if (new Date(item.period) <= new Date(endTime)) {
					xAxisData.push(item.period);
					seriesOne.push(item.unitPrice);
					seriesTwo.push(item.unitSellingPrice)
				}
			} else if (startTime && endTime) {
				if (new Date(item.period) >= new Date(startTime) && new Date(item.period) <= new Date(endTime)) {
					xAxisData.push(item.period);
					seriesOne.push(item.unitPrice);
					seriesTwo.push(item.unitSellingPrice)
				}
			}
		});
		this.setState({
			option: {
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				},
				legend: {
					data: ['含税价', '除税价']
				},
				xAxis: {
					axisTick: {
						show: true,
					},
					axisLine: {
						show: true,
					},
					type: 'category',
					boundaryGap: false,
					data: xAxisData,
				},
				yAxis: {
					axisTick: {
						show: false,
					},
					type: 'value',
					axisLabel: {
						formatter: '{value}'
					}
				},
				series: [
					{
						name: '含税价',
						type: 'line',
						data: seriesOne,
						color: '#53a8f1',
						markLine: {
							data: [
								[{
									symbol: 'none',
									x: '90%',
									yAxis: 'max'
								}, {
									symbol: 'circle',
									label: {
										normal: {
											position: 'start',
											formatter: '最大值' + this.state.maxMin.maxYes
										}
									},
									lineStyle: {
										color: 'orange'
									},
									type: 'max',
									name: '最高点'
								}],
								[{
									symbol: 'none',
									x: '90%',
									yAxis: 'min'
								}, {
									symbol: 'circle',
									label: {
										normal: {
											position: 'start',
											formatter: '最小值' + this.state.maxMin.minYes
										}
									},
									lineStyle: {
										color: 'orange'
									},
									type: 'min',
									name: '最低点'
								}]
							]
						}
					},
					{
						name: '除税价',
						type: 'line',
						data: seriesTwo,
						color: '#01af58',
					}
				]
			}
		});
	};

	/**
	 * 改变查询开始时间
	 **/
	onStartTimeChange = (date, dateString) => {
		let {endTime} = this.state;
		if (endTime) {
			if (new Date(endTime) >= new Date(dateString)) {
				this.setState({
					startTime: dateString
				}, () => {
					this.setMaxMin();
					this.getOption()
				})
			} else {
				message.info('结束时间不能小于开始时间');
			}
		} else {
			this.setState({
				startTime: dateString
			}, () => {
				this.setMaxMin();
				this.getOption()
			})
		}
	};

	/**
	 * 改变查询结束时间
	 **/
	onEndTimeChange = (date, dateString) => {
		let {startTime} = this.state;
		if (startTime) {
			if (new Date(startTime) <= new Date(dateString)) {
				this.setState({
					endTime: dateString
				}, () => {
					this.setMaxMin();
				})
			} else {
				message.info('结束时间不能小于开始时间');
			}
		} else {
			this.setState({
				endTime: dateString
			}, () => {
				this.setMaxMin();
			})
		}
	};

	/**
	 * 不可用日期
	 **/
	disabledDate = (current) => {
		let result = true;
		this.state.chart.forEach(item => {
			let newDate = new Date(item.period);
			if (current.year() === moment(newDate).year() && current.month() === moment(newDate).month()) {
				result = false;
				return result
			}
		});
		return result;
	};

	setMaxMin = () => {
		let newChart = [], {startTime, endTime} = this.state, unitPrice = [], unitSellPrice = [];
		if (startTime && !endTime) {
			newChart = this.state.chart.filter(item => {
				return new Date(item.period) >= new Date(startTime)
			});
		} else if (!startTime && endTime) {
			newChart = this.state.chart.filter(item => {
				return new Date(item.period) <= new Date(endTime)
			});
		} else if (startTime && endTime) {
			newChart = this.state.chart.filter(item => {
				return new Date(item.period) >= new Date(startTime) && new Date(item.period) <= new Date(endTime)
			});
		}

		newChart.forEach(item => {
			//unitPrice含税价，unitSellPrice除税价
			unitPrice.push(item.unitPrice);
			unitSellPrice.push(item.unitSellingPrice);
		});
		let unitPriceTotal = unitPrice.length > 0 ? unitPrice.reduce(function (temp, next, index) {
			return temp + next;
		}) : null;
		let unitSellPriceTotal = unitSellPrice.length > 0 ? unitSellPrice.reduce(function (temp, next, index) {
			return temp + next;
		}) : null;
		this.setState({
			maxMin: {
				avgNo: parseFloat(unitSellPriceTotal / unitSellPrice.length).toFixed(1),
				avgYes: parseFloat(unitPriceTotal / unitPrice.length).toFixed(1),
				maxNo: Math.max.apply(null, unitSellPrice),
				maxYes: Math.max.apply(null, unitPrice),
				minNo: Math.min.apply(null, unitSellPrice),
				minYes: Math.min.apply(null, unitPrice),
			}
		}, () => {
			this.getOption()
		})
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	/**
	 * 子组件中调用,显示对应的提示框
	 * */
	showTipOfInquiry = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	render() {
		return (
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" menuIndex={'price'}>
				<section className="page-content-wrapper bg-white mt2">
					<div className="h0 prl3 ptb2" style={{borderBottom: 'solid 1px #e6e6e6'}}>{this.state.materialPrice.materialName}</div>
					<aside className="price-detail-wrapper">
						<div className="price-detail-info">
							<h5><span className="text-muted">本期除税单价：</span><span>{this.state.materialPrice.unitSellingPrice}</span></h5>
							<h5 className="mt2"><span className="text-muted">本期含税单价：</span><span>{this.state.materialPrice.unitPrice}</span></h5>
							<h5 className="mt2"><span className="text-muted">计量单位 ：</span><span>{this.state.materialPrice.measureUnit}</span></h5>
							<h5 className="mt2"><span className="text-muted">增值税率 ：</span><span>{this.state.materialPrice.vatRates}</span></h5>
							<h5 className="mt2"><span className="text-muted">规格 ：</span><span>{this.state.materialPrice.specification}</span></h5>
						</div>
						<div className="prl4 price-detail-chart">
							<Row className="mt3">
								<Col span={12} className="h1"><b>价格走势图</b></Col>
								<Col span={12} className="text-right">
									{/*<MonthPicker disabledDate={this.disabledDate} onChange={this.onStartTimeChange} placeholder="选择开始月份" />*/}
									<MonthPicker disabledDate={this.disabledDate} onChange={this.onStartTimeChange} placeholder="选择开始月份" />
									<span className="prl1">-</span>
									<MonthPicker disabledDate={this.disabledDate} onChange={this.onEndTimeChange} placeholder="选择结束月份" />
									{/*<MonthPicker disabledDate={this.disabledDate} onChange={this.onEndTimeChange} placeholder="选择结束月份" />*/}
								</Col>
							</Row>
							<ReactEcharts
								option={this.state.option}
								style={{height: '350px', width: '100%'}}
								className='mt3' />
							<table className="tb-price-detail">
								<tbody>
								<tr>
									<th>价格类型</th>
									<th>峰值</th>
									<th>谷值</th>
									<th>平均值</th>
								</tr>
								<tr>
									<td>除税价</td>
									<td>{this.state.maxMin.maxNo}</td>
									<td>{this.state.maxMin.minNo}</td>
									<td>{this.state.maxMin.avgNo}</td>
								</tr>
								<tr>
									<td>含税价</td>
									<td>{this.state.maxMin.maxYes}</td>
									<td>{this.state.maxMin.minYes}</td>
									<td>{this.state.maxMin.avgYes}</td>
								</tr>
								</tbody>
							</table>
						</div>
					</aside>
				</section>
			</Layout>
		)
	}
}

export default withRouter(PriceDetail)
