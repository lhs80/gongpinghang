import React from 'react'
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/index'
import {Input} from 'antd'
import {
	bookChapterFun,
	bookParentTypeFun,
	bookContentFun,
	imageContentFun,
	queryBookNameByPostIdFun
} from 'server'
import './book.less'
import cookie from 'react-cookies';

const Search = Input.Search;

class BookContent extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		// this.bookId = this.props.router.query.id;
		this.state = {
			bookId: '',
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			childIsShowSearchSuggest: false,
			curChapter: 0,//当前选中的章节
			curParentType: -1,
			bookName: '',
			bookType: '',//this.props.router.query.id.indexOf('-t') >= 0 ? 'img' : 'book',//根据书籍ID判断是图集还是书籍
			chapterList: [],//章节列表
			parentType: [],//一级分类
			bookContent: []//整书内容
		}
	}

	componentDidMount() {
		this.bookChapter();
		this.getBookParentType();
		this.queryBookNameByPostId();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id) {
			this.bookChapter();
			this.getBookParentType();
			this.queryBookNameByPostId();
		}
	}


	bookChapter = () => {
		let bookId = this.props.router.query.id;
		bookChapterFun(bookId).then(res => {
			if (res.result === 'success') {
				this.setState({
					chapterList: res.data,
				}, () => {
					this.bookContent();
				})
			}
		})
	};

	queryBookNameByPostId = () => {
		let bookId = this.props.router.query.id;
		queryBookNameByPostIdFun(bookId).then(res => {
			if (res.result === 'success') {
				this.setState({
					bookName: res.data ? res.data.name : ''
				})
			}
		})
	};

	/**
	 * 文章正文
	 * */
	bookContent = () => {
		let bookType = this.props.router.query.id.indexOf('-t') >= 0 ? 'img' : 'book';
		let bookId = this.props.router.query.id;
		if (bookType === 'book') {
			bookContentFun(bookId).then(res => {
				if (res.result === 'success') {
					this.setState({
						bookContent: res.data,
						bookType: bookType
					})
				}
			})
		} else if (bookType === 'img') {
			imageContentFun(bookId).then(res => {
				if (res.result === 'success') {
					this.setState({
						bookContent: res.data
					})
				}
			})
		}
	};

	/**
	 * 章节改变
	 * */
	chapterChange = (index) => {
		this.setState({
			curChapter: index
		}, () => {
			this.bookContent();
		})
	};

	/**
	 * 一级分类
	 * */
	getBookParentType = () => {
		bookParentTypeFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					parentType: res.data,
					curParentType: this.props.router.query.type
				})
			}
		})
	};

	/**
	 * 全局搜索
	 **/
	onSearch = (value) => {
		if (value)
			Router.push({pathname: '/book/search', query: {keyword: value}});
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	/**
	 * 子组件中调用,显示对应的提示框
	 * */
	showTipOfInquiry = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	render() {
		const {parentType, chapterList, curChapter, bookContent, curParentType} = this.state;
		return (
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务" className="page-content linear-bgcolor">
				<section className="book-search-panel">
					<aside className="page-content-wrapper">
						<label className="text-white">查询：</label>
						<Search
							placeholder="按名称或编号搜索"
							onSearch={value => this.onSearch(value)}
							enterButton="查询"
							style={{width: '255px'}}
						/>
					</aside>
				</section>
				<section className="book-content bg-white">
					{/*一级分类*/}
					<aside>
						{parentType.map((item, index) => {
							return (
								<div key={index}
								     style={{width: `${100 / parentType.length}%`, display: 'inline-block'}}
								     className={`h3 ptb2 text-center ${item.id === Number(curParentType) ? 'bg-white text-primary' : 'bg-lightgrey text-darkgrey'}`}>
									<Link href={{pathname: '/book/index', query: {id: item.id}}}>{item.name}</Link>
								</div>
							)
						})}
					</aside>
					<aside className="book-content-panel">
						{/*章节列表*/}
						<div className="left">
							<h4 className="title">{this.state.bookName}</h4>
							<div className="mt3">
								{chapterList.map((item, index) => {
									return (
										<h5 key={index}
										    style={{borderBottom: 'dashed 1px #E6E6E6'}}
										    className={`ptb1 ${index === curChapter ? 'text-primary' : 'text-darkgrey'}`}
										    onClick={() => this.chapterChange(index)}
										>{item.chapters}</h5>
									)
								})}
							</div>
						</div>
						{/*正文内容 */}
						<div className="right">
							<div className="text-center large">{this.state.bookName}</div>
							{
								this.state.bookType === 'book' ?
									<div className="mt6" dangerouslySetInnerHTML={{__html: bookContent[curChapter] ? bookContent[curChapter].content : ''}} />
									:
									<img className="mt6" src={bookContent[curChapter] ? bookContent[curChapter].chaptersUrl[0] : ''} alt="" />
							}
						</div>
					</aside>
				</section>
			</Layout>
		)
	}
}

export default withRouter(BookContent)
