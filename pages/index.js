import React from 'react';
import Layout from 'components/Layout/index';
import Banner from './home/components/Banner/'
import Recommend from './home/components/Recommend/'
import Login from './home/components/Login/'
import MaterialType from 'components/Material-Kind/'
import TypeCard from './home/components/TypeCard/'
import FixedTool from 'components/FixedTool/'
import LeftBar from './home/components/LeftBar'
import './home/style/index.less'

class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLeftBar: false,
			showGoTop: false,
			curFloor: 'floot1',
			controlSearchSuggest: false
		}
	}

	componentDidMount() {
		this.watchLeftBar();
		document.addEventListener('click', () => {
			this.setState({
				controlSearchSuggest: false
			})
		})
	}

	//返回顶部
	goToTop = () => {
		let timer = null;
		timer = setInterval(() => {
			//获取滚动条的滚动高度
			let osTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			let speed = Math.floor(-osTop / 6);
			if (document.documentElement.scrollTop > 0)
				document.documentElement.scrollTop = document.body.scrollTop = osTop + speed;
			else
				clearInterval(timer)
		}, 10)
	};

	//监听页面滚动，控制左侧楼层菜单和右侧返回顶部显示隐藏
	watchLeftBar = () => {
		window.addEventListener('scroll', () => {
			//滚动条当前距顶部的距离
			let scrollTopValue = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			//窗口可视区域高度
			let heightValue = document.body.clientHeight;
			//滚动条的高度
			let scrollHeight = document.body.scrollHeight;

			//左侧菜单栏
			if ((scrollTopValue + 300 > heightValue) && (scrollTopValue < scrollHeight - 1000)) {
				this.setState({
					showLeftBar: true
				})
			} else {
				this.setState({
					showLeftBar: false
				})
			}

			//右侧返回顶部
			if (scrollTopValue > heightValue) {
				this.setState({
					showGoTop: true
				})
			} else {
				this.setState({
					showGoTop: false
				})
			}
			//监听楼层变化
			for (let i = 1; i < 7; i++) {
				if (document.getElementById('floor' + i) && document.getElementById('floor' + i).offsetTop + 350 >= scrollTopValue) {
					this.setState({
						curFloor: 'floor' + i
					});
					break;
				}
			}
		});
	};

	render() {
		const {showLeftBar, showGoTop, curFloor, controlSearchSuggest} = this.state;
		return (
			<Layout title='工品行 – 采购工业品上工品行' menuIndex={'home'} isHome={true} controlSearchSuggest={controlSearchSuggest}>
				<section className="page-content">
					<section className="screen-outer">
						<aside className='left'>
							<MaterialType />
						</aside>
						<aside className="main">
							<div className="top">
								{/*轮播图*/}
								<Banner />
							</div>
						</aside>
						<aside className="right">
							{/*登录*/}
							<Login />
						</aside>
					</section>
					{/*广告位*/}
					<Recommend />
					<TypeCard />
					<LeftBar showBar={showLeftBar} goToTop={this.goToTop} curFloot={curFloor} />
					{/*右侧菜单栏*/}
					<FixedTool goToTop={this.goToTop} type={1} showGoTop={showGoTop} />
				</section>
			</Layout>
		);
	}
}

Index.propTypes = {};

export default Index;
