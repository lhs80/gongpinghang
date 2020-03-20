import React from 'react'
import {Layout} from 'antd'
import './style.less'

const {Footer} = Layout;

export default class CommonFooter extends React.Component {
	render() {
		return (
			<Footer className="page-foot">
				<aside className="page-foot-wrapper">
					<h5 className="text-center text-secondary mt1">
						<a href="http://www.beian.miit.gov.cn" target="_blank" className='text-secondary prl1'>苏ICP备19067992号</a>
						Copyright © 中卅网络科技（苏州）有限公司
						{/*Copyright © 中卅（苏州）信息科技有限公司&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;*/}
						{/*<a href="http://www.beian.miit.gov.cn" target="_blank" className={'text-secondary'}>苏ICP备19052780号</a>*/}
					</h5>
					{/*<div className="page-footer-ewm">*/}
					{/*<span className="iconfont icon-wechat" />*/}
					{/*<span className="iconfont icon-download" />*/}
					{/*</div>*/}
				</aside>
			</Footer>
		)
	}
}
