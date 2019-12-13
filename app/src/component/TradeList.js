import React from 'react';
import {Link} from "react-router-dom"
import axios from "../api/axios"
//import {getStatus, setStatus} from "../helper/helper";

class TradeList extends React.Component {

    state = {
        list: null
    }

    componentDidMount() {
        console.log("componentDidMount");


        axios.get("/queryAll",
            {
                params: {
                    fcn: "getAllOrders",
                    args: ["Order"]
                }
            })
            .then((response) => {
                console.log("TradeList::getAll= ", response.data)
                this.setState({list:response.data})
            })
            .catch(function (error) {
                console.log(error);
            })

    }

    renderList = () => {
        return this.state.list.map(trade => {
            return (
                <div className="item" key={trade.key}>
                    <Link to={`trades/${trade.key}`} className="header">
                        {trade.key}
                    </Link>
                    <div className="description">{trade.description}</div>
                </div>

            )
        })
    }

    render() {
        if (!this.state.list) {
            return null;
        }

        return (
            <div className="ui container">
                {this.renderList()}
            </div>
        );


    }
}

export default TradeList;
