import React, {Component, Fragment} from 'react';
import {Carousel, Icon, message} from 'antd';
import {baseUrl, iconUrl} from 'config/evn';
import {otherWatchFun} from 'server';
import cookie from 'react-cookies';
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class AdvProductRight extends Component {
	constructor(props) {
		super(props);
		this.state = {
			productList: [],
			currentImageUrl: ''
		}
	}

	componentDidMount() {
		new Swiper('.adv-swiper-container', {
			observer: true,
			direction: 'vertical',
			spaceBetween: 12,
			slidesPerView: 3,
			slidesPerGroup: 3,
			navigation: {
				nextEl: '.adv-button-next',
				prevEl: '.adv-button-prev',
			},
		});
		this.getProductList();
	}

	componentDidUpdate(nextProps) {
		if (nextProps.pid !== this.props.pid) {
			this.getProductList();
		}
	}

	getProductList = () => {
		if (this.props.pid) {
			let params = {
				productId: this.props.pid
			};
			otherWatchFun(params).then(res => {
				this.setState({
					productList: res.data
				});
			}).catch(error => {
				message.error(error)
			})
		}
	};

	render() {
		const {productList} = this.state;
		const thumbnails =
			productList.map((item, index) => {
				return (
					<div key={index} className="swiper-slide">
						<a href={`/material/detail?id=${item.productId}`} target="_blank">
							<div className="img"><img src={baseUrl + item.image.split(',')[0]} alt="" /></div>
						</a>
						{/*<h6 className="price"><i>￥{item.price}</i></h6>*/}
						<h6 className="price">
							<small>{item && item.price < 0 ? '' : '￥'}</small>
							<i>{item && item.price < 0 ? '待询价' : item.price}</i>
						</h6>
					</div>
				)
			});
		return (
			<Fragment>
				<div className="ald-skuRight">
					<h6 className="text-muted mt1">—其他人还在看—</h6>
					<Carousel className="mt1" dots={false} rows={3} arrows={true}>
						{thumbnails}
					</Carousel>
				</div>
			</Fragment>
		);
	}
}

export default AdvProductRight;
