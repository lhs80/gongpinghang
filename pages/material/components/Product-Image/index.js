import React, {Component, Fragment} from 'react';
import {Icon, Carousel} from 'antd';
import {baseUrl, iconUrl} from 'config/evn';
import cookie from 'react-cookies';
import 'swiper/dist/css/swiper.min.css'
import './style.less'
import ZoomImage from 'components/ZoomImage/'
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ProductImageIndex extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentImageUrl: '',
			imgArray: [],
			sliderSetting: {
				speed: 800,
				dots: false,
				slidesToShow: 5,
				arrows: true,
				slidesToScroll: 1
			}
		}
	}

	componentDidUpdate(nextProps) {
		if (nextProps.image !== this.props.image) {
			this.setState({
				currentImageUrl: this.props.image.split(',')[0],
				imgArray: this.props.image.split(',')
			});
		}
	}


	/**
	 * 查看大看
	 * */
	changeCurrentImage(url, index) {
		this.setState({
			currentImageUrl: url
		})
	}

	render() {
		const {currentImageUrl, sliderSetting} = this.state;
		const thumbnails =
			this.state.imgArray.map((item, index) => {
				return (
					<img src={baseUrl + item} key={index} alt="" onMouseOver={() => this.changeCurrentImage(item, index)} height="52px" />
				)
			});
		return (
			<Fragment>
				<div className="material-detail-img">
					<ZoomImage imageUrl={baseUrl + currentImageUrl}/>
					{/*<img className="swiper-slide" src={baseUrl + currentImageUrl} alt="" />*/}
				</div>
				<div className="product-image-thunbnail mt2">
					<Carousel {...sliderSetting}>
						{thumbnails}
					</Carousel>
				</div>
			</Fragment>

		);
	}
}

export default ProductImageIndex;
