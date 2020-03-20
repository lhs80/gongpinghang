// 更多招标信息
import React, {Component} from 'react';
import {Table, Row, Col, Button, Modal, message} from 'antd'
import {baseUrl} from 'config/evn'
import {stopInviteFun, winningBidFun} from 'inviteApi'

class InviteInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inviteList: [],
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
                width: '18%',
                dataIndex: 'specsModels',
                render: (text) => {
                    return (
                        <span className="text-darkgrey">{text ? text : '--'}</span>
                    );
                }
            },
            {
                title: '数量',
                width: '18%',
                render: (text, record) => {
                    return (
                        <span className="text-darkgrey">{record.quantity}</span>
                    );
                }
            },
            {
                title: '单位',
                width: '18%',
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
            }
        ];
    }

    componentDidMount() {

    }

    render() {
        const {inviteInfo} = this.props;
        return (
            <div className='p4'>
                <div className="invite-detail-sub-title">招标明细</div>
                <aside className='invite-detail-content'>
                    <div><label>标的物类型：</label><span>{inviteInfo ? inviteInfo.materialType : ''}</span></div>
                    <div className='mt1'><label>标的物明细：</label></div>
                    <Table ref="table"
                           hideDefaultSelections={true}
                           className="mt2"
                           rowKey={record => record.materialsId}
                           columns={this.columns}
                           pagination={false}
                           dataSource={inviteInfo ? inviteInfo.materials : []}
                    />
                    <div className='mt2'><label>报价方式：</label><span>{inviteInfo ? inviteInfo.quotingWay : ''}</span></div>
                    <Row className='mt1'>
                        <Col span={4} className='leftLabel'>支付说明：</Col>
                        <Col span={20} className='text-black'>{inviteInfo ? inviteInfo.paymentInstructions : ''}</Col>
                    </Row>
                    <div className='mt1'><label>需要送样：</label><span>{inviteInfo && !inviteInfo.isSpecimen ? '不需要' : '需要'}</span>
                    </div>
                    <div className='mt1'><label>送货上门：</label><span>{inviteInfo && !inviteInfo.isDelivery ? '不需要' : '需要'}</span>
                    </div>
                    <div className='mt1'>
                        <label>收货地址：</label>
                        <span>
                {inviteInfo ? inviteInfo.receiverProvince : ''}{inviteInfo ? inviteInfo.receiverCity : ''}{inviteInfo ? inviteInfo.receiverArea : ''}{inviteInfo ? inviteInfo.receiverAddress : ''}
            </span>
                    </div>
                    <div className='mt1'><label>联系人：</label><span>{inviteInfo ? inviteInfo.linkman : ''}</span></div>
                    <div className='mt1'><label>联系电话：</label><span>{inviteInfo ? inviteInfo.phone : ''}</span></div>
                </aside>
                <div className="invite-detail-sub-title mt4">招标人介绍</div>
                <aside className='invite-detail-content'>
                    <div className='text-muted'>招标单位介绍：</div>
                    <Row className='mt1'>
                        <Col span={6} className='inviteImg '>
                            <img
                                src={inviteInfo && inviteInfo.companyImage ? baseUrl + inviteInfo.companyImage : '/static/images/notData.png'}
                                alt=""/>
                        </Col>
                        <Col span={18} className='text-black'>{inviteInfo ? inviteInfo.companyDesc : ''}</Col>
                    </Row>
                    <div className='text-muted mt2'>项目介绍：</div>
                    <Row className='mt1'>
                        <Col span={6} className='inviteImg '>
                            <img
                                src={inviteInfo && inviteInfo.projectImage ? baseUrl + inviteInfo.projectImage : '/static/images/notData.png'}
                                alt=""/>
                        </Col>
                        <Col span={18} className='text-black'>{inviteInfo ? inviteInfo.projectDesc : ''}</Col>
                    </Row>
                </aside>
                {(() => {
                    if (inviteInfo && inviteInfo.attachmentList && inviteInfo.attachmentList.length > 0) {
                        return (
                            <section>
                                <div className="invite-detail-sub-title mt4">附件上传</div>
                                {
                                    inviteInfo.attachmentList.map((item, index) => {
                                        return (
                                            <div key={index} className={'prl2'}>
                                                <a href={baseUrl + item.filePath} className='text-primary'>{item.fileName}</a>
                                            </div>
                                        )
                                    })
                                }
                            </section>
                        )

                    }
                })()}
            </div>
        );
    }
}

export default InviteInfo;
