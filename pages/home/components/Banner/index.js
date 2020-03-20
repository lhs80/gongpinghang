import React from 'react'
import './style.less'
import {Carousel, message} from 'antd';
import {
	bannerListFun,//banner
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'

export default class Banner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			banners: []
		}
	}

	componentDidMount() {
		this.queryBannerList();
	}

	/**
	 * 轮播图
	 * */
	queryBannerList = () => {
		let params = {
			typeId: 1
		};
		bannerListFun(params).then(res => {
			this.setState({
				banners: res.data
			})
		}).catch(error => {
			message.error(error);
		})
	};

	render() {
		// banner图片列表
		const banners = this.state.banners.map((item, index) => {
			if (item.url && item.url !== '#') {
				return (
					<a href={item.url} key={index} className="block" target="_blank">
						<img src={baseUrl + item.img} alt="" style={{width: '100%', height: '400px'}} />
					</a>
				)
			} else {
				return (
					<img src={baseUrl + item.img} key={index} alt="" style={{width: '100%', height: '400px'}} />
				)
			}
		});
		return (
			<aside className="material-carousel">
				<Carousel arrows={true} autoplay={true}>
					{banners}
				</Carousel>
			</aside>
		)
	}
};
