import React from 'react';
import {query} from "../api/axios"
import Card from "./Card"

class TradeList extends React.Component {

    state = {
        list: null,
        error: ""
    }

    componentDidMount() {

        query("/query", "getAllOrders", ["Order"])
            .then((response) => {
                console.log("TradeList::getAll= ", response.data)
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

        return this.state.list.map(trade => {
            return (
                <Card trade = {trade} key={trade.key}/>
            )
        })
    }
    renderError = () => {
        return (<div className="errorText">
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

export default TradeList;
