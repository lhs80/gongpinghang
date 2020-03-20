import React from 'react'
import {Input} from 'antd'

export default class NumericInput extends React.Component {
	constructor(props) {
		super(props);
		this.inputList = [];
		this.state = {
			smsCode: [],
		}
	}


	componentDidMount() {
		this.inputList = document.querySelectorAll('.input-group-item');
	}

	componentWillReceiveProps(nextProps){
		if(nextProps.reset===1){
			this.setState({
				smsCode: []
			})
		}
	}

	changeInputIndex = () => {
		let index = this.state.smsCode.length;
		if (index >= 4)
			index--;
		this.inputList[index].focus()
	};

	onChange = (e) => {
		const {value} = e.target;
		const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
		let code = this.state.smsCode;
		if ((!Number.isNaN(value) && reg.test(value))) {
			code.push(value);
			this.setState({
				smsCode: code
			}, () => {
				let index = this.state.smsCode.length;
				if (index >= 4) {
					index--
				}
				this.inputList[index].focus();
				this.props.onChange(this.state.smsCode.join(''));
			});
		}
	};

	keyDown = (event) => {
		let keyCode = event.keyCode;
		if (keyCode === 8) {
			let code = this.state.smsCode;
			code.pop();
			this.setState({
				smsCode: code
			}, () => {
				let index = this.state.smsCode.length;
				if (index < 0) {
					index = 0;
				}
				this.inputList[index].focus();
				this.props.onChange(this.state.smsCode.join(''));
			})
		}
	};

	onBlur = () => {
		const {value, onBlur, onChange} = this.props;
		if (value) {
			if (value.charAt(value.length - 1) === '.' || value === '-') {
				onChange(value.slice(0, -1));
			}
			if (onBlur) {
				onBlur();
			}
		}
	};

	render() {
		let inputGroup = (length) => {
			let input_group = [];
			for (let i = 0; i < 4; i++) {
				input_group.push(
					<Input
						{...this.props}
						onClick={this.changeInputIndex}
						onChange={this.onChange}
						onBlur={this.onBlur}
						onKeyDown={this.keyDown}
						autoFocus={i === 0}
						key={i}
						maxLength={1}
						className="input-group-item"
						value={this.state.smsCode[i]}
					/>
				)
			}
			return input_group;
		};
		return (
			<div>{inputGroup(this.props.length)}</div>
		);
	}
}
