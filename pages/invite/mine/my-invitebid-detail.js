// 我的投标详情
import React, {Component} from 'react';
import Layout from 'components/Layout/myinvite'
import Router,{withRouter} from 'next/router'
import Link from 'next/link'
import {timestampToTime} from 'server';
import {Breadcrumb, Table, Button, Modal, message, Row, Col, Icon,Input} from 'antd'
import {bidDetailFun,withdrawBidFun,setInvalidFun,winningBidFun} from 'inviteApi'
import './style.less'
import '../style.less'
import {iconUrl,baseUrl} from 'config/evn'
import cookie from "react-cookies";

const {TextArea} = Input;

const IconFont = Icon.createFromIconfontCN({
    scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DetailIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
            navPath: ['我的招投标'],
            bidData: {},
            invalidModal:false,//无效弹窗
            invalidReasonModal: false,//无效原因弹窗
            upDataModal:false,//中标弹窗
            winningBidModal: false,//小于3家中标
            winnMoreBidModal: false,//小于3家中标
            winningTipModal: false,//中标
        };
        this.columns = [
            {
                title: '序号',
                width: '10%',
                dataIndex: 'quantity',
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: '标的物名称',
                dataIndex: 'materialsName',
                width: '18%',
            }, {
                title: '规格型号',
                width: '10%',
                dataIndex: 'specsModels',
                render: (text) => {
                    return (
                        <span className="text-darkgrey">{text ? text : '--'}</span>
                    );
                }
            },
            {
                title: '数量',
                width: '10%',
                render: (text, record) => {
                    return (
                        <span className="text-darkgrey">{record.quantity}</span>
                    );
                }
            },
            {
                title: '单位',
                width: '10%',
                dataIndex: 'unit',
            },
            {
                title: '备注',
                dataIndex: 'remark',
                render: (text) => {
                    return (
                        <span className="text-darkgrey">{text ? text : '--'}</span>
                    );
                }
            },
            {
                title: '单价(元)',
                dataIndex: 'unitPrice',
                width: '10%',
                render: (text) => {
                    return (
                        <span className="text-darkgrey">{text ? text : '--'}</span>
                    );
                }
            }, {
                title: '小计',
                dataIndex: 'totalPrice',
                width: '10%',
                render: (text) => {
                    return (
                        <span className="text-darkgrey">{text ? text : '--'}</span>
                    );
                }
            }

        ];
    }

    componentDidMount() {
        this.getInviteDel();
    }

    componentDidUpdate(prevProps) {
        const {query} = this.props.router;
        if (query.id !== prevProps.router.query.id) {
            this.getInviteDel();
        }
    }

    getInviteDel = () => {
        if(Router.query.type){
            this.setState({
                navPath: ['我的招投标','我的招标','招标详情', '投标详情']
            })
        }else{
            this.setState({
                navPath: ['我的招投标','我的投标', '投标详情']
            })
        }
        let params = {
            bidId: this.props.router.query.bidId,//招标id
            id: this.props.router.query.id//投标id
        };
        bidDetailFun(params).then(res => {
            if(res.result==='success'){
                this.setState({
                    bidData: res.data
                })
            }
        }).catch(error => {
            console.log(error)
        })
    };
    stateChange = (key) => {
        this.setState({
            key: key
        })
    };
    /**撤回
    * */
    withdrawBid = () =>{
       let params = {
            id:this.props.router.query.id,//投标id
           bidId:this.props.router.query.bidId,//招标id
           userCode:this.state.userCode
        }
        withdrawBidFun(params).then(res =>{
            if(res.result === 'success'){
                this.setState({
                    withdrawModal:false
                },()=>{
                    this.getInviteDel();
                })
            }else{
                this.setState({
                    withdrawModal:false
                },()=>{
                    message.error(res.msg)
                })

            }
        })
    };
    /*点击重新投标按钮
    * */
    upDataBid = () =>{
        if(this.state.bidData.invitationStatus === 1){
            //招标中
            Router.push({
                pathname:'/invite/tender',
                query:{
                    id:this.state.bidData.bidId
                }
            })
        }else{
            this.setState({
                upDataModal:true
            })
        }
    };
    /*--无效的原因-*/
    changeReasonInvalid = (e) => {
        this.setState({
            reasonInvalid: e.target.value
        })
    }
    /**-设置为无效
     -*/
    setInvalid = () => {
        let params = {
            id: this.state.bidData.id,//投标的id
            reason: this.state.reasonInvalid
        };
        setInvalidFun(params).then(res => {
            if (res.result === 'success') {
                this.getInviteDel();
                this.setState({
                    invalidReasonModal: false
                })
            } else {
                message.error(res.msg)
            }
        })
    };
    /**设置为中标
     * */
    Inviteing = (id) => {
        const {bidsUser} = this.state.bidData;
        let num = [];
        if (this.state.bidData.yesCount < 3) {
            //小于3家
            this.setState({
                winningBidModal: true
            })
        } else {
            //大于3家
            this.setState({
                winnMoreBidModal: true
            })
        }


    };
    sureInvite = () => {
        let params = {
            id: this.state.bidData.id,
        };
        winningBidFun(params).then(res => {
            if (res.result === 'success') {
                this.getInviteDel();
                this.setState({
                    winningBidModal: false,
                    winningTipModal: true
                })
                if (this.state.bidData.yesCount < 3) {
                    this.setState({
                        winningBidModal: false,
                    })
                } else {
                    this.setState({
                        winnMoreBidModal: false
                    })
                }
            } else {
                message.error(res.msg)
            }
        })
    };
    render() {
        const {navPath, bidData} = this.state;
        return (
            <Layout title='我的招投标-投标详情' menuIndex={'1'} mainMenuIndex={'inquiry'}>
                <section>
                    {/*招标与投标路径*/}
                    <span style={{marginRight: "10px"}}>您的位置:</span>
                    <Breadcrumb separator=">" className='text-lightgrey ptb1 show'>
                        {/*{
                            navPath && navPath.map((item, index) => {
                                return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                            })
                        }*/}
                        <Breadcrumb.Item>
                            <span>我的招投标</span>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <a href="/invite/mine">我的招标</a>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link href={{pathname:'/invite/mine/my-invite-detail',query:{id:bidData.bidId}}}>
                                <a>招标详情</a>
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <span className="text-primary">投标详情</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <aside className='bg-white p4' style={{paddingBottom: '40px'}}>
                        <div className='inviteTitle'>
                            <Link href={{pathname:'/invite/detail',query:{id:bidData.bidId}}}>
                                <a className='h0 text-darkgrey ' style={{marginRight: "40px"}} target='_blank'>{ bidData.title }</a>
                            </Link>

                            {(() => {
                                if (bidData.status === '1') {
                                    //已中标
                                    return (
                                        <span className={`icon-bid-1 iconBid show`}/>
                                    )
                                } else if (bidData.status === '2') {
                                    //未中标
                                    return (
                                        <span className={`icon-bid-2 iconBid show`}/>
                                    )
                                }
                            })()}
                        </div>
                        {
                             bidData.invitationUpdateTime && bidData.invitationUpdateTime > bidData.createTime ?
                                <div className="h6 text-primary bg-white" style={{marginTop:"10px"}}>
                                    <IconFont type="iconfont-tongzhi2" className="h1"/> 本招标项目已于{timestampToTime(bidData.invitationUpdateTime)}发生过变更，请及时查看最新内容并重新投标
                                </div>
                                :null
                        }

                        <div className="invite-detail-sub-title mt2">基本信息</div>
                        <table className='inviteTable mt2'>
                            <tbody>
                            <tr>
                                <td>投标状态</td>
                                {(()=>{
                                    if (bidData.status === '1') {
                                        //已中标
                                        return (
                                            <td>已中标</td>
                                        )
                                    } else if (bidData && bidData.status === '0') {
                                        //已投标
                                        return (
                                            <td>已投标</td>
                                        )
                                    } else if (bidData.status === '2') {
                                        //未中标
                                        return (
                                            <td>未中标</td>
                                        )
                                    }else if(bidData.status === '3'){
                                        //无效投标
                                        return (
                                            <td>无效投标</td>
                                        )
                                    }
                                    else if(bidData.status === '4'){
                                        //已撤回
                                        return (
                                            <td>已撤回</td>
                                        )
                                    }
                                })()}
                                <td>投标时间</td>
                                <td>{timestampToTime(bidData.createTime)}</td>
                            </tr>
                            {(() => {
                                if (bidData.status === '1') {
                                    //已中标
                                    return (
                                        <tr>
                                            <td>中标时间</td>
                                            <td>{timestampToTime(bidData.winTime)}</td>
                                            <td/>
                                            <td/>
                                        </tr>
                                    )
                                } else if(bidData.status === '3'){
                                    //无效投标
                                    return (
                                        <tr>
                                            <td>无效原因</td>
                                            <td>{bidData.invalidReason}</td>
                                            <td/>
                                            <td/>
                                        </tr>
                                    )
                                }
                                else if(bidData.status === '4'){
                                    //已撤回
                                    return (
                                        <tr>
                                            <td>撤回时间</td>
                                            <td>{timestampToTime(bidData.updateTime)}</td>
                                            <td/>
                                            <td/>
                                        </tr>
                                    )
                                }
                            })()}
                            </tbody>
                        </table>
                        <div className="invite-detail-sub-title mt2">公司信息</div>
                        <aside className='invite-detail-content'>
                            <Row>
                                <Col span={12}>
                                    <i>公司名称：</i><span>{bidData.companyName}</span>
                                </Col>
                                <Col span={12}>
                                    <i>法人姓名：</i><span>{bidData.legalName}</span>
                                </Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={12}>
                                    <i>社会信用代码：</i><span>{bidData.licenseNo}</span>
                                </Col>
                                <Col span={12}>
                                    <i>企业性质：</i><span>{bidData.companyNature}</span>
                                </Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={12}>
                                    <i>主营业务类型：</i><span>{bidData.businessType}</span>
                                </Col>
                                <Col span={12}>
                                    <i>注册资金：</i><span>{bidData.registeredCapital}元</span>
                                </Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={12}>
                                    <i>一般纳税人：</i><span>{bidData.generalTaxpayer ? '是' : '否'}</span>
                                </Col>
                                <Col span={12}>
                                    <i>成立年份：</i><span>{bidData.establishedTime}</span>
                                </Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={12}>
                                    <i>经营期至：</i><span>{bidData.operationPeriod}</span>
                                </Col>
                                <Col span={12}>
                                    <i>联合投标：</i><span>{bidData.jointBidding ? '是' : '否'}</span>
                                </Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={12}>
                                    <i>联系人：</i><span>{bidData.contacts}</span>
                                </Col>
                                <Col span={12}>
                                    <i>联系电话：</i><span>{bidData.mobile}</span>
                                </Col>
                            </Row>
                            <div className='mt1'>
                                <i>公司地址：</i>
                                <span>{bidData.province}{bidData.city}{bidData.area}{bidData.address}</span>
                            </div>
                            <Row className='mt1'>
                                <Col span={4} className='leftText'>公司简介：</Col>
                                <Col span={20} className='text-black'>{bidData.introduction}</Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={4} className='leftText'>联合投标说明：</Col>
                                <Col span={20}
                                     className='text-black'>{bidData.jointBiddingDescription}</Col>
                            </Row>
                        </aside>
                        <div className="invite-detail-sub-title mt2">报价信息</div>
                        <Table ref="table"
                               hideDefaultSelections={true}
                               className="mt2 text-muted"
                               rowKey={record => record.bidId}
                               columns={this.columns}
                               pagination={false}
                               dataSource={bidData.materials}
                        />
                        <div className='mt2'><i>标的物合计：</i><span>{bidData ? bidData.bidAmount : ''}元</span></div>
                        {
                            bidData && bidData.otherFeeList &&  bidData.otherFeeList.length>0 ?
                                <div>
                                    <div className="invite-detail-sub-title mt2">其他费用</div>
                                    <div className='ant-table-wrapper mt2'>
                                        <div className='ant-table ant-table-default ant-table-scroll-position-left'>
                                            <div className='ant-table-content'>
                                                <div className='ant-table-body'>
                                                    <table>
                                                        <thead className='ant-table-thead'>
                                                        <tr>
                                                            <th width="20%">序号</th>
                                                            <th width="40%">费用名称</th>
                                                            <th width="40%">费用金额（元）</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className='ant-table-tbody'>
                                                        {
                                                            bidData.otherFeeList.map((item,index)=>{
                                                                return(
                                                                    <tr key={index}>
                                                                        <td>{index+1}</td>
                                                                        <td>{item.key}</td>
                                                                        <td>{item.value}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :null
                        }
                        <div className={'invite-detail-content'}>
                            <p className='mt1'><label>抹零金额：</label><span>{bidData ? bidData.discountAmount : ''}元</span></p>
                            <p className='mt1'><label>最终报价：</label><span>{bidData ? bidData.finalOffer : ''}元</span></p>
                            <Row className='mt1'>
                                <Col span={4} className='leftLabel'>费用说明：</Col>
                                <Col span={20} className='text-black'>{bidData ? bidData.expenseExplanation : '无'}</Col>
                            </Row>
                            <Row className='mt1'>
                                <Col span={4} className='leftLabel'>备注：</Col>
                                <Col span={20} className='text-black'>{bidData ? bidData.remark : '无'}</Col>
                            </Row>
                        </div>
                        {(()=>{
                            if(bidData.attachments && bidData.attachments.length>0){
                                return(
                                    <section>
                                        <div className="invite-detail-sub-title mt4">附件</div>
                                        {
                                            bidData.attachments.map((item,index)=>{
                                                return(
                                                    <div key={index} className='prl2'>
                                                        <a href={baseUrl+item.filePath} className='text-primary'>{item.fileName}</a>
                                                    </div>
                                                )
                                            })
                                        }
                                    </section>
                                )
                            }
                        })()}
                        {
                            //投标正常(已投标已中标未中标)并招标已开标
                            (bidData.status === '0' || bidData.status === '1' || bidData.status === '2') && bidData.invitationStatus === 2 ?
                                <div className='text-center inviteBtn mt2'>
                                    <Button size="large" className="btn-recommend border-radius" style={{width:"100px",marginRight:"20px"}}
                                            onClick={()=>this.setState({invalidModal:true})}>设为无效</Button>
                                    <Button size="large" className="btn-recommend border-radius"
                                            onClick={this.Inviteing}>设为中标</Button>

                                </div>
                                : null
                        }
                        {/*<div className='text-center inviteBtn mt2'>
                            {
                                //已投标,已中,未中
                                bidData && (bidData.status === '0' || bidData.status === '1' || bidData.status === '2') && (bidData.invitationStatus === 1 || bidData.invitationStatus === 2)?
                                    <Button size="large" className="btn-recommend border-radius" style={{width:"100px"}}
                                            onClick={()=>this.setState({withdrawModal:true})}>撤回</Button>
                                    :null
                            }
                            {
                                //已撤回
                                bidData.status === '4'?
                                    <Button size="large" className="btn-recommend border-radius"
                                            onClick={this.upDataBid}>重新投标</Button>
                                    :null
                            }
                        </div>*/}
                    </aside>
                    <Modal visible={this.state.invalidModal}
                           closable={false}
                           centered={true}
                           footer={null}
                    >
                        <h2 className="text-center ptb2 ">本操作不可撤销，是否确定设为无效？</h2>
                        <div className='text-center mt2'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                    onClick={() => this.setState({invalidModal: false, invalidReasonModal: true,})}
                                    style={{width: "120px"}}>确定</Button>
                            <Button size="large" type="primary" ghost onClick={() => this.setState({invalidModal: false})}
                                    style={{width: "120px", margin: "0 20px"}}>取消</Button>
                        </div>
                    </Modal>
                    {/*设为无效原因弹窗*/}
                    <Modal visible={this.state.invalidReasonModal}
                           closable={false}
                           centered={true}
                           footer={null}
                           destroyOnClose={true}
                    >
                        <p>请填写投标无效的原因</p>
                        <TextArea rows={8}
                                  placeholder={'请输入投标无效的原因,届时该投标人将会收到消息通知'}
                                  value={this.state.reasonInvalid} onChange={this.changeReasonInvalid}/>
                        <p className='mt1'>请妥善处理投标人的投标文件、样品、投标保证金等</p>
                        <div className='text-center mt2'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                    style={{width: "120px"}} onClick={this.setInvalid}>确定</Button>
                            <Button size="large" type="primary" ghost
                                    onClick={() => this.setState({invalidReasonModal: false, reasonInvalid: ''})}
                                    style={{width: "120px", margin: "0 20px"}}>取消</Button>
                        </div>
                    </Modal>
                    {/*设置定标小于3家*/}
                    <Modal visible={this.state.winningBidModal}
                           closable={false}
                           centered={true}
                           footer={null}
                    >
                        <h2 className="text-center ptb2">符合要求的招标人不足三家，是否确定要定标？</h2>
                        <div className='text-center mt2'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                    onClick={this.sureInvite}
                                    style={{width: "120px"}}>确定</Button>
                            <Button size="large" type="primary" ghost
                                    onClick={() => this.setState({winningBidModal: false})}
                                    style={{width: "120px", margin: "0 20px"}}>取消</Button>
                        </div>
                    </Modal>
                    {/*中标大于3家*/}
                    <Modal visible={this.state.winnMoreBidModal}
                           closable={false}
                           centered={true}
                           footer={null}
                    >
                        <h2 className="text-center ptb2">操作提示</h2>
                        <p className='mt2 text-center text-grey'>您正在将“苏州普城工程建设有限公司”设为中标单位，操作成功后不可修改不可撤销，是否确定继续进行？</p>
                        <p className='mt2 text-center'>选定中标人后，系统将自动发布一条中标公告。您可联系中标人进行后续履约事宜。未中标者也将收到未中标的消息通知。</p>
                        <div className='text-center mt2'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                    onClick={this.sureInvite}
                                    style={{width: "120px"}}>确定</Button>
                            <Button size="large" type="primary" ghost
                                    onClick={() => this.setState({winnMoreBidModal: false})}
                                    style={{width: "120px", margin: "0 20px"}}>取消</Button>
                        </div>
                    </Modal>
                    <Modal visible={this.state.winningTipModal}
                           closable={false}
                           centered={true}
                           footer={null}
                    >
                        <h2 className="text-center ptb2">操作成功！</h2>
                        <p className='mt2 text-center'>您可联系投标人进行后续履约事宜</p>
                        <div className='text-center'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                    onClick={() => this.setState({winningTipModal: false})}
                                    style={{width: "120px"}}>我知道了</Button>
                        </div>
                    </Modal>
                    <Modal visible={this.state.upDataModal}
                           width={400}
                           closable={false}
                           centered={true}
                           footer={null}
                    >
                        <h2 className="text-center ptb2">
                            本项目已截标，不可投标</h2>
                        <div className='text-center mt2'>
                            <Button type="primary" size="large" className="bg-primary-linear border-radius" onClick={()=>this.setState({upDataModal:false})}
                                    style={{width:"120px"}}>我知道了</Button>
                        </div>
                    </Modal>
                </section>
            </Layout>
        );
    }
}

export default withRouter(DetailIndex);
