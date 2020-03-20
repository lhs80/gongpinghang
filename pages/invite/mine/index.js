// 我的招标
import React, {Component} from 'react';
import Link from 'next/link'
import Layout from 'components/Layout/myinvite'
import {Table,Select, Input, Button,Statistic, Pagination,DatePicker,Modal,message} from 'antd'
import {timestampToTime} from 'server';
import { inviteListFun,delInviteDraftFun } from 'inviteApi';
import moment from 'moment'
import './style.less'
import cookie from "react-cookies";

const {Countdown} = Statistic;
const { Option } = Select;
const {RangePicker} = DatePicker;

class InviteIndex extends Component {
	constructor(props) {
		super(props);
        this.state = {
            userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
            inviteList: [],
            title: '',
            status: '',//投标状态 0：招标中；1：已开标；2：已定标；3：异常；4：草稿
            start: 0,//起始页
            startTime: '',//开始时间
            endTime: '',//结束时间
            isEnable: '',
            total: 0,
            pagination: {
                defaultPageSize: 16,
                showQuickJumper: true,
                onChange: this.onCurPageChange,
            },
            current: 1,
            delModal:false,//删除弹窗提示
            inviteId:'',
        };

        this.columns = [
            {
                title: '标书编号',
                dataIndex: 'invitationCode',
                width: '10%',
            }, {
                title: '招标标题',
                dataIndex: 'title',
                width: '18%',
                render: (text, record) => {
                    return (
                        <span className="text-grey">{text?text:'--'}</span>
                    );
                }
            }, {
                title: '招标类型',
                dataIndex: 'invitationType',
                width: '18%',
                render: (text, record) => {
                    let result = '';
                    switch (text){
                        case 0:
                            result = '采购招标';
                            break;
                        case 1:
                            result = '施工招标';
                            break;
                        case 2:
                            result = '设备租赁';
                            break;
                        case 3:
                            result = '劳务分包';
                            break;
                    }
                    return (
                        <span className="text-grey">{result}</span>
                    );
                }
            }, {
                title: '发布时间',
                align: 'center',
                width: '18%',
                render: (text, record) => {
                    // /{record.totalCount}
                    return (
                        <i className="text-grey">{timestampToTime(record.createTime)}</i>
                    );
                }
            }, {
                title: '截标日期',
                width: '18%',
                render: (text, record) => {
                    // /{record.totalCount}
                    return (
                        <i className="text-grey">{timestampToTime(record.endTime)}</i>
                    );
                }
            }, {
                title: '状态&操作',
                align: 'center',
                dataIndex: 'invitationStatus',
                width: '18%',
                render: (text, record) => {
                    let result = '',name = '' ;
                    switch (text){
                        case 1:
                            result = '招标中'; name = 'text-primary';
                            break;
                        case 2:
                            result = '已开标'; name = 'text-primary';
                            break;
                        case 3:
                            result = '已定标'; name = 'text-plus';
                            break;
                        case 4:
                            result = '已终止'; name = 'text-danger';
                            break;
                        case 5:
                            result = '流标'; name = 'text-muted';
                            break;
                        case 6:
                            result = '废标';
                            break;
                    }
                    return (
                        <div>
                            <span className={name}>{result}</span>
                            <Link href={{pathname: '/invite/mine/my-invite-detail', query: {id: record.invitationId}}}>
                                <a className='prl1'>查看</a>
                            </Link>
                        </div>

                    );
                }
            }
        ];
        this.draftColumns = [
            {
                title: '招标标题',
                dataIndex: 'title',
                width: '18%'
            }, {
                title: '招标类型',
                dataIndex: 'invitationType',
                width: '18%',
                render: (text, record) => {
                    let result = '';
                    switch (text){
                        case 0:
                            result = '采购招标';
                            break;
                        case 1:
                            result = '施工招标';
                            break;
                        case 2:
                            result = '设备租赁';
                            break;
                        case 3:
                            result = '劳务分包';
                            break;
                    }
                    return (
                        <span className="text-grey">{result}</span>
                    );
                }
            }, {
                title: '添加时间',
                align: 'center',
                width: '18%',
                render: (text, record) => {
                    // /{record.totalCount}
                    return (
                        <i className="text-grey">{timestampToTime(record.createTime)}</i>
                    );
                }
            }, {
                title: '操作',
                align: 'center',
                dataIndex: 'invitationStatus',
                width: '18%',
                render: (text, record) => {
                    return (
                        <div>
                            <Link href={{
                                pathname: '/invite/mine/edit-invite',
                                query: {id: record.invitationId,type:1},
                            }}>
                                <a>修改</a>
                            </Link>
                            <span className={'text-danger prl1'} onClick={()=>this.delDraft(record)}>删除</span>
                        </div>

                    );
                }
            }
        ];
	}

    componentDidMount() {
        this.queryMyInviteList();
    }


    queryMyInviteList = () => {
	    const { status,isEnable } = this.state;
        let params = {
            invitationType:'',
            userCode: this.state.userCode,
            city:'',
            province:'',
            status: !status?isEnable:status,
            parameter:this.state.title,//标题与编号
            pageNum: this.state.start,
            pageSize:20,
            startTime: this.state.startTime,
            endTime: this.state.endTime,
        };
        inviteListFun(params).then(res => {
            if (res.result === 'success') {
                this.setState({
                    inviteList: res.data.list,
                    total: res.data.count
                })
            }
        })
    };

