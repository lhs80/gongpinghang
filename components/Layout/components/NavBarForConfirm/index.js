import React from 'react'
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import {Icon, Menu, Input, Layout, Button} from 'antd'
import {iconUrl} from 'config/evn'
import {queryMaterialByKeyWord,} from 'server'
import MaterialKind from 'components/Material-Kind/'
import AddInquiry from 'components/AddInquiry/index'
import cookie from 'react-cookies'
import './style.less'

const {Header} = Layout;
const Search = Input.Search;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});


class IndexHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showKinds: false,
			token: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').token : null,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			selectCity: cookie.load('city') ? cookie.load('city') : '苏州',
			keyWord: this.props.searchKey,
			fuzzySearchResultList: [],
			isShowSearchSuggest: this.props.controlSearchSuggest, //是否显示联想词面板
			showTypeList: false,//显示分类列表
			showSearchType: false,//显示搜索类型
			fixedSearch: false,
			count: '',
			searchType: this.props.searchType//搜索类型 p商品; c商家
		}
	}


	componentDidMount() {
		this.setState({
			showKinds: Router.router.route !== '/'
		})
		this.affixHeader()
	}

	componentWillReceiveProps() {
		// this.setState({
		// 	isShowSearchSuggest: this.props.controlSearchSuggest
		// });
	}

	affixHeader = () => {
		//滚动条滚动到最底端，搜索框固定在最上面
		window.addEventListener('scroll', () => {
			let scrollTopValue = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			let heightValue = document.body.clientHeight;
			let srcollHeight = document.body.scrollHeight;
			let screenHeight = window.screen.height;

			if (scrollTopValue >= heightValue) {
				this.setState({
					fixedSearch: true
				})
			} else {
				this.setState({
					fixedSearch: false
				})
			}
		});
	}
	/**
	 * 搜索值变化时显示关键字面板
	 * */
	searchOnChange = (e) => {
		if (!e.target.value) return false
		this.setState({
			keyWord: e.target.value,
			isShowSearchSuggest: false
		}, () => {
			queryMaterialByKeyWord(this.state.keyWord.trim(), this.state.selectCity).then(res => {
				if (res.result === 'success') {
					this.setState({
						fuzzySearchResultList: res.data ? res.data.list : [],
						isShowSearchSuggest: true
					});
				}
			});
		});
	};

	/**
	 * 在搜索框中点击回车或点击搜索按钮的事件
	 * */
	search = (value) => {
		this.setState({
			isShowSearchSuggest: false
		});
		//替换掉空格
		let keyword = value.replace(/^\s+|\s+$/g, '');
		if (keyword) {
			console.log(this.props.searchType);
			if (this.props.searchType === 'p') {
				let pathname = '/searchMaterial';
				let state = {typeId: 1, keyword: keyword, classId: ''};
				Router.push({
					pathname: '/search/material',
					query: {
						keyword: keyword
					}
				});
			} else if (this.state.searchType === 'c')
				Router.push({
					pathname: '/search/business',
					query: {
						keyword: keyword
					}
				});
		}
	};

	/**
	 * 搜索材料
	 * */
	onSearchMaterialClick = (word) => {
		this.setState({
			isShowSearchSuggest: false
		});
		Router.push({
			pathname: '/search/material',
			query: {
				type: 0,
				keyword: word
			}
		});
	};

	render() {
		const {state} = this.props;
		return (
			<Header className="page-head page-head-small">
				<aside className="page-head-wrapper">
					<section className={`${this.state.fixedSearch ? 'page-head-searchFixed' : ''}`}>
						<div className="page-head-search maxWidth">
							<div className="page-head-search-left">
								<a href="/" target="_blank" className="page-head-search-left">
									<i className="icon-logo" />
								</a>
							</div>
						</div>
					</section>
				</aside>
			</Header>
		)
	}
}

export default withRouter(IndexHeader);
