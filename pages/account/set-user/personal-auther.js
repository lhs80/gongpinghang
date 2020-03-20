// 个人认证成功显示的信息
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Avatar} from 'antd';
import cookie from 'react-cookies';
import {iconUrl, baseUrl} from 'config/evn'
import {certificationInfoFun, userCodeFun} from 'server'
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class PersonalAuth extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null;
		this.state = {
			imgUrl: '',
			name: '',
			userID: '',
			code: '',
			sex: '',
			birthday: '',
		}
	}

	componentDidMount() {
		this.getUserInfo();
		this.getCertificationInfo()
	}

	getUserInfo = () => {
		/*----获取用户头像-----*/
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					imgUrl: res.data.headUrl
				})
			}
		})
	};
	getCertificationInfo = () => {
		/*---获取认证信息---*/
		certificationInfoFun(this.userCode).then(res => {
			if (res.result === 'success') {
				let name = res.data.name;
				name = name.substring(0, 1);
				this.setState({
					name: name + '**',
					userID: res.data.idNumber,
					code: res.data.userCode,
					sex: res.data.sex,
					//birthday:res.data.birthday,
				})
			}
		});
	};

	render() {
		const {imgUrl, name, userID, code, sex, birthday} = this.state;
		return (
			<Layout title="个人认证成功" mainMenuIndex={'setting'} menuIndex={'5'}>
				<section className="bg-white" style={{paddingTop: '80px', height: '766px'}}>
					<p style={{paddingLeft: '100px'}} className="h1 text-grey">个人认证</p>
					<section className="personalAuth personalAuthMenu">
						<p className="personalHead" />
						<div className="personalMenu mt4">
                                        <span className="personalMenuL text-center">
                                            {
	                                            imgUrl
		                                            ? <img src={baseUrl + imgUrl} alt="" />
		                                            : <Avatar src="/static/images/default-header.png" size={100} />
                                            }
                                        </span>
							<IconFont type="iconfont-yirenzheng" className="infoAuther" />
							<div className="personalMenuR">
								<div className="curLine">
									<IconFont type="iconfont-geren" className="infoRight" />
									<span className="text-grey">{name}</span><span style={{marginLeft: '8px'}} className="text-grey">{sex}</span>
								</div>
								{/* <div className="curLine">
                                                <IconFont type="iconfont-rili" className="infoRight"/>
                                                <span className="text-grey">{birthday}</span>
                                            </div>*/}
								<div className="curLine">
									<IconFont type="iconfont-shenfenzheng" className="infoRight" />
									<span className="text-grey">{userID}</span>
								</div>
								<div className="curLine">
									<IconFont type="iconfont-yinhangqia" className="infoRight" />
									<span className="text-grey">{code}</span>
								</div>
							</div>
						</div>
					</section>
				</section>
			</Layout>
		)
	}
}
