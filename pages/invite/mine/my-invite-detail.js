// 我的投标详情
import React, {Component} from 'react';
import Layout from 'components/Layout/myinvite'
import InviteTable from '../components/InviteTable'
import InviteInfo from '../components/InviteInfo'
import Router, {withRouter} from 'next/router'
import Link from 'next/link'
import {Breadcrumb, Tabs, Table, Button, Modal, Input, Empty} from 'antd'
import {timestampToTime} from 'server';
import moment from 'moment'
import {inviteDetailFun, stopInviteFun, winningBidFun, setInvalidFun} from 'inviteApi'
import './style.less'
import '../style.less'
import {message} from "antd/lib/index";

const {TabPane} = Tabs;
const {TextArea} = Input;

class DetailIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navPath: ['我的招投标', '我的招标', '招标详情'],
            key: 0,
            inviteData: {},
            inviteTable: [],
            stopModal: false,//终止招标
            scrapModal: false,//废标
            winningBidModal: false,//小于3家中标
            winnMoreBidModal: false,//小于3家中标
            winningTipModal: false,//中标
            invalidModal: false,//无效弹窗
            invalidReasonModal: false,//无效原因弹窗
            reasonModal: '',//终止废标的原因弹窗
            reasonText: '',//终止废标的原因
            reasonInvalid: '',//无效的原因
            status: 4,//4终止6废标
            placeText: '请输入废标的原因,届时所有投标人将会收到消息通知',
            stopText: '请输入终止招标的原因,届时所有投标人将会收到消息通知',
            inviteItemId: '',//投标列表中对应的招标id
            num: 0,
            selectedRowKeys: []
        };
        this.columns = [
            {
                title: '序号',
                width: '8%',
                dataIndex: 'quantity',
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: '投标人',
                dataIndex: 'companyName',
                width: '18%',
            },
            {
                title: '投标次数',
                width: '10%',
                dataIndex: 'bidCount',
                render: (text) => {
                    return (
                        <span className="text-grey">{text ? text : '--'}</span>
                    );
                }
            },
            {
                title: '投标时间',
                width: '16%',
                render: (text, record) => {
                    return (
                        <span className="text-grey">{timestampToTime(record.createTime)}</span>
                    );
                }
            },
            {
                title: '投标状态',
                width: '10%',
                dataIndex: 'status',
                render: (text, record) => {
                    let result = '', name = '';
                    switch (text) {
                        case '0':
                            result = '已投标';
                            name = 'text-primary';
                            break;
                        case '1':
                            result = '已中标';
                            name = 'text-primary';
                            break;
                        case '2':
                            result = '未中标';
                            name = 'text-primary';
                            break;
                        case '3':
                            result = '无效投标';
                            name = 'text-plus';
                            break;
                        case '4':
                            result = '已撤回';
                            name = 'text-danger';
                            break;
                    }
                    return (
                        <span className={`text-grey ${name}`}>{result}</span>
                    );
                }
            },
            {
                title: '报价金额(万元)',
                dataIndex: 'finalOffer',
            },
            {
                title: '联系人及联系方式',
                dataIndex: 'mobile',
                render: (text, record) => {
                    return (
                        <span className="text-grey">{record.contacts}{text}</span>
                    );
                }
            }
        ];
        this.bidColumns = [
            {
                title: '序号',
                width: '8%',
                dataIndex: 'quantity',
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: '投标人',
                dataIndex: 'companyName',
                width: '12%',
            },
            {
                title: '投标次数',
                width: '12%',
                dataIndex: 'bidCount',
                render: (text) => {
                    return (
                        <span className="text-grey">{text ? text : '--'}</span>
                    );
                }
            },
            {
                title: '投标时间',
                width: '16%',
                render: (text, record) => {
                    return (
                        <span className="text-grey">{timestampToTime(record.createTime)}</span>
                    );
                }
            },
            {
                title: '投标状态',
                width: '10%',
                dataIndex: 'status',
                render: (text, record) => {
                    let result = '', name = '';
                    switch (text) {
                        case '0':
                            result = '已投标';
                            name = 'text-primary';
                            break;
                        case '1':
                            result = '已中标';
                            name = 'text-primary';
                            break;
                        case '2':
                            result = '未中标';
                            name = 'text-primary';
                            break;
                        case '3':
                            result = '无效投标';
                            name = 'text-plus';
                            break;
                        case '4':
                            result = '已撤回';
                            name = 'text-danger';
                            break;
                    }
                    return (
                        <span className={`text-grey ${name}`}>{result}</span>
                    );
                }
            },
            {
                title: '报价金额(万元)',
                dataIndex: 'finalOffer',
                width: '10%',
            },
            {
                title: '联系人及联系方式',
                dataIndex: 'mobile',
                width: '12%',
                render: (text, record) => {
                    return (
                        <span className="text-grey">{record.contacts}{text}</span>
                    );
                }
            },
            {
                title: '操作',
                width: '20%',
                render: (text, record) => {
                    return (
                        <div>
                            {
                                record.status !== '4' ?
                                    <Link href={{
                                        pathname: '/invite/mine/my-invitebid-detail',
                                        query: {id: record.id, bidId: record.bidId,type:1}
                                    }}>
                                        <a className='prl1'>查看</a>
                                    </Link>
                                    : null
                            }
                            {
                                //投标正常(已投标已中标未中标)并招标已开标
                                (record.status === '0' || record.status === '1' || record.status === '2') && this.state.inviteData.invitationStatus === 2 ?
                                    <div className='show'>
                                        <span className='prl1 text-danger' onClick={() => this.setState({
                                            invalidModal: true,
                                            inviteItemId: record.id
                                        })}>设为无效</span>
                                        <span className='text-info'
                                              onClick={() => this.Inviteing(record.id)}>设为中标</span>
                                    </div>
                                    : null
                            }
                        </div>
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
        let params = {
            invitationId: this.props.router.query.id
        }
        inviteDetailFun(params).then(res => {
            let tableData = [];
            if (res.result === 'success') {
                //招标中，已开标
                tableData = [
                    {key: '招标单位', value: res.data.companyName},
                    {key: '集团单位', value: res.data.conglomerateName},
                    {key: '项目名称', value: res.data.projectName},
                    {
                        key: '项目地址',
                        value: res.data.projectProvince + res.data.projectCity + res.data.projectArea + res.data.projectAddress
                    },
                    {key: '截标日期', value: moment(res.data.endTime).format('YYYY-MM-DD HH时')},
                    {key: '定标日期', value: moment(res.data.calibrationTime).format('YYYY-MM-DD HH时')},
                    {key: '投标保证金(元)', value: res.data.margin},
                    {key: '招标形式', value: res.data.form},
                    {key: '增值税发票', value: !res.data.isInvoice  ? '需要' + res.data.invoiceType : '不需要'},
                    {key: '预计进场日期', value: moment(res.data.planTime).format('YYYY-MM-DD')},

                ];
                //已定标
                if (res.data.invitationStatus === 3) {
                    tableData.push({
                        key: '定标时间',
                        value: moment(res.data.calibrationTime).format('YYYY-MM-DD HH时')
                    }, {key: '', value: ''})
                }
                //废标
                if (res.data.invitationStatus === 6) {
                    tableData.push({
                        key: '废标时间',
                        value: moment(res.data.exceptionTime).format('YYYY-MM-DD')
                    }, {key: '废标原因', value: res.data.exceptionReason})
                }
                //终止招标
                if (res.data.invitationStatus === 4) {
                    tableData.push({
                        key: '终止招标时间',
                        value: moment(res.data.exceptionTime).format('YYYY-MM-DD')
                    }, {key: '终止招标原因', value: res.data.exceptionReason})
                }
                this.setState({
                    inviteData: res.data,
                    inviteTable: tableData
                })
            } else {
                console.log(res.msg)
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
    /*--废标终止的原因-*/
    changeReason = (e) => {
        this.setState({
            reasonText: e.target.value
        })
    };
    /*--无效的原因-*/
    changeReasonInvalid = (e) => {
        this.setState({
            reasonInvalid: e.target.value
        })
    }
    /**
     * 终止招标,废标
     * */
    stopInvite = (status) => {
        let params = {
            invitationId: this.state.inviteData.invitationId,
            exceptionReason: this.state.reasonText,
            invitationStatus: status
        };

        stopInviteFun(params).then(res => {
            if (res.result === 'success') {
                this.getInviteDel();
                this.setState({
                    reasonText: '',
                    reasonModal: false
                })
            } else {
                message.error(res.msg)
            }
        })
    };
    /**设置为中标
     * */
    Inviteing = (id) => {
        const {bidsUser} = this.state.inviteData;
        const {selectedRowKeys} = this.state;
        let num = [];
        for (let i in bidsUser) {
            if (bidsUser[i].status !== '3' && bidsUser[i].status !== '4') {
                num.push(i)
            }
        }
        this.setState({
            inviteItemId: id === 'string' ? selectedRowKeys[0] : id,
            num: num.length
        })
        if (num.length < 3) {
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
            id: this.state.inviteItemId,
        };
        winningBidFun(params).then(res => {
            if (res.result === 'success') {
                this.getInviteDel();
                this.setState({
                    winningBidModal: false,
                    winningTipModal: true
                })
                if (this.state.num < 3) {
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
    /**-设置为无效
     -*/
    setInvalid = () => {
        let params = {
            id: this.state.inviteItemId,//投标的id
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
    onSelectChange = selectedRowKeys => {
        this.setState({
            selectedRowKeys,
        });
    };

    render() {
        const {navPath, inviteData, selectedRowKeys} = this.state;
        const rowSelection = {
            type: 'radio',
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: record => ({
                disabled: (record.status === '4' || record.status === '3'), // Column configuration not to be checked
                //status: record.status,
            }),
        };
        return (
            <Layout title='我的招投标-招标详情' menuIndex={'1'} mainMenuIndex={'inquiry'}>
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
                            <span className="text-primary">招标详情</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <aside className='bg-white p4' style={{paddingBottom: '40px'}}>
                        <div className='inviteTitle'>
                            <span className='h0 text-grey '
                                  style={{marginRight: "40px"}}>{inviteData ? inviteData.title : ''}</span>
                            <span
                                className={`icon-tender-${inviteData ? inviteData.invitationStatus : '1'} iconTender show`}/>
                        </div>
                        <div className="invite-detail-sub-title mt2">基本信息</div>
                        <InviteTable inviteTable={this.state.inviteTable}/>
                    </aside>
                    <Tabs defaultActiveKey="0" className="invite-tabs bg-white mt2" animated={false}
                          onChange={this.stateChange}>
                        <TabPane tab="更多招标信息" key="0">
                            <InviteInfo inviteInfo={inviteData} changeSatus={this.changeStatus}/>
                        </TabPane>
                        <TabPane tab="投标列表" key="1" className='p4'>
                            {(() => {
                                if (inviteData && inviteData.bidsUser && inviteData.bidsUser.length > 0) {
                                    if (inviteData.invitationStatus === 2) {
                                        return (
                                            //已开标
                                            <Table ref="table"
                                                   hideDefaultSelections={true}
                                                   className="mt2"
                                                   rowKey={record => record.id}
                                                   columns={inviteData.invitationStatus === 1 ? this.columns : this.bidColumns}
                                                   pagination={false}
                                                   dataSource={inviteData.bidsUser}
                                                   rowSelection={inviteData.invitationStatus === 2 ? rowSelection : {}}

                                            />
                                        )
                                    } else {
                                        return (
                                            //已开标
                                            <Table ref="table"
                                                   hideDefaultSelections={true}
                                                   className="mt2"
                                                   rowKey={record => record.id}
                                                   columns={inviteData.invitationStatus === 1 ? this.columns : this.bidColumns}
                                                   pagination={false}
                                                   dataSource={inviteData.bidsUser}
                                            />
                                        )
                                    }

                                } else {
                                    return (
                                            <Empty
                                                image="/static/sprites/nodata.png"
                                                imageStyle={{
                                                    height: 60,
                                                }}
                                                description={
                                                    <span>
                                                        暂无数据
                                                      </span>
                                                }
                                            >
                                            </Empty>
                                    )
                                }
                            })()}


                        </TabPane>
                    </Tabs>
                    {/*--按钮--*/}
                    <div className='text-center inviteBtn bg-white p4'>
                        {
                            //招标中
                            inviteData && inviteData.invitationStatus === 1 ?
                                <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                        style={{marginRight: '20px'}}
                                        onClick={() => {
                                            Router.push({
                                                pathname: '/invite/mine/edit-invite',
                                                query: {id: this.props.router.query.id}
                                            })
                                        }}>变更标书
                                </Button>
                                : null
                        }
                        {
                            //已开标
                            inviteData && inviteData.invitationStatus === 2 ?
                                <div className='show'>
                                    {
                                        this.state.key === '1' ?
                                            <Button type="primary" size="large"
                                                    className="bg-primary-linear border-radius"
                                                    disabled={!this.state.selectedRowKeys[0]}
                                                    onClick={() => this.Inviteing('string')}
                                                    style={{width: "100px"}}>定标</Button>
                                            : null
                                    }

                                    <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                            onClick={() => this.setState({scrapModal: true})}
                                            style={{width: "100px", margin: "0 20px"}}>废标</Button>
                                </div>
                                : null
                        }
                        {
                            //招标中，开标
                            inviteData && (inviteData.invitationStatus === 1 || inviteData.invitationStatus === 2 ) ?
                                <Button size="large" className="btn-recommend border-radius"
                                        onClick={() => this.setState({stopModal: true})}>终止招标</Button>
                                : null
                        }
                    </div>
                </section>
                <Modal visible={this.state.stopModal}
                       width={400}
                       closable={false}
                       centered={true}
                       footer={null}
                >
                    <h2 className="text-center ptb2">确定终止招标吗？</h2>
                    <div className='text-center mt2'>
                        <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                onClick={() => this.setState({status: 4, stopModal: false, reasonModal: true})}
                                style={{width: "120px"}}>确定</Button>
                        <Button size="large" type="primary" ghost onClick={() => this.setState({stopModal: false})}
                                style={{width: "120px", margin: "0 20px"}}>取消</Button>
                    </div>
                </Modal>
                <Modal visible={this.state.scrapModal}
                       width={400}
                       closable={false}
                       centered={true}
                       footer={null}
                >
                    <h2 className="text-center ptb2 ">本操作不可撤销,是否确定废标？</h2>
                    <div className='text-center mt2'>
                        <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                onClick={() => this.setState({status: 6, scrapModal: false, reasonModal: true})}
                                style={{width: "120px"}}>确定</Button>
                        <Button size="large" type="primary" ghost onClick={() => this.setState({scrapModal: false})}
                                style={{width: "120px", margin: "0 20px"}}>取消</Button>
                    </div>
                </Modal>
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
                <Modal visible={this.state.reasonModal}
                       closable={false}
                       centered={true}
                       footer={null}
                       destroyOnClose={true}
                >
                    <p>请填写
                        {this.state.status === 4 ? '终止招标' : '废标'}
                        的原因</p>
                    <TextArea rows={8}
                              placeholder={this.state.status === 4 ? this.state.stopText : this.state.placeText}
                              value={this.state.reasonText} onChange={this.changeReason}/>
                    <p className='mt1'>请妥善处理投标人的投标文件、样品、投标保证金等</p>
                    <div className='text-center mt2'>
                        <Button type="primary" size="large" className="bg-primary-linear border-radius"
                                style={{width: "120px"}} onClick={() => this.stopInvite(this.state.status)}>确定</Button>
                        <Button size="large" type="primary" ghost
                                onClick={() => this.setState({reasonModal: false, reasonText: ''})}
                                style={{width: "120px", margin: "0 20px"}}>取消</Button>
                    </div>
                </Modal>
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
            </Layout>
        );
    }
}

export default withRouter(DetailIndex);
