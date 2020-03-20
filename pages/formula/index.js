import React from 'react'
import Layout from 'components/Layout/index'
import {Input, Button, Form} from 'antd'
import BigNumber from 'bignumber.js'
import './style.less'
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {span: 5},
  wrapperCol: {span: 19},
};

class FormulaIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModalOfType: 0,//根据用户询价状态显示对应的提示框
      childIsShowSearchSuggest: false,
      type: '',//公式的类型,
      result: 0,
      formulaList: [
        {
          name: '钢管理论重量计算',
          type: 1,
          form: [
            {name: '外径', unit: 'd(mm)', key: 'long', rules: [{required: true, message: `请输入外径`}]},
            {name: '壁厚', unit: 's(mm)', key: 'deep', rules: [{required: true, message: `请输入壁厚`}]}
          ],
          unit: 'kg/m',
          formula: '(values.long-values.deep)*values.deep*0.02466'
        },
        {
          name: '钢板理论重量计算',
          type: 2,
          form: [
            {name: '长', unit: 'h(mm)', key: 'long', rules: [{required: true, message: `请输入长`}]},
            {name: '宽', unit: 'd(mm)', key: 'width', rules: [{required: true, message: `请输入宽`}]},
            {name: '厚', unit: 's(mm)', key: 'deep', rules: [{required: true, message: `请输入厚`}]}
          ],
          formula: 'values.long*values.width*values.deep*7.85',
          unit: 'kg'
        },
        {
          name: '螺纹钢理论重量计算',
          type: 3,
          form: [{name: '断面直径', unit: 'd(mm)', key: 'diameter', rules: [{required: true, message: `请输入断面直径`}]}],
          formula: 'values.diameter*values.diameter*0.00617',
          unit: 'kg/m'
        },
        {
          name: '圆钢盘条理论重量计算',
          type: 4,
          form: [{name: '直径', unit: 'd(mm)', key: 'diameter', rules: [{required: true, message: `请输入直径`}]}],
          formula: 'values.diameter*values.diameter*0.006165',
          unit: 'kg/m'
        },
        {
          name: '方钢理论重量计算',
          type: 5,
          form: [{name: '边宽', unit: 'a(mm)', key: 'width', rules: [{required: true, message: `请输入边宽`}]}],
          formula: 'values.width*values.width*0.00785',
          unit: 'kg/m'
        },
        {
          name: '扁钢理论重量计算',
          type: 6,
          form: [
            {name: '边宽', unit: 'b(mm)', key: 'width', rules: [{required: true, message: `请输入边宽`}]},
            {name: '厚度', unit: 'd(mm)', key: 'deep', rules: [{required: true, message: `请输入厚度`}]}
          ],
          formula: 'values.width*values.deep*0.00785',
          unit: 'kg/m'
        },
        {
          name: '六角钢理论重量计算',
          type: 7,
          form: [
            {name: '对边距离', unit: 's(mm)', key: 'distance', rules: [{required: true, message: `请输入对边距离`}]}
          ],
          formula: 'values.distance*values.distance*0.006798',
          unit: 'kg/m'
        },
        {
          name: '八角钢理论重量计算',
          type: 8,
          form: [{name: '对边距离', unit: 's(mm)', key: 'distance', rules: [{required: true, message: `请输入对边距离`}]}],
          formula: 'values.distance*values.distance*0.0065',
          unit: 'kg/m'
        },
        {
          name: '黄铜管理论重量计算',
          type: 9,
          form: [
            {name: '外径', unit: 'd(mm)', key: 'diameter', rules: [{required: true, message: `请输入外径`}]},
            {name: '壁厚', unit: 's(mm)', key: 'deep', rules: [{required: true, message: `请输入壁厚`}]}
          ],
          formula: '(values.diameter-values.deep)*values.deep*0.0267',
          unit: 'kg/m'
        },
        {
          name: '紫铜管理论重量计算',
          type: 10,
          form: [
            {name: '外径', unit: 'd(mm)', key: 'diameter', rules: [{required: true, message: `请输入外径`}]},
            {name: '壁厚', unit: 's(mm)', key: 'deep', rules: [{required: true, message: `请输入壁厚`}]}
          ],
          formula: '(values.diameter-values.deep)*values.deep*0.02796',
          unit: 'kg/m'
        },
        {
          name: '原木体积计算',
          type: 11,
          form: [
            {name: '检尺长', unit: 'L(mm)', key: 'long', rules: [{required: true, message: `请输入检尺长`}]},
            {
              name: '检尺径',
              unit: 'D(cm)',
              key: 'diameter',
              rules: [{required: true, message: `请输入检尺径`}, {validator: this.cusCheck}]
            }
          ],
          formula: [
            '0.00007854*values.long*Math.pow(parseFloat(parseFloat(values.diameter) + 0.45 * parseFloat(values.long) + 0.2),2)',
            '0.00007854*values.long*Math.pow(parseFloat([parseFloat(values.diameter)+parseFloat(0.5*values.long)+parseFloat(0.005*Math.pow(parseFloat(values.long),2))+parseFloat(0.000125*values.long*Math.pow(parseFloat(14-values.long),2)*(values.diameter-10))]),2)'
          ],
          unit: 'm<sup>3</sup>'
        },
      ]
    }
  }

  componentDidMount() {
    this.setState({
      type: this.state.formulaList[0].type,
    })
  }

  onFoumulaChange = (item) => {
    this.setState({
      type: item.type,
      result: 0
    }, () => {
      this.props.form.resetFields();
    })
  };

  //自定义原木体积检尺径验证规则
  cusCheck = (rule, value, callback) => {
    if (!(value < 4 || value == 13)) {
      callback();
      return;
    }
    callback('检尺径应在4-12之间，或大于等于14');
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {formulaList, type} = this.state;
    let tempResult = 0, self = this;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (type === 11) {
          if (values.diameter >= 4 && values.diameter <= 12) {
            tempResult = new BigNumber(eval(formulaList[type - 1].formula[0]));
          } else if (values.diameter >= 14) {
            tempResult = new BigNumber(eval(formulaList[type - 1].formula[1]))
          }
          tempResult = new BigNumber(tempResult).toFormat(10);
        } else {
          tempResult = eval(formulaList[type - 1].formula);
          tempResult = new BigNumber(tempResult).toFormat(10);
        }
        this.setState({
          result: tempResult
        })
      }
    });
  };

  render() {
    const {formulaList, type, result} = this.state;
    const {getFieldDecorator} = this.props.form;
    const GetFormItem = type > 0
      ? formulaList[type - 1].form.map((item, index) => {
        return (
          <FormItem label={item.name} {...formItemLayout} key={index}>
            {getFieldDecorator(`${item.key}`, {
              validateTrigger: 'onBlur',
              rules: [...item.rules, {
                pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
                message: `${item.name}不能输入0或负数`
              }]///^0?([1-9][0-9]*)(\.[0-9]*)?$/
            })(
              <Input size="large" suffix={item.unit}/>
            )}
          </FormItem>
        )
      })
      :
      null;
    return (
      <Layout>
        <section className="page-content bg-img-formula" style={{height: '896px'}}>
          <section className="page-content-wrapper ptb5">
            <div className="text-center text-white mt6" style={{fontSize: '40px'}}>材料公式 —— 快速出结果</div>
            <aside className="formula-panel mt3">
              {/*分类*/}
              <div className="left" style={{padding: '32px 0'}}>
                {
                  formulaList.map((item, index) => {
                    return (
                      <h4 key={index}
                          className={`item ${item.type === type ? 'active' : ''}`}
                          onClick={() => {
                            this.onFoumulaChange(item)
                          }}
                      >{item.name}</h4>
                    )
                  })
                }
              </div>
              {/*计算表单*/}
              <div className="right">
                <h1 className="text-center mt6">{type > 0 ? formulaList[type - 1].name : ''}</h1>
                <Form
                  className="mt4"
                  onSubmit={this.handleSubmit}
                  style={{width: '343px', margin: '0 auto'}}>
                  {GetFormItem}
                  <FormItem
                    wrapperCol={{
                      xs: {span: 24, offset: 0},
                      sm: {span: 19, offset: 5},
                    }}>
                    <Button type="primary" size="large" htmlType="submit" block>计算</Button>
                  </FormItem>
                </Form>
                <h4 className="text-center mt5 text-darkgrey">
                  <span>计算结果</span>
                  <span className="result">{result}</span>
                  <span dangerouslySetInnerHTML={{__html: type > 0 ? formulaList[type - 1].unit : ''}}/>
                </h4>
              </div>
            </aside>
          </section>
        </section>
        {/*根据用户询价状态显示对应的提示框*/}
      </Layout>
    )
  }
}

FormulaIndex = Form.create()(FormulaIndex);
export default FormulaIndex;

