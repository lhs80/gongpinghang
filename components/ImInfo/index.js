/*-------聊天弹窗----*/
import React from 'react'
import {Icon, Input, Button, message} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {imgReg, srcReg} from 'config/regular'

//const SDK = require('../im/js/NIM_Web_SDK_v5.6.0');
import Draggable from 'react-draggable'
import {emojiList, pinupList, emojiArr, buildEmoji, $escape} from '../im/configs/emoji'
import {timestampToTime, userCodeFun, getSellerFun} from 'server'
import cookie from 'react-cookies';
import './style.less'
import pageUtil from '../im/configs/chartHeight'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ConnectAlert extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			token: '',
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			headUrl: '',
			//表情包
			emojiShow: 'none',
			emojiArr: emojiArr,
			//发送内容
			msgToSent: '',
			meSendContent: [],
			SendContent: [],
			dragger: false,
			getHistory: '更多历史记录',
			showMore: 'block',
			/*----对方的userCode--(联系卖家的userCode)--*/
			to: this.props.userCode,
			buyHeadUrl: '',
			buyNickName: '',
			sessionData: [],
			lastTime: '',
			success: false,
			loginInfo: {}
		}
	}

	//云信集成SDK
	initNimSdk = (state, loginInfo) => {
		const data = {};
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
				console.log('SDK组件连接断开')
			},
			/*ondisconnect: function (error) {//连接断开
					console.log('SDK组件手动连接断开')
			},*/
			ondisconnect: onDisconnect.bind(this),
			// // 会话
			onsessions: onSessions.bind(this),
			onupdatesession: onUpdateSession.bind(this),
			onofflinemsgs: saveMsgs.bind(this),
		});

		//手动断开连接
		function onDisconnect(event) {
			let self = this;
			self.setState({
				loginInfo: {},
			});
			console.log('SDK组件手动连接断开')
		}

		function onConnet(event) {
			if (this.state.loginInfo) {
				console.log('sdk组件连接成功');
				let self = this;
				let userAllInfo = JSON.parse(window.localStorage.getItem('userAllInfo')) || [];
				let userCode = this.props.userCode;
				cookie.save('imInfoSuccess', 'success');
				let info = {
					account: this.props.userCode,
					done: function getUserDone(error, user) {
						if (!error) {
							let userInfo = {
								userCode: userCode,
								info: {
									avatar: user.avatar,
									nick: user.nick
								}
							};
							userAllInfo.push(userInfo);
							self.setState({
								buyHeadUrl: user.avatar,
								buyNickName: user.nick
							});
							//把每个聊过的对方的头像与昵称存起来，以备会话消息里用
							window.localStorage.setItem('userAllInfo', JSON.stringify(userAllInfo));
						}
					}
				};
				this.nim.getUser(info);
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
			//存的名字时id(userCode)唯一性
			let myMessage = [];
			let id = session.id || '';
			/*nim.sendMsgReceipt({
					msg: session.lastMsg,
					done: sendMsgReceiptDone
			});
			function sendMsgReceiptDone(error, obj) {
					console.log('发送消息已读回执' + (!error?'成功':'失败'), error, obj);
			}*/
			console.log('会话更新', session);
			let old = JSON.parse(localStorage.getItem(id)) || [];
			//以备会话消息用
			let oldAllMessage = JSON.parse(localStorage.getItem(this.state.userCode)) || [];
			let msg = session.lastMsg;
			if (msg.status === 'success' && msg.time !== session.msgReceiptTime) {
				old.push(msg);
				oldAllMessage.push(msg);
				if (this.props.nim) {
					this.props.sessionContent(session)
				}
				Object.keys(old).forEach((list) => {
					if ((old[list].flow === 'out' && old[list].from === this.state.userCode) || (old[list].flow === 'in' && old[list].to === this.state.userCode)) {
						myMessage.push(old[list])
					}
				});
				this.setState({
					meSendContent: myMessage
				})
			} else if (msg.status === 'fail') {
				message.error('发送失败')
			}
			//把消息以id缓存起来以备会话消息用
			localStorage.setItem(id, JSON.stringify(old));
			localStorage.setItem(this.state.userCode, JSON.stringify(oldAllMessage));

		}

		function saveMsgs(session) {
			//console.log("离线消息", session)
			//存的名字时id(userCode)唯一性
			let myMessage = [];
			let id = session.to || '';
			let old = JSON.parse(localStorage.getItem('p2p-' + id)) || [];
			//以备会话消息用
			let oldAllMessage = JSON.parse(localStorage.getItem(this.state.userCode)) || [];
			let msg = session.msgs;
			if (msg[0].status === 'success') {
				old = old.concat(msg);
				oldAllMessage = oldAllMessage.concat(msg);
				Object.keys(old).forEach((list) => {
					if ((old[list].flow === 'out' && old[list].from === this.state.userCode) || (old[list].flow === 'in' && old[list].to === this.state.userCode)) {
						myMessage.push(old[list])
					}
				});
				if (id === this.props.userCode) {
					this.setState({
						meSendContent: myMessage,
					});
				}
			}
			//把消息以id缓存起来以备会话消息用
			localStorage.setItem('p2p-' + id, JSON.stringify(old));
			localStorage.setItem(this.state.userCode, JSON.stringify(oldAllMessage));
		}

	};

	/*----关闭聊天框-----*/
	closeModal = () => {
		let sessionDataTotal = JSON.parse(window.localStorage.getItem('p2p-' + this.props.userCode));
		if (sessionDataTotal) {
			Object.keys(sessionDataTotal).forEach((item) => {
				sessionDataTotal[item].isRead = 1
			});
			localStorage.setItem('p2p-' + this.props.userCode, JSON.stringify(sessionDataTotal));
		}
		let status = 'none';
		this.props.closeModal(status);
		cookie.remove('imInfoSuccess');
		//登出云信
		if (!this.props.nim) {
			this.nim.disconnect();
		}
		this.setState({
			meSendContent: [],
			buyHeadUrl: '',
			buyNickName: '',
		})
	};
	/*-----发送消息的内容----*/
	sendChange = (e) => {
		this.setState({
			dragger: false,
			msgToSent: e.target.value
		});
	};
	/*-----点击表情icon，表情模块出来---*/
	showEmoji = () => {
		this.setState({
			emojiShow: 'block'
		})
	};
	/*----选中的表情包-----*/
	selectEmoji = (item, index) => {
		const {msgToSent} = this.state;
		let msg = msgToSent + item.key;
		this.setState({
			msgToSent: msg,
			emojiShow: 'none'
		});
	};
	/*-----点击文件icon--------*/
	showResource = () => {
		let fileToSent = document.getElementById('fileToSent');
		fileToSent.click()
	};

	componentWillReceiveProps(nextProps) {
		const {userCode} = this.state;
		//获取自己的信息
		if (nextProps.showConnect === 'block' && nextProps.showConnect !== this.props.showConnect) {
			if (nextProps.nim) {
				this.setState({
					buyHeadUrl: nextProps.info.avatar,
					buyNickName: nextProps.info.nick
				});
			}
			this.setState({
				showMore: 'block',
				getHistory: '更多历史记录'
			});
			console.log('nextProps', nextProps)
			let params = {
				userCode: this.state.userCode
			};
			userCodeFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						token: res.data.neteaseToken,
						headUrl: res.data.headUrl,
						loginInfo: {
							uid: userCode,
							sdktoken: res.data.neteaseToken,
						}
					}, () => {
						//this.initNimSdk(this, this.state.loginInfo)
						if (!this.props.nim) {
							console.log('nim', this.props)
							this.initNimSdk(this, this.state.loginInfo);
						}
					});
				}
			});
		}
		//只显示最后30条消息
		let sessionDataTotal = JSON.parse(window.localStorage.getItem('p2p-' + nextProps.userCode));
		let msg = [];
		if (sessionDataTotal && nextProps.showConnect === 'block') {
			Object.keys(sessionDataTotal).forEach((item) => {
				sessionDataTotal[item].isRead = 1;
				if ((sessionDataTotal[item].flow === 'out' && sessionDataTotal[item].from === userCode) || (sessionDataTotal[item].flow === 'in' && sessionDataTotal[item].to === userCode)) {
					msg.push(sessionDataTotal[item])
				}
			});
		}
		//打开聊天窗把每条消息设置为已读然后缓存起来以备会话消息用
		localStorage.setItem('p2p-' + nextProps.userCode, JSON.stringify(sessionDataTotal));
		this.setState({
			//meSendContent: sessionDataTotal,
			meSendContent: msg,
		});
		pageUtil.scrollChatListDown();
	}

	/*-----文件选择发送-----*/
	uploadFile = () => {
		const {meSendContent} = this.state;
		let fileInput = document.getElementById('fileToSent');
		let value = fileInput.value;
		let ext = value.substring(value.lastIndexOf('.') + 1, value.length);
		let type = /png|jpg|bmp|jpeg|gif/i.test(ext) ? 'image' : 'file';
		let self = this;
		let itemInfo = {
			scene: 'p2p',
			to: this.props.userCode,
			type: type,
			fileInput: fileInput,
			/*-----上传文件结果---*/
			uploaddone: function (error, file) {
				if (error) {
					message.error('上传失败')
				}
			},
			done: function sendMsgDone(error, msg) {
				// 此处为回调消息事件，仅仅通知开发者，消息是否发送成功
				msg.time = timestampToTime(msg.time);
				meSendContent.push(msg);
				self.setState({
					meSendContent
				});
				pageUtil.scrollChatListDown();
			}
		};
		if (this.props.nim) {
			let msg = this.props.nim.sendFile(itemInfo);
		} else {
			let msg = this.nim.sendFile(itemInfo);
		}
		// let msg = this.nim.sendFile(itemInfo);
	};
	/*----点击发送按钮-----*/
	sendTextMessage = (event) => {
		event.preventDefault();
		//console.log("发送会话消息",this.props.nim);
		const {msgToSent} = this.state;
		if (msgToSent.length > 500 || msgToSent.length === 0) {
			return false;
		} else if (!cookie.load('imInfoSuccess') && !this.props.nim) {
			message.info('加载失败');
			return false;
		} else {
			let self = this;
			let itemInfo = {
				scene: 'p2p',
				to: self.props.userCode,
				//text: buildEmoji(msgToSent),
				text: msgToSent,
				done: function sendMsgDone(error, msg) {
					let meSendContent = self.state.meSendContent;
					// 此处为回调消息事件，仅仅通知开发者，消息是否发送成功
					self.setState({
						msgToSent: '',
					});
					if (self.props.nim) {
						meSendContent.push(msg);
						self.setState({
							meSendContent
						});
					}
					pageUtil.scrollChatListDown();
				}
			};
			if (this.props.nim) {
				let msg = this.props.nim.sendText(itemInfo);
			} else {
				let msg = this.nim.sendText(itemInfo);
			}

		}
	};
	/*----点击更多获取历史记录-----*/
	getHistory = () => {
		//console.log("历史记录", this.props.userCode);
		let self = this;
		let option = {
			scene: 'p2p',
			to: this.props.userCode,
			beginTime: 0,
			endTime: new Date().getTime(),
			limit: 36,
			asc: true,
			done: function getHistoryMsgsDone(error, obj) {
				if (error == null) {
					if (obj.msgs.length === 0) {
						self.setState({
							getHistory: '没有更多数据'
						})
					} else {
						self.setState({
							showMore: 'none',
							meSendContent: obj.msgs
						})
					}
				} else {
					self.setState({
						getHistory: '获取失败'
					})
				}
			}
		};
		if (this.props.nim) {
			this.props.nim.getHistoryMsgs(option)
		} else {
			this.nim.getHistoryMsgs(option)
		}
		//this.nim.getHistoryMsgs(option);
	};

	render() {
		const {buyNickName, buyHeadUrl, emojiArr, msgToSent, emojiShow, meSendContent, getHistory, showMore, headUrl} = this.state;
		return (
			<Draggable
				handle=".handle"
			>
				<section className="accountWrapper" style={{display: this.props.showConnect}}>
					<div className="accountCur">
						<div className="accountTop handle">
							<div>
                               <span className="headImg show">
                                   {
	                                   buyHeadUrl ?
		                                   <img src={buyHeadUrl} alt="" />
		                                   : <img src="/static/images/defaultHead.png" alt="" />
                                   }
                               </span>
								<span>{buyNickName}</span>
							</div>
							<IconFont type="iconfont-guanbi" className="closeAccount" onClick={this.closeModal.bind(this)} />
						</div>
						<div className="accountMid" id="accountMid">
							<p className="text-center moreData" onClick={this.getHistory.bind(this)} style={{display: showMore}}>{getHistory}</p>
							{
								meSendContent !== null && meSendContent
									? meSendContent.map((item, index) => {
										return (
											<div key={index}>
												<p className="text-center sendTime">{
													item.time ?
														timestampToTime(item.time)
														: ''
												}</p>
												<div className={`msgOther ${item.from === this.state.userCode ? 'msgMe' : 'toInfo'}`}>
													{
														(() => {
															if (item.from === this.state.userCode) {
																return (
																	<span>
                                     {
                                       headUrl ?
                                         <img src={baseUrl + headUrl} alt="" className="otherImg meImg" />
                                         : <img src="/static/images/defaultHead.png" alt=""
                                                className="otherImg meImg" />
                                     }
                                 </span>
																)
															} else {
																return (
																	<span>
                                                                       {
	                                                                       buyHeadUrl ?
		                                                                       <img src={buyHeadUrl} alt="" className="otherImg meImg" />
		                                                                       : <img src="/static/images/defaultHead.png" alt=""
		                                                                              className="otherImg meImg" />
                                                                       }
                                                                   </span>
																)
															}
														})()
													}
													<div className="msg show">
														<div className="arrow">
															<em /><span />
														</div>
														<div className="msgBox">
															{/*---text分为文字与表情---发送出去的路径是/images/emoji/emoji.png;接收到的是
                                                            /static/images/emoji/emoji.png*/}
															{
																(() => {
																	if (item.type === 'text') {
																		return (
																			<div dangerouslySetInnerHTML={{__html: buildEmoji(item.text)}}>
																				{/* {
                                                                                    (() => {
                                                                                        if (item.text.match(imgReg)) {
                                                                                            return (
                                                                                                <span>
                                                                                                   {
                                                                                                       (() => {
                                                                                                           if (item.from === this.state.userCode) {
                                                                                                               return (
                                                                                                                   <img src={item.text.match(srcReg)[1]} alt=""/>
                                                                                                               )
                                                                                                           } else {
                                                                                                               return (
                                                                                                                   <img src={item.text.match(srcReg)[1].substring(7, item.text.match(srcReg)[1].length)} alt=""/>
                                                                                                               )
                                                                                                           }
                                                                                                       })()
                                                                                                   }
                                                                                               </span>
                                                                                            )
                                                                                        } else {
                                                                                            return (
                                                                                                <div>{item.text}</div>
                                                                                            )
                                                                                        }
                                                                                    })()
                                                                                }*/}
																			</div>
																		)
																	}
																})()
															}
															{
																item.type === 'image' ?
																	<a href={item.file.url}>
																		<img src={item.file.url} alt="" />
																	</a>
																	: null
															}
															{
																item.type === 'file' ?
																	<a href={item.file.url + '&download=' + item.file.name}>
																		<IconFont type="iconfont-wenjianjia" className="add" style={{fontSize: '40px', marginRight: '10px'}} />
																		<span className="fileName show">
                                                                            {item.file.name}
                                                                        </span>
																	</a>
																	: null
															}
														</div>
													</div>
													<span className="readMsg" style={{display: 'none'}}>
                                                        "已读"
                                                    </span>
												</div>
											</div>
										)
									})
									: null
							}
						</div>
						<div className="accountFooter">
							<div style={{height: '50px'}}>
								<Input.TextArea placeholder="点击输入内容..." rows={2} className="sendContent" value={msgToSent} onChange={e => this.sendChange(e)}
								                id="draggerAlert" onPressEnter={this.sendTextMessage.bind(this)}>
								</Input.TextArea>
								<Button className="sendInfoBtn text-primary" onClick={this.sendTextMessage.bind(this)}>发送</Button>
							</div>
							<div className="navBar prl2 mt2">
                              <span>
                                 <IconFont type="iconfont-biaoqing" className="iconItem" onClick={this.showEmoji.bind(this)} />
                              </span>
								<span className="fileImg">
                                    <IconFont type="iconfont-fujian" className="iconItem" onClick={this.showResource.bind(this)} />
                                    <input type="file" id="fileToSent" onChange={this.uploadFile.bind(this)} style={{display: 'none'}} />
                               </span>
								{/*---表情包----*/}
								<div className="m-chat-emoji" style={{display: emojiShow}}>
									<div className="emoji-content">
										<div className="cnt">
											{
												emojiArr.map((item, index) => {
													return (
														<span key={index} onClick={() => this.selectEmoji(item, index)}>
                                                            <img src={item.img} alt="" />
                                                        </span>
													)
												})
											}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</Draggable>
		);
	}
}

export default ConnectAlert