    /**
     * 表格页码变化时的回调
     **/
    onCurPageChange = (page, pageSize) => {
        window.scrollTo(0, 0);
        this.setState({
            start: page - 1,
            current: page,
        }, () => {
            this.queryMyInviteList();
        });
    };

    /**
     * 改变询价单状态
     * 全部传""/比价中 0/已采购 1/已取消 2
     **/
    changeInviteStatus = (curStatus) => {
        this.setState({
        	status: curStatus,
        	start: 0,
        	current: 1
        }, () => {
        	this.queryMyInviteList();
        })
    };

    /**
     * 改变查询时间
     **/
    timeChange = (date, dateString) => {
        this.setState({
            startTime: dateString[0],
            endTime: dateString[1]
        })
    };

    /**
     * 改变招标状态
     **/
    statusChange = (value) => {
        this.setState({
            isEnable: value,
            start: 0,
            current: 1
        },()=>{
            //this.queryMyInviteList();
        })
    };

    /**
     * 搜索标题与编号
     **/
    titleChange = (e) => {
        this.setState({
            title: e.target.value
        })
    };
    /**
     * 草稿删除
     **/
    delDraft = (record) =>{
        this.setState({
            inviteId:record.invitationId,
            delModal:true
        })
    };
    delInviteDraft = () =>{
        delInviteDraftFun(this.state.inviteId).then(res =>{
            if(res.result === 'success'){
                this.setState({
                    delModal:false
                },()=>{
                    this.queryMyInviteList();
                })
            }else{
                message.error(res.msg)
            }
        })
    };
    /**
     * 清空查询
     **/
    cancelSearch = () =>{
        this.setState({
            title:'',
            startTime: '',//开始时间
            endTime: '',//结束时间
            status:'',
            start:0,
            isEnable:''
        },()=>{
            this.queryMyInviteList();
        })
    }
	render() {
		const {status,startTime,endTime} = this.state;
		return (
			<Layout title='我的招投标-招标' menuIndex={'1'} mainMenuIndex={'inquiry'}>
                <section className="bg-white">
                    <div className="my-invite-tab">
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('')}
                                className={status === '' ? 'active' : 'text-muted'}
                        >全部
                        </Button>
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('1')}
                                className={status === '1' ? 'active' : 'text-muted'}
                        >招标中</Button>
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('2')}
                                className={status === '2' ? 'active' : 'text-muted'}
                        >已开标</Button>
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('3')}
                                className={status === '3' ? 'active' : 'text-muted'}
                        >已定标</Button>
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('4')}
                                className={status === '4' ? 'active' : 'text-muted'}
                        >异常</Button>
                        <Button type="link" size='large' onClick={() => this.changeInviteStatus('6')}
                                className={status === '6' ? 'active' : 'text-muted'}
                        >草稿</Button>
                    </div>
                    <aside className="p3">
                        <div className="mt2">
                            <Input style={{width: '160px'}} size="default" placeholder="请输入招标标题/编号" onChange={this.titleChange} value={this.state.title}/>
                            <label style={{margin: '0 10px'}}>发布时间</label>
                            <RangePicker style={{width: '240px'}} size="default" onChange={this.timeChange}
                                         value={startTime && endTime ?[moment(startTime), moment(endTime)]:undefined}/>
                            {
                                !status ?
                                    <div className='show'>
                                        <span style={{marginLeft: '30px', marginRight: '10px'}}>招标状态</span>
                                        <Select style={{width: '120px'}} onChange={this.statusChange}
                                                value={this.state.isEnable?this.state.isEnable:'全部状态'}
                                        >
                                            <Option value="">全部状态</Option>
                                            <Option value="1">招标中</Option>
                                            <Option value="2">已开标</Option>
                                            <Option value="3">已定标</Option>
                                            <Option value="4">异常</Option>
                                        </Select>
                                    </div>
                                    :null
                            }
                            <Button type="primary" className='bg-primary-linear border-radius' style={{margin: '0 20px', width: '100px'}}
                                    onClick={this.queryMyInviteList}>查询</Button>
                            <Button type="primary" ghost  style={{width: '100px'}}
                                    onClick={this.cancelSearch}>清空</Button>
                        </div>
                        <div>
                            <Table ref="table"
                                   hideDefaultSelections={true}
                                   className="mt2 text-muted"
                                   rowKey={record => record.invitationId}
                                   columns={status==='6'?this.draftColumns:this.columns}
                                   pagination={false}
                                   dataSource={this.state.inviteList}
                            />
                            <div className="mt3 text-right">
                                <Pagination {...this.state.pagination} total={this.state.total}
                                            current={this.state.current} />
                            </div>
                        </div>
                    </aside>
                </section>
                <Modal visible={this.state.delModal}
                       width={400}
                       closable={false}
                       centered={true}
                       footer={null}
                >
                    <h2 className="text-center ptb4 mt4">确定删除？</h2>
                    <div className='text-center'>
                        <Button type="primary" size="large" className="bg-primary-linear border-radius" onClick={this.delInviteDraft}
                        style={{width:"120px"}}>确定</Button>
                        <Button size="large" type="primary" ghost  onClick={()=>this.setState({delModal: false})}
                                style={{width:"120px",margin:"0 20px"}}>取消</Button>
                    </div>
                </Modal>
			</Layout>
		);
	}
}

export default InviteIndex;
