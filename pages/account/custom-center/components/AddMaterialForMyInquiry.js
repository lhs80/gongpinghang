//手机密码登录
import React from 'react'
import {Select, Form, Input, Modal, Row, Col, Button} from "antd";
import {addOftenMaterialFun, unitListFun} from 'server'
import cookie from "react-cookies";

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {span: 4},
  wrapperCol: {span: 20},
};

class AddMaterialForMyInquiry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitEnable: false,
      units: [],
      userCode: cookie.load("ZjsWeb") ? cookie.load("ZjsWeb").userCode : 'guest',
    }
  }

  componentDidMount() {
    this.queryMaterialUnit();
  }

  /**
   * 材料单位列表
   * */
  queryMaterialUnit() {
    unitListFun().then(res => {
      if (res.result === "success") {
        this.setState({
          units: res.data
        })
      }
    })
  };

  /**
   * 提交表单
   */
  addMaterial = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitEnable: true
        });
        let params = {
          userCode: this.state.userCode,
          unit: values.unit,
          name: values.name,
          brand: values.brand,
        };
        addOftenMaterialFun(params).then(res => {
          if (res.result === "success") {
            this.setState({
              submitEnable: false
            });
            this.props.form.resetFields();
            this.props.close();
          }
        });
      }
    });
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Modal visible={this.props.show}
             okText='添加'
             cancelText='取消'
             onCancel={() => this.props.close()}
             centered={true}
             footer={[
               <Button key="cancel" onClick={this.props.close}>取消</Button>,
               <Button key="submit" type="primary" htmlType="submit" onClick={this.addMaterial} loading={this.state.submitEnable}>添加</Button>
             ]}
      >
        <h3 className="text-grey text-center mt2">添加常购材料</h3>
        <Form className="mt4">
          <FormItem label="材料名称" {...formItemLayout}>
            {getFieldDecorator('name', {
              rules: [
                {required: true, message: '请输入材料名称',whitespace: true },
              ],
            })(
              <Input size="large" placeholder="请填写准确的材料名称及规格型号，必填" maxLength={30} />
            )}
          </FormItem>
          <FormItem label="品牌" {...formItemLayout}>
            {getFieldDecorator('brand', {
              // rules: [{required: true, message: '请输入品牌'}],
            })(
              <Input size="large" placeholder="不填视为没有要求(选填)" maxLength={15}/>
            )}
          </FormItem>
          <FormItem{...formItemLayout} label="单位">
            {getFieldDecorator('unit', {
              rules: [
                {required: true, message: '请选择单位'},
              ],
            })(
              <Select placeholder="请选择">
                {
                  this.state.units.map((item, index) => {
                    return (
                      <Option value={item} key={index}>{item}</Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

AddMaterialForMyInquiry = Form.create()(AddMaterialForMyInquiry);
export default AddMaterialForMyInquiry;
