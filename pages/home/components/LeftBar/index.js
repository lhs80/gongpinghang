import React, {Component, Fragment} from 'react';
import './style.less'
import {FloorText} from 'config/data'

class LeftBarForIndex extends Component {
	render() {
		return (
			<Fragment>
				{
					this.props.showBar ?
						<ul className='bar-wrapper'>
							{
								FloorText.map((item, index) => {
									return <li key={index} className={`${this.props.curFloot === `floor${index + 1}` ? 'text-primary' : ''}`}>
										<a href={`#floor${index + 1}`}>{item}</a>
									</li>
								})
							}
							<li onClick={this.props.goToTop} className="bg-white">
								<a>顶部</a>
							</li>
						</ul>
						:
						null
				}
			</Fragment>
		);
	}
}

export default LeftBarForIndex;

{/*<li className={`${this.props.curFloot === 'floor2' ? 'text-primary' : ''}`}>*/
}
{/*<a href="#floor2">办公耗材</a>*/
}
{/*</li>*/
}
{/*<li className={`${this.props.curFloot === 'floor3' ? 'text-primary' : ''}`}>*/
}
{/*<a href="#floor3">紧固密封</a>*/
}
{/*</li>*/
}
{/*<li className={`${this.props.curFloot === 'floor4' ? 'text-primary' : ''}`}>*/
}
{/*<a href="#floor4">仪表仪器</a>*/
}
{/*</li>*/
}
{/*<li className={`${this.props.curFloot === 'floor5' ? 'text-primary' : ''}`}>*/
}
{/*<a href="#floor5">电气照明</a>*/
}
{/*</li>*/
}
{/*<li>*/
}
{/*<a href="#floor6" className={`${this.props.curFloot === 'floor6' ? 'text-primary' : ''}`}>管泵阀门</a>*/
}
{/*</li>*/
}

