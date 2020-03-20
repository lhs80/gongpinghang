// 我的进货单
import React, {Component, Fragment} from 'react';
import './style.less'

export default class CartHome extends Component {
	constructor(props) {
		super(props);
		this.imgObj = React.createRef();
		this.imgMask = React.createRef();
		this.bigImageObj = React.createRef();
	}

	componentDidMount() {
		this.imgObj.current.addEventListener('mousemove', (e) => this.onMouseOver(e))
	}

	onMouseOver = (event) => {
		let imgMask = this.imgMask.current;
		let imgObj = this.imgObj.current;
		let bigImageObj = this.bigImageObj.current;
		let x = event.clientX - (imgObj.offsetParent.offsetLeft + imgObj.offsetLeft);//减去元素相对于窗口的X轴距离
		let y = event.clientY - (imgObj.offsetParent.offsetTop + imgObj.offsetTop);//减去元素相对于窗口的Y轴距离
		if (x - imgMask.offsetWidth / 2 >= 0 && x + imgMask.offsetWidth / 2 <= imgObj.offsetWidth) {
			imgMask.style.left = (x - imgMask.offsetWidth / 2) + 'px';
			bigImageObj.style.left = -((x - imgMask.offsetWidth / 2) * 2.1) + 'px';
		}

		if (y - imgMask.offsetHeight / 2 >= 0 && y + imgMask.offsetHeight / 2 <= imgObj.offsetHeight) {
			imgMask.style.top = (y - imgMask.offsetHeight / 2) + 'px';
			bigImageObj.style.top = -((y - imgMask.offsetHeight / 2) * 2.05) + 'px';
		}
	};

	render() {
		const {imageUrl} = this.props;
		return (
			<Fragment>
				<div className="ks-image" ref={this.imgObj}>
					<img src={imageUrl} alt="" width="100%" />
					<span className="ks-imagezoom-lens" ref={this.imgMask} style={{background: '../../static/images/defaultHead.png'}} />
				</div>
				<div className="ks-overlay ks-imagezoom-viewer ks-overlay-hidden">
					<div className="ks-overlay-content">
						<img src={imageUrl} ref={this.bigImageObj} />
					</div>
				</div>
			</Fragment>
		);
	}
}
