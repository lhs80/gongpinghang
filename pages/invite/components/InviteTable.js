import React from 'react'
import cookie from 'react-cookies';

function InviteTableItem(props) {
    let result = [];
    if (props.inviteTable){
        for (let i = 0; i < props.inviteTable.length; i += 2) {
            if (props.inviteTable[i]) {
                result.push(
                    <tr key={i}>
                        <td>{props.inviteTable[i] ? props.inviteTable[i].key : ''}</td>
                        <td>{props.inviteTable[i] ? props.inviteTable[i].value : ''}</td>
                        <td>{props.inviteTable[i + 1] ? props.inviteTable[i + 1].key : ''}</td>
                        <td>{props.inviteTable[i + 1] ? props.inviteTable[i + 1].value : ''}</td>
                    </tr>
                )
            }
        }
    };

    return result
}

export default class InviteTable extends React.Component {
    constructor(props) {
        super(props);
        this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
        this.state = {}
    }

    componentDidMount() {

    }

    render() {
        return (
            <table className='inviteTable mt2'>
                <tbody>
                <InviteTableItem inviteTable={this.props.inviteTable}/>
                </tbody>
            </table>

        )
    }
}
