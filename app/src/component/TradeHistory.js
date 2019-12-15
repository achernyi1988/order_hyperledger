import React from 'react';
import {query} from "../api/axios"
import HistoryCard from "./HistoryCard"

class TradeHistory extends React.Component {

    state = {
        list: null,
        error: ""
    }

    componentDidMount() {
        this.id = (this.props.match.params.id);

        query("/query", "getHistoryByKey", [this.id])
            .then((response) => {
                console.log("getHistoryByKey::get= ", response.data)
                this.setState({list: response.data, error: ""})
            })
            .catch ((error) => {
                console.log(error.toString());
                this.setState({error:error.toString()})
            })

    }

    renderList = () => {
        if (!this.state.list) {
            return null;
        }

        return this.state.list.map( (tx, index) => {
            return (
                <HistoryCard trade = {tx.value} key={index}/>
            )
        })
    }
    renderError = () => {
        return (<div>
            {this.state.error}
        </div>)
    }

    render() {
        return (
            <div className="ui container">
                {this.renderError()}
                {this.renderList()}
            </div>
        );


    }
}

export default TradeHistory;
