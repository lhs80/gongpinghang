// 用户中心
import React from 'react'
import Layout from 'components/Layout/account'
import {Avatar, Col, Icon, Row, Table} from "antd";
import UserInfoPanel from '../components/UserInfoPanel/'
import {iconUrl, baseUrl} from 'config/evn'
import {queryMyInquiryAccountFun, timestampToTime} from 'server'
import cookie from "react-cookies";
// import FixedTool from 'component/FixedTool/'

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MyInquiryAccount extends React.Component {
  constructor(props) {
    super(props);
    this.userCode = cookie.load("ZjsWeb") ? cookie.load("ZjsWeb").userCode : 'guest';
    this.columns = [{
      title: '标题',
      key: 'name',
      dataIndex: 'name',
    }, {
      title: '询价次数',
      key: 'record',
      dataIndex: 'record',
    }, {
      title: '变动时间',
      key: 'createTime',
      dataIndex: 'createTime',
      render: (text, record) => {
        return (
          <i>{timestampToTime(text)}</i>
        )
      }
    }];
    this.pagination = {
      hideOnSinglePage: true,
      defaultPageSize: 16,
      showQuickJumper: true,
      total: 0,
      onChange: this.onCurPageChange
    };
    this.state = {
      accountList: [],
      curPage: 0
    }
  }

  componentDidMount() {
    this.queryMyInquiryAccount();
  }

  /**
   * 查询账户变动记录
   * */
  queryMyInquiryAccount() {
    queryMyInquiryAccountFun(this.userCode, this.state.curPage).then(res => {
      if (res.result === "success") {
        this.setState({
          accountList: res.data.resultList,
          pagination: {
            total: res.data.totalCount
          }
        })
      }
    })
  }

  /**
   * 表格页码变化时的回调
   **/
  onCurPageChange = (page, pageSize) => {
    this.setState({
      curPage: page - 1
    }, () => {
      this.queryMyInquiryAccount();
    });
  };

  render() {
    return (
      <Layout menuIndex={'6'} mainMenuIndex={'home'} title="我的询价账户">
        {/*用户信息*/}
        <UserInfoPanel type={2}/>
        <aside className="prl3 bg-white" style={{marginTop: "16px"}}>
          <h4 className="text-grey  ptb2">账户变动记录</h4>
          <Table
            columns={this.columns}
            dataSource={this.state.accountList}
            pagination={this.pagination}
            rowKey={record => record.id}
          />
        </aside>
        {/*在线客服意见反馈*/}
        {/*<FixedTool/>*/}
      </Layout>
    )
  }
}
