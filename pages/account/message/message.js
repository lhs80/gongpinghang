// 用户中心会话消息
import React,{Fragment} from 'react'
import Layout from 'components/Layout/message'
import {List, Icon, Avatar, Row, Col, Badge,Divider} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {timestampToTime, userCodeFun} from 'server'
import cookie from 'react-cookies';
//const SDK = require('components/im/js/NIM_Web_SDK_v5.6.0');
// import ImInfo from 'components/ImInfo'
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
	loading: () => (<p>加载中...</p>)
});
//import SDK from 'components/im/js/NIM_Web_SDK_v5.6.0'
import {emojiList, pinupList, emojiArr, buildEmoji, $escape} from 'components/im/configs/emoji'


const {Content} = Layout;
export default class SessionMessage extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			sessionList: [],
			showConnect: 'none',//显示聊天框
			to: '',
			loginInfo: {},
			accounts: [],
			userInfo: [],
			messageData: [],
			nim: {},
			otherInfo: {},
			newsTotal: 0
		};
	}

	//云信集成SDK
	initNimSdk = (state, loginInfo) => {
		const data = {};
		if (state.nim) {
			state.nim.disconnect();
		}
		// //console.log("showConnect",this.state);
		if (!cookie.load('ZjsWeb')) {
			window.location.href = '/login';
			return;
		}
		window.nim = state.nim = SDK.NIM.getInstance({
			//公司
			appKey: '2bae53e4c277b3b65df7c2aa71675cb7',
			account: loginInfo.uid,
			token: loginInfo.sdktoken,
			debug: false,
			//连接成功
			onconnect: onConnet.bind(this),
			getLocalSessions: function (session) {

			},
			//连接失败
			onerror: function (event) {
				//console.log('SDK会话消息 连接断开')
			},
			ondisconnect: function (error) {//连接断开
				//console.log('SDK会话消息手动连接断开')
			},
			// // 会话
			onsessions: onSessions.bind(this),
			onupdatesession: onUpdateSession.bind(this),
			onofflinemsgs: saveMsgs.bind(this),
		});

		function onConnet(event) {
			let self = this;
			if (self.state.loginInfo) {
				//console.log("会话sdk连接成功");
				self.setState({
					nim: this.nim
				});
			}
		}

		function onSessions(sessions) {
			let id = sessions.id || '';
			let msg = JSON.parse(localStorage.getItem(id)) || [];
			for (let i  in sessions) {
				msg.push(sessions[i].lastMsg);
			}
			localStorage.setItem(id, JSON.stringify(msg));
		}

		function onUpdateSession(session) {
			let self = this;
			//存的名字时id(userCode)唯一性
			let id = session.id || '';
			//console.log("消息中心会话更新", session);
			let old = JSON.parse(localStorage.getItem(id)) || [];
			//以备会话消息用
			let oldAllMessage = JSON.parse(localStorage.getItem(this.userCode)) || [];
			//console.log("缓存的oldAllMessage",oldAllMessage);
			let msg = session.lastMsg;
			if (msg.status === 'success' && msg.time !== session.msgReceiptTime) {
				old.push(msg);
				oldAllMessage.push(msg);
			}
			//把消息以id缓存起来以备会话消息用
			localStorage.setItem(id, JSON.stringify(old));
			localStorage.setItem(this.userCode, JSON.stringify(oldAllMessage));
			self.updateInfo(session, oldAllMessage);
		}

		function saveMsgs(session) {
			//console.log("消息中心离线消息", session)
			//存的名字时id(userCode)唯一性
			let id = session.to || '';
			let old = JSON.parse(localStorage.getItem('p2p-' + id)) || [];
			//以备会话消息用
			let oldAllMessage = JSON.parse(localStorage.getItem(this.userCode)) || [];
			let msg = session.msgs;
			if (msg[0].status === 'success') {
				old = old.concat(msg);
				oldAllMessage = oldAllMessage.concat(msg);
				if (id === this.props.userCode) {
					this.setState({
						sessionList: old,
					});
				}
			}
			//把消息以id缓存起来以备会话消息用
			localStorage.setItem('p2p-' + id, JSON.stringify(old));
			localStorage.setItem(this.userCode, JSON.stringify(oldAllMessage));
			let self = this;
			self.updateInfo(session, oldAllMessage, 1);
		}

	};

	componentDidMount() {
		//console.log("SDK",SDK)
		this.sessionData();
		this.getUserInfo();
	}

	componentWillUnmount = () => {
		//登出云信
		// this.nim.disconnect();
	};
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					token: res.data.neteaseToken,
					headUrl: res.data.headUrl,
					loginInfo: {
						uid: this.userCode,
						sdktoken: res.data.neteaseToken,
					}
				}, () => {
					this.initNimSdk(this, this.state.loginInfo)
				});
			}
		});
	};
	/*----绘话消息及时更新---*/
	updateInfo = (session, oldAllMessage, type) => {
		//console.log("方法",session)
		let self = this;
		let info = {
			account: session.to,
			done: function getUserDone(error, user) {
				if (!error) {
					let userAllInfo = JSON.parse(window.localStorage.getItem('userAllInfo')) || [];
					let code = '';
					if (type === 1) {
						code = session.sessionId.substr(4, session.sessionId.length - 1)
					} else {
						code = session.id.substr(4, session.id.length - 1)
					}
					let userInfo = {
						userCode: code,
						info: {
							avatar: user.avatar,
							nick: user.nick
						}
					};
					userAllInfo.push(userInfo);
					//把每个聊过的对方的头像与昵称存起来，以备会话消息里用
					window.localStorage.setItem('userAllInfo', JSON.stringify(userAllInfo));
					self.setState({
						userInfo: user
					}, () => {
						let sessionMessage = oldAllMessage.reverse() || [];
						let userInfo = [];
						let messageData = [];
						let sessionlistData = {};
						//把to所有的数据放在一个数组内
						for (let i = 0; i < sessionMessage.length; i++) {
							let sessionItem = sessionMessage[i];
							if (!sessionlistData[sessionItem.sessionId] && localStorage.getItem(sessionItem.sessionId)) {
								messageData.push({
									to: sessionItem.to,
									sessionId: sessionItem.sessionId,
									data: [sessionItem]
								});
								sessionlistData[sessionItem.sessionId] = sessionItem;
							} else {
								for (let j = 0; j < messageData.length; j++) {
									let dj = messageData[j];
									if (dj.sessionId === sessionItem.sessionId) {
										dj.data.push(sessionItem);
										break;
									}
								}
							}
						}
						Object.keys(messageData).forEach((item) => {
							let id = messageData[item].sessionId ? messageData[item].sessionId : '';
							userAllInfo.findIndex(v => {
								if (v.userCode === id.substr(4, id.length - 1)) {
									messageData[item].userInfo = v.info;
									//标记已读
									messageData[item].data = JSON.parse(localStorage.getItem(id)).reverse()
								}
							})
						});
						self.setState({
							sessionList: messageData
						}, () => {
							self.getLen(self, self.state.sessionList)
						});

					})
				}
			}
		};
		this.nim.getUser(info);
	};
	/*-----会话消息缓存的处理-----*/
	sessionData = () => {
		let sessionMessage = JSON.parse(localStorage.getItem(this.userCode)) ? JSON.parse(localStorage.getItem(this.userCode)).reverse() : [];
		//所有的聊天消息的名字与头像
		let userInfo = JSON.parse(localStorage.getItem('userAllInfo')) || [];
		let sessionlistData = {};
		let messageData = [];
		let accounts = []
		//把to所有的数据放在一个数组内
		for (let i = 0; i < sessionMessage.length; i++) {
			let sessionItem = sessionMessage[i];
			let sessionId = '';
			if (!sessionlistData[sessionItem.sessionId] && localStorage.getItem(sessionItem.sessionId)) {
				messageData.push({
					to: sessionItem.to,
					sessionId: sessionItem.sessionId,
					//标识已读
					data: [sessionItem]
				});
				sessionlistData[sessionItem.sessionId] = sessionItem;
			} else {
				for (let j = 0; j < messageData.length; j++) {
					let dj = messageData[j];
					if (dj.sessionId === sessionItem.sessionId) {
						dj.data.push(sessionItem);
						break;
					}
				}
			}
		}
		this.setState({
			messageData: messageData,
		});
		Object.keys(messageData).forEach((item) => {
			let id = messageData[item].sessionId ? messageData[item].sessionId : '';
			userInfo.findIndex(v => {
				if (v.userCode === id.substr(4, id.length - 1)) {
					messageData[item].userInfo = v.info;
					//标记已读
					messageData[item].data = JSON.parse(localStorage.getItem(id)).reverse();
				}
			})
		});
		this.setState({
			sessionList: messageData
		}, () => {
			this.getLen(this, this.state.sessionList)
		});
	};
	/*----显示聊天框----*/
	showImInfo = (item) => {
		let id = item.sessionId.substring(4, item.sessionId.length);
		const {sessionList} = this.state;
		//打开组件聊天框把标记的消息对应上去
		let data = JSON.parse(localStorage.getItem(item.sessionId)).reverse();
		this.setState({
			to: id,
			showConnect: 'block',
			otherInfo: {
				nick: item.userInfo.nick,
				avatar: item.userInfo.avatar
			}
		}, () => {
			Object.keys(data).forEach((item) => {
				data[item].isRead = 1
			});
			Object.keys(sessionList).forEach((list) => {
				if ((sessionList[list].sessionId).substring(4, item.sessionId.length) === id) {
					sessionList[list].data = data;
				}
			});
			this.getLen(this, this.state.sessionList);
			this.setState({
				sessionList
			})
		});
	};
	/*-----子组件请求方法，关闭聊天框----*/
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};
	/*----接收会话框传过来的数据-----*/
	connectModal = (session) => {
		let data = this.state.sessionList;
		let sessionData = [];
		sessionData.push(session);
		Object.keys(data).forEach((item) => {
			if (data[item].sessionId === sessionData[0].id) {
				data[item].data.unshift(session.lastMsg)
			}
		});
	};
	//计算未读消息的数量
	getLen = (a, list) => {
		let newsTotal = 0;
		Object.keys(list).forEach((item) => {
			let len = 0;
			let data = list[item]['data'];
			data.forEach(val => {
				if (!val['isRead']) {
					len += 1
				}
			});
			list[item].len = len;
			newsTotal += len;
		});
		a.setState({
			sessionList: list,
			newsTotal
		})
	};
	//删除会话消息
	deleNews = (item) => {
		let sessionData = JSON.parse(localStorage.getItem(this.userCode));
		let data = sessionData.filter(list => list.sessionId !== item.sessionId);
		localStorage.removeItem(item.sessionId);
		localStorage.setItem(this.userCode, JSON.stringify(data.reverse()));
		this.sessionData();
	};

	render() {
		return (
			<section className="bg-white" style={{paddingBottom: '40px'}}>
				<p style={{
					borderBottom: '1px solid #e6e6e6',
					margin: '0',
					paddingLeft: '34px',
					lineHeight: '60px'
				}} className="h4">会话消息</p>

				{
					this.state.sessionList.length > 0 ?
						this.state.sessionList.map((item, index) => {
							return (
								<div key={index} className="prl3">
									{
										(() => {
											if (item.userInfo) {
												return (
													<Fragment>
														<Row style={{width: '100%'}} type='flex' align='middle'>
															<Col span={20} className="material-detail p1">
																<div onClick={() => this.showImInfo(item)}>
																	<Badge count={item.len}>
																		<Avatar size={50}
																		        src={item.userInfo.avatar} />
																	</Badge>
																</div>
																<div className="material-detail-info" onClick={() => this.showImInfo(item)}>
																	<p>
																		<span className="text-muted" style={{marginRight: '30px'}}>{item.userInfo.nick}</span>
																		<span className="text-muted">{timestampToTime(item.data[0].time)}</span>
																	</p>
																	{
																		(() => {
																			if (item.data[0].type === 'text') {
																				return (
																					<div dangerouslySetInnerHTML={{__html: buildEmoji(item.data[0].text)}} />
																				)
																			}
																		})()
																	}
																	{
																		item.data[0].type === 'image' ?
																			<span
																				className="mt1 text-darkgrey h5"
																				style={{
																					width: '80%',
																					lineHeight: '1.2'
																				}}>
                                      [图片]
                                  </span>
																			: null
																	}
																	{
																		item.data[0].type === 'file' ?
																			<span
																				className="mt1 text-darkgrey h5"
																				style={{
																					width: '80%',
																					lineHeight: '1.2'
																				}}>
                                                                                        [文件]
                                                                                    </span>
																			: null
																	}
																</div>
															</Col>
															<Col span={4} className="text-right">
																<a className="text-info sessionDel" onClick={() => this.deleNews(item)}>删除</a>
															</Col>
														</Row>
														<Divider />
													</Fragment>
												)
											}
										})()
									}
								</div>
							)
						})
						:
						<div className="text-center mt2" style={{marginBottom: '46px'}}>
                                            <span className="show">
                                                <img src={'/static/images/icon-nodata.png'} alt="" />
                                            </span>
							<p style={{marginTop: '16px', color: 'rgba(0,0,0,.45)'}}>暂无数据</p>
						</div>
				}
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.to} closeModal={this.closeModal} nim={this.state.nim}
				        sessionContent={this.connectModal} info={this.state.otherInfo} />
			</section>
		)
	}
}
