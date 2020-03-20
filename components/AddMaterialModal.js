/*----添加材料弹窗-----*/
import React from 'react'
import { Table ,Input ,Icon, Checkbox, Button, Pagination} from 'antd'
import { regularPurchaseFun, addShopInfo, shopCollectionFun} from 'server'
import {iconUrl, baseUrl} from "config/evn"
import axios from 'config/http'
import cookie from 'react-cookies';
const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
class EditableCell extends React.Component {
    state = {
        value: this.props.value
    }
    handleChange = (e) => {
        let value = '';
        if (e.target.value && isNaN(e.target.value)) {
            value = e.target.value.replace(/\D/g, '')
        } else if (e.target.value && e.target.value.indexOf(".") !== -1) {
            value = e.target.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
        } else if (e.target.value && e.target.value.indexOf("-") !== -1) {
            value = e.target.value.replace(/\D/g, '')
        } else if (e.target.value && e.target.value.indexOf(" ") !== -1) {
            value = e.target.value.replace(/\ +/g, "")
        } else {
            value = e.target.value
        }
        //const value = e.target.value;
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        this.setState({ value });
    };
    check = () => {
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    };
    render() {
        const { value } = this.state;
        return (
            <div className="editable-cell">
                <Input
                    value={value}
                    onChange={this.handleChange}
                    onPressEnter={this.check}
                />
            </div>
        );
    }
}
class AddMaterialModal extends React.Component{
    constructor(props){
        super(props);
        //选择材料
        this.columns = [{
            title: '名称',
            dataIndex: 'name',
            render:(name) => <div className="businessInfo">
                <div className="show">
                    <p className="title h5">{name}</p>
                </div>
            </div> ,
            width: 260,
        }, {
            title:'品牌',
            dataIndex: 'brand',
            width: 200,
        }, {
            title: '单位',
            dataIndex: 'unit',
            width: 170,
        }, {
            title: '数量',
            dataIndex: 'quantity',
            width: 200,
            render: (text, record, index) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(index, 'quantity')}
                />
            ),
        },{
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                const { enAdd } = this.state.regularData[index];
                return (
                    <div className="operationSeller">
                        {
                            enAdd
                                ?<IconFont type="iconfont-tianjiaadd73" onClick={() => this.addMaterial(index)}  className="add text-plus"/>
                                :<IconFont type="iconfont-jianqu" onClick={() => this.reduceMaterial(index)} className="add text-warning"/>
                        }
                    </div>
                );
            },
            width: 70,
        }
        ];
        //已选择材料table
        this.SelectColumns = [{
            title: '名称',
            dataIndex: 'name',
            render:(name) => <div className="businessInfo">
                <div className="show">
                    <p className="title h5">{name}</p>
                </div>
            </div> ,
            width: 260,
        }, {
            title:'品牌',
            dataIndex: 'brand',
            width: 200,
        }, {
            title: '单位',
            dataIndex: 'unit',
            width: 170,
        }, {
            title: '数量',
            dataIndex: 'quantity',
            render: (text, record, index) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(index, 'quantity')}
                />
            ),
            width: 200,
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <div className="operationSeller">
                        <IconFont type="iconfont-htmal5icon17" className="add" onClick={() => this.deleteData(text,record,index)}/>
                    </div>
                );
            },
            width: 70,
        }
        ];
        this.state = {
            //常购材料数据
            regularData: [],
            allData:[],
            loading: false,
            currentPage: 1,
            //选择的材料
            selectMaterialData:[],
            selectMaterialPage:[],
            sendMaterial: 'block',
            selectMaterial: 'none',
            totalResult:0,
            pageSize:16,
            selectCurrentPage:1,
            flag: true,
            userCode: cookie.load("ZjsWeb")?cookie.load("ZjsWeb").userCode?cookie.load("ZjsWeb").userCode:null:null,
        };
    }
    onCellChange = (index, key) => {
        return (value) => {
            const regularData = [...this.state.regularData];
            regularData[index][key] = value;
            this.setState({ regularData });
        };
    };
    /*---增加材料---*/
    addMaterial = (index) => {
        const { regularData, selectMaterialData } = this.state;
        selectMaterialData.push(regularData[index]);
        Object.keys(regularData[index]).forEach(() => {
            if (regularData[index] && typeof regularData[index].enAdd !== 'undefined') {
                regularData[index].enAdd = false;
            }
        });
        this.setState({
            regularData ,
            selectMaterialData
        });
    };
    /*----减少材料---*/
    reduceMaterial = (index) => {
        const { regularData, selectMaterialData } = this.state;
        let materialName = regularData[index].name;
        for(let j in selectMaterialData) {
            if(selectMaterialData[j].name === materialName){
                selectMaterialData.splice(j,1)
            }
        }
        Object.keys(regularData[index]).forEach(() => {
            if (regularData[index] && typeof regularData[index].enAdd !== 'undefined') {
                regularData[index].enAdd = true;
            }
        });
        this.setState({
            regularData,
            selectMaterialData
        });
    };
    /*----一选择材料删除---*/
    deleteData = (text,record,index) => {
        const { regularData, selectMaterialData,pageSize, selectCurrentPage} = this.state;
        const selectMaterialPage = [...this.state.selectMaterialPage];
        selectMaterialPage.splice(index,1);
        //把选择材料相对应的置为可添加状态
        for(let i in regularData){
            if(record.id === regularData[i].id){
                regularData[i].enAdd = true;
            }
        }
        /*----把已选择的材料相对应的删除----*/
        for(let i in selectMaterialData){
            if(record.id === selectMaterialData[i].id){
                selectMaterialData.splice(i,1)
            }
        }
        /*----把已选择材料的分页数据重新排--重新排过数据，渲染原来的页码数据----*/
        let selectMaterial = [];
        let page = (selectCurrentPage-1)*pageSize;
        //已选择材料可以现实的总页数
        let pageTotal = selectMaterial.length/pageSize;
        selectMaterialData.map((item,index) => {
            selectMaterial.push(item);
        });
        selectMaterial = selectMaterial.slice(page,page+pageSize);

        this.setState({
            selectMaterialPage: selectMaterial,
            selectMaterialData,
            regularData
        });
    };
    /*-----关闭模态框----*/
    closeModal = () => {
        let status = "none";
        this.props.showAddMaterial(status);
    };
    /*------发送商家提交商品-----*/
    submitMaterial = (e) => {
        e.preventDefault();
        let selectMaterialData = this.state.selectMaterialData;
        let status = "none";
        this.props.materialInfo(selectMaterialData,status)
    };
    /*-----此处再次写为了都是先出现添加商品Modal-(一选择商家提交后)--*/
    submitSellerFun = (e) => {
        e.preventDefault();
        let selectMaterialData = this.state.selectMaterialData;
        let status = "none";
        this.props.materialInfo(selectMaterialData,status);
        this.setState({
            selectMaterial: 'none',
            sendMaterial: 'block'
        })
    };
    /*-----点击已选择材料---*/
    selectMaterialInfo = (e) => {
        e.preventDefault();
        const {selectMaterialData,pageSize} = this.state;
        let selectMaterial = [];
        selectMaterialData.map((item,index) => {
            selectMaterial.push(item);
        });
        selectMaterial = selectMaterial.slice(0,pageSize);
        this.setState({
            selectMaterialPage: selectMaterial,
            sendMaterial: 'none',
            selectMaterial: "block"
        })
    };
    /*----继续添加商家----*/
    continueAdd = (e) => {
        e.preventDefault();
        this.setState({
            sendMaterial: 'block',
            selectMaterial: "none"
        })
    };
    /*----分页变化时----*/
    onPageChange(pageNumber){
        let start = pageNumber-1;
        let userCode = this.state.userCode;
        let regularDataFun = [];
        /*----常购材料---*/
        regularPurchaseFun(userCode,start).then(res => {
            if(res.result === 'success'){
                regularDataFun = res.data.resultList;
                for(let i in regularDataFun){
                    regularDataFun[i].enAdd = true;
                    regularDataFun[i].quantity = ''
                }
            }
            this.setState({
                regularData:regularDataFun,
                currentPage:pageNumber
            });
        })
    }
    /*----已选择材料分页变化---*/
    selectPageChange(pageNumber){
        const {selectMaterialData,pageSize} = this.state;
        let page = (pageNumber-1)*pageSize;
        let selectMaterial = [];
        selectMaterialData.map((item,index) => {
            selectMaterial.push(item);
        });
        selectMaterial = selectMaterial.slice(page,page+pageSize);
        this.setState({
            selectMaterialPage: selectMaterial,
            selectCurrentPage:pageNumber
        })
    }
    componentDidMount(){
        let start = 0;
        let userCode = this.state.userCode;
        let regularDataFun = [];
        /*----常购材料---*/
        regularPurchaseFun(userCode,start).then(res => {
             if(res.result === 'success'){
                 regularDataFun = res.data.resultList;
                 for(let i in regularDataFun){
                     regularDataFun[i].enAdd = true;
                     regularDataFun[i].quantity = ''
                 }
             }
             this.setState({
                regularData:regularDataFun,
                totalResult: res.data?res.data.totalCount:0
             });
         })
    }
    render() {
        const { selectMaterialData,selectMaterialPage,selectCurrentPage,currentPage,pageSize } = this.state;
        return(
            <div>
                <section className="addBusiness" style={{display: this.props.isShowAddMaterial,zIndex:"10000"}}>
                    <div className="sellerWrapper commonWrapper">
                        <IconFont type="iconfont-guanbi" className="closeBtn" onClick={this.closeModal.bind(this)}/>
                        <div style={{display: this.state.sendMaterial}}>
                            <h2 className="text-center">选择材料</h2>
                            <Table columns={this.columns} dataSource={this.state.regularData} className="mt3 addSellerTable"
                                   scroll={{ y: 300 }} pagination={false} rowKey={record => record.id}/>
                            {/*---分页---*/}
                            <section className="Compagination text-center mt2" style={{margin:"auto"}}>
                                {
                                    this.state.totalResult > pageSize
                                        ?
                                        <Pagination showQuickJumper current={currentPage} total={this.state.totalResult} pageSize={ this.state.pageSize }
                                                    onChange={ this.onPageChange.bind(this)}/>
                                        :null
                                }
                            </section>
                            <div className="text-right">
                                <Button style={{marginRight: "16px"}} className="selectSeller" onClick={this.selectMaterialInfo.bind(this)}>
                                    已选择材料{
                                    selectMaterialData.length >0
                                        ? selectMaterialData.length
                                        :''
                                }
                                </Button>
                                <Button type="primary" style={{width: "120px"}} onClick={this.submitMaterial.bind(this)}
                                        disabled={this.state.selectMaterialData.length<=0?true:''}>完成</Button>
                            </div>
                        </div>
                        <div style={{display:this.state.selectMaterial}}>
                            <h2 className="text-center">
                                已选择材料
                                {
                                    selectMaterialData.length >0
                                        ?
                                        <span>({selectMaterialData.length})</span>
                                        :''
                                }
                            </h2>
                            <Table columns={this.SelectColumns} dataSource={selectMaterialPage} className="mt3 addSellerTable"
                                   scroll={{ y: 300 }} pagination={false} rowKey={record => record.id}/>
                            {/*---分页---*/}
                            <section className="Compagination text-center mt2" style={{margin:"auto"}}>
                                {
                                    selectMaterialData.length >0
                                        ?
                                        <Pagination showQuickJumper current={selectCurrentPage} total={selectMaterialData.length} pageSize={ this.state.pageSize }
                                                    onChange={ this.selectPageChange.bind(this)}/>
                                        :null
                                }
                            </section>
                            <div className="text-right">
                                <Button style={{marginRight: "16px"}} className="selectSeller" onClick={this.continueAdd.bind(this)}>
                                    继续添加
                                </Button>
                                <Button type="primary" style={{width: "120px"}} onClick={this.submitSellerFun.bind(this)}
                                        disabled={this.state.selectMaterialData.length<=0?true:''}>完成</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

        )
    }
}
export default AddMaterialModal
