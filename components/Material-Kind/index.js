import React, {Fragment} from 'react'
import Link from 'next/link'
import {getMaterialClassByIndex} from 'server'
import {Icon, message} from 'antd';
import './style.less'
import {iconUrl} from '../../config/evn';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			curId: '',
			typeList: [],//所有分类列表
			height: '480',//左侧面板的实际高度
		}
	}

	componentDidMount() {
		getMaterialClassByIndex().then(res => {
			this.setState({
				typeList: res.data,
			})
		}).catch(error => {
			message.error(error)
		})
	}

	setId(id) {
		this.setState({curId: id + 1})
	}

	render() {
		const {curId} = this.state;
		const typeList = this.state.typeList.map((item, index) => {
			return (
				<div className="material-bd-list" key={index} onMouseEnter={() => this.setId(index)}>
					{
						item.list.map((subItem, subIndex) => {
							return (
								<Fragment key={subIndex}>
									{
										subItem.smallIcon ?
											<IconFont type={subItem.smallIcon} className="text-muted h3" style={{marginRight: '9px', verticalAlign: 'text-bottom'}} />
											:
											null
									}
									<span className="firstName h5" key={subIndex}>
										<a href={`/search/material?typeId=1${subItem.oneId}`} target="_blank">{subItem.oneName}</a>
										{
											subIndex < item.list.length - 1 ?
												<i style={{padding: '0 5px'}}>|</i>
												:
												null
										}
									</span>
								</Fragment>
							)
						})
					}
				</div>
			)
		});
		const detailData = this.state.typeList.filter((item, index) => index + 1 === curId)[0] || [];
		return (
			<aside className="material-typelist-wrapper" onMouseLeave={() => this.setState({curId: ''})}>
				{typeList}
				<div className={`toggle-panel ${curId ? '' : 'hide'}`}>
					{
						detailData && detailData.twoList && detailData.twoList.map((item, index) => {
							return (
								<ul key={index}>
									<li>
										<span className="title">
											<a className="subName" href={`/search/material?typeId=2${item.twoId}`} target="_blank"><b>{item.twoName}</b></a>
										</span>
										<span>
											{
												item.list.map((subItem, key) => {
													return <a href={`/search/material?typeId=3${subItem.threeId}`} className="sub-item" key={key}
													          target="_blank">{subItem.threeName}</a>
												})
											}
										</span>
									</li>
								</ul>
							)
						})
					}
				</div>
			</aside>
		)
	}
}
