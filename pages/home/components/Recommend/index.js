import React from 'react'
import './style.less'
import {Avatar, message} from 'antd';
import {bannerListFun, queryRecommendShopFun} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
import Link from 'next/link';

export default class Banner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			recommendShop: []
		}
	}

	componentDidMount() {
		this.queryRecommendShop();
	}

	/**
	 * 推荐商家
	 * */
	// queryRecommendShop() {
	//   queryRecommendShopFun().then(res => {
	//     this.setState({
	//       recommendShop: res.data
	//     })
	//   }).catch(error => {
	//     message.error(error)
	//   })
	// }
	queryRecommendShop() {
		let params = {
			typeId: 3
		};
		bannerListFun(params).then(res => {
			this.setState({
				banners: res.data
			})
		}).catch(error => {
			message.error(error);
		})
	}


	render() {
		const {banners} = this.state;
		return (
			<ul className="material-recommend-shop">
				{
					banners && banners.map((item, index) => {
						if (index <= 5) {
							return (
								<li key={index} className="item">
									<a href={item.url} target="_blank"><img src={baseUrl + item.img} alt="" width="230" /></a>
								</li>
							)
						}
					})
				}
			</ul>
		)
	}
};
