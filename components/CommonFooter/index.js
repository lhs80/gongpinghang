import React from 'react'
import {Layout} from 'antd'
import './style.less'

const {Footer} = Layout;

export default class CommonFooter extends React.Component {
	render() {
		return (
			<Footer className="page-foot">
				<aside className="page-foot-wrapper">
					<div className="page-foot-link">
						{/*<Link to={""} target="_blank">关于我们</Link>*/}
						{/*<Link to={""} target="_blank">法律声明</Link>*/}
						{/*<Link to={""} target="_blank">广告服务</Link>*/}
						{/*<Link to={""} target="_blank">诚聘英才</Link>*/}
						{/*<Link to={""} target="_blank">联系我们</Link>*/}
						{/*<Link to={""} target="_blank">意见反馈</Link>*/}
						{/*<Link to={""} target="_blank">帮助中心</Link>*/}
					</div>
					<h5 className="text-center text-secondary mt1">Copyright ©
                        中卅（苏州）信息科技有限公司&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                        <a href="http://www.beian.miit.gov.cn" className={'text-secondary'} target="_blank" >苏ICP备19052780号</a>
					</h5>
					<div className="page-footer-ewm">
						<span className=" iconfont icon-wechat" />
						<span className=" iconfont icon-download" />
					</div>
				</aside>
			</Footer>
		)
	}
}
