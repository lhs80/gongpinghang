// 我的投标
import React, {Component} from 'react';
import Link from 'next/link'
import Layout from 'components/Layout/myinvite'
import {Table,Input, Button, Pagination,Radio } from 'antd'
import {timestampToTime} from 'server';
import {bidListFun} from 'inviteApi';
import './style.less'
import cookie from "react-cookies";

const plainOptions = [
    { label: '招标中', value: '1' },
    { label: '已开标', value: '2' },
    { label: '已定标', value: '3' },
    { label: '异常', value: '4' },
];
class TenderIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
            bidList: [],
            status: '',//投标状态 0已投标，1已中标，2未中标，3无效投标，4已撤回
            invitationStatus:'',//招标状态 1 招标中 ，2已开标，3已定标，4异常
            start: 0,//起始页
            total: 0,
            keyword:'',
            pagination: {
                defaultPageSize: 16,
                showQuickJumper: true,
                onChange: this.onCurPageChange,
            },
            current: 1,
        };
        this.columns = [
            {
                title: '标书编号',
                dataIndex: 'invitationCode',
                width: '12%',
            }, {
                title: '招标标题',
                dataIndex: 'title',
                width: '20%',
            }, {
                title: '招标单位',
                dataIndex: 'companyName',
                width: '20%',
            },{
                title: '招标状态',
                dataIndex: 'invitationStatus',
                width: '10%',
                render: (text, record) => {
                    let result = '', name = '';
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
                        <span className={`text-darkgrey ${name}`}>{result}</span>
                    );
                }
            }, {
                title: '投标状态',
                dataIndex: 'bidStatus',
                width: '10%',
                render: (text) => {
                    let result = '',name = '';
                    switch (text){
                        case '0':
                            result = '已投标';name = 'text-primary';
                            break;
                        case '1':
                            result = '已中标';name = 'text-plus';
                            break;
                        case '2':
                            result = '未中标';name = 'text-primary';
                            break;
                        case '3':
                            result = '无效投标';name = 'text-danger';
                            break;
                        case '4':
                            result = '已撤回';name = 'text-muted';
                            break;
                    }
                    return (
                        <span className={`text-darkgrey ${name}`}>{result}</span>
                    );
                }
            },{
                title: '投标时间',
                width: '18%',
                render: (text, record) => {
                    return (
                        <i className="text-darkgrey">{timestampToTime(record.createTime)}</i>
                    );
                }
            }, {
                title: '操作',
                align: 'center',
                width: '10%',
                render: (text, record) => {
                    return (
                        <Link href={{pathname: '/invite/mine/my-bid-detail', query: {id: record.id,bidId:record.bidId}}}>
                            <a className='prl1'>查看</a>
                        </Link>

                    );
                }
            }
        ];
    }

    componentDidMount() {
        this.queryMyBidList();
    }


    queryMyBidList = () => {
        let params = {
            userCode: this.state.userCode,
            invitationStatus:this.state.invitationStatus,//标书状态
            bidStatus: this.state.status,//投标状态
            start: this.state.start,
            keyword:this.state.keyword
        };
        bidListFun(params).then(res => {
            if (res.result === 'success') {
                this.setState({
                    bidList: res.data.list,
                    total: res.data.count
                })
            }
        })
    };

    /**
     * 表格页码变化时的回调
     **/
    onCurPageChange = (page) => {
        window.scrollTo(0, 0);
        this.setState({
            start: page - 1,
            current: page,
        }, () => {
            this.queryMyBidList();
        });
    };

    /**
     * 改变投标状态
     * 全部传""/0已投标，1已中标，2未中标，3无效投标，4已撤回
     **/
    changeBidStatus = (curStatus) => {
        this.setState({
            status: curStatus,
            start: 0,
            current: 1
        }, () => {
            this.queryMyBidList();
        })
    };


    /**
     * 改变招标状态
     **/
    statusChange = (e) => {
        this.setState({
            invitationStatus: e.target.value,
        })
    };

    /**
     * 搜索标题与编号
     **/
    titleChange = (e) => {
        this.setState({
            keyword: e.target.value
        })
    };

    /**
     * 清空查询
     **/
    cancelSearch = () =>{
        this.setState({
            keyword:'',
            start:0,
            invitationStatus:''
        },()=>{
            this.queryMyBidList();
        })
    }
    render() {
        const {status} = this.state;
        return (
            <Layout title='我的招投标-投标' menuIndex={'2'} mainMenuIndex={'inquiry'}>
                <section className="bg-white">
                    <div className="my-invite-tab">
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('')}
                                className={status === '' ? 'active' : 'text-muted'}
                        >全部
                        </Button>
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('0')}
                                className={status === '0' ? 'active' : 'text-muted'}
                        >已投标</Button>
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('1')}
                                className={status === '1' ? 'active' : 'text-muted'}
                        >已中标</Button>
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('2')}
                                className={status === '2' ? 'active' : 'text-muted'}
                        >未中标</Button>
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('3')}
                                className={status === '3' ? 'active' : 'text-muted'}
                        >无效投标</Button>
                        <Button type="link" size='large' onClick={() => this.changeBidStatus('4')}
                                className={status === '4' ? 'active' : 'text-muted'}
                        >已撤回</Button>
                    </div>
                    <aside className="p3">
                        <div className="mt2">
                            <Input style={{width: '260px'}} size="default" placeholder="请输入招标标题/招标单位/编号"
                                   value={this.state.keyword} onChange={this.titleChange} />
                            <span style={{marginLeft: '30px', marginRight: '10px'}}>招标状态</span>
                            <Radio.Group onChange={this.statusChange} value={this.state.invitationStatus}>
                                <Radio value={'1'}>招标中</Radio>
                                <Radio value={'2'}>已开标</Radio>
                                <Radio value={'3'}>已定标</Radio>
                                <Radio value={'4'}>异常</Radio>
                            </Radio.Group>
                            <Button type="primary" className='bg-primary-linear border-radius' style={{margin: '0 20px', width: '100px'}}
                                    onClick={this.queryMyBidList}>查询</Button>
                            <Button type="primary" ghost  style={{width: '100px'}}
                                    onClick={this.cancelSearch}>清空</Button>

                        </div>
                        <div>
                            <Table ref="table"
                                   hideDefaultSelections={true}
                                   className="mt2 text-muted"
                                   rowKey={record => record.id}
                                   columns={this.columns}
                                   pagination={false}
                                   dataSource={this.state.bidList}
                            />
                            <div className="mt3 text-right">
                                <Pagination {...this.state.pagination} total={this.state.total}
                                            current={this.state.current} />
                            </div>
                        </div>
                    </aside>
                </section>
            </Layout>
        );
    }
}

export default TenderIndex;
