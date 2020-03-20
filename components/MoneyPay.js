import React from 'react'
import {Icon, Input, Modal, Button} from "antd";
import {userCodeFun, moneyPayFun} from 'server'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from "react-cookies";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
export default class MoneyPay extends React.Component {
  constructor(props) {
    super(props);
    this.userCode = cookie.load("ZjsWeb") ? cookie.load("ZjsWeb").userCode : 'guest';
    this.state = {
      mobile: '',
      phone: '',
      error: false,
      code2: true,
      code3: true,
      code4: true,
      codeValueLeft: '',
      codeValueCenter: '',
      codeValueMiddle: '',
      codeValueRight: ''
    }
  }

  componentDidMount() {
    this.getMobile()
  }

  /*----取消现金支付----*/
  closeMoneyPay = () => {
    this.setState({
      codeValueLeft: '',
      codeValueCenter: '',
      codeValueMiddle: '',
      codeValueRight: ''
    });
    let status = false;
    this.props.closeMoneyPay(status)
  };
  /*-------获取手机号码--------*/
  getMobile = () => {
    userCodeFun(this.userCode).then(res => {
      if (res.result === 'success') {
        let phone = res.data.mobile;
        let len = phone.length;
        let start = phone.substring(0, 3);
        let end = phone.substring((len - 2), len);
        this.setState({
          mobile: res.data.mobile,
          phone: start + '******' + end
        })
      }

    })
  };
  /*----验证码-----*/
  onChangeCodeLeft = (e) => {
    let self = this;
    this.setState({
      codeValueLeft: e.target.value,
    });
    if (e.target.value) {
      this.setState({
        code2: false
      }, () => {
        self.refs.codeCenter.focus()
      });
    } else {
      this.setState({
        code2: true
      });
    }
  };
  onChangeCodeCenter = (e) => {
    let self = this;
    this.setState({
      codeValueCenter: e.target.value,
    });
    if (e.target.value) {
      this.setState({
        code3: false
      }, () => {
        self.refs.codeMiddle.focus()
      });
    } else {
      this.setState({
        code3: true
      });
    }
  };
  onChangeCodeMiddle = (e) => {
    let self = this;
    this.setState({
      codeValueMiddle: e.target.value,
    });
    if (e.target.value) {
      this.setState({
        code4: false
      }, () => {
        self.refs.codeRight.focus()
      });
    } else {
      this.setState({
        code4: true
      });
    }
  };
  onChangeCodeRight = (e) => {
    this.setState({
      codeValueRight: e.target.value,
    });
    if (e.target.value) {
      this.setState({
        codeValueRight: e.target.value
      }, () => {
        this.validateSmsCodeFun()
      })

    }

  };
  /*-----验证校验----*/

  validateSmsCodeFun = () => {
    let code = this.state.codeValueLeft + this.state.codeValueCenter + this.state.codeValueMiddle + this.state.codeValueRight;
    let data = {
      userCode: this.userCode,
      productId: this.props.productId,
      verifyCode: code,
    };
    moneyPayFun(data).then(res => {
      if (res.result === 'success') {
        this.props.history.push(`/paysuccess`)
      } else {
        this.setState({
          error: true
        })
      }
    })
  };

  render() {
    return (
      <Modal visible={this.props.showMoneyPay}
             centered
             onCancel={this.closeMoneyPay}
             footer={[
               <Button key="submit" type="primary" size="large" onClick={this.closeMoneyPay}>
                 取消
               </Button>,
             ]}
      >
        <p className="prl6 mt3 h4 text-center">
          已向您的手机号码 <span style={{fontWeight: "bold"}}>{this.state.phone}</span>发送短信验证码，请输入验证码完成支付
        </p>
        <section className="payCode" style={{paddingLeft: "20px"}}>
          <Input maxLength={1} className="text-darkgrey" onChange={this.onChangeCodeLeft} value={this.state.codeValueLeft}/>
          <Input maxLength={1} className="text-darkgrey" disabled={this.state.code2}
                 onChange={this.onChangeCodeCenter} value={this.state.codeValueCenter} ref="codeCenter"/>
          <Input maxLength={1} className="text-darkgrey" disabled={this.state.code3}
                 onChange={this.onChangeCodeMiddle} value={this.state.codeValueMiddle} ref="codeMiddle"/>
          <Input maxLength={1} className="text-darkgrey" disabled={this.state.code4}
                 onChange={this.onChangeCodeRight} value={this.state.codeValueRight} ref="codeRight"/>
          {
            this.state.error ?
              <p className="h5 text-center mt2" style={{color: "#f5222d", margin: '0'}}>手机验证码不正确</p>
              : null
          }
        </section>
      </Modal>
    )
  }
}
