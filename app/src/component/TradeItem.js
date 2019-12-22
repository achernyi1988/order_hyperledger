import React from 'react';
import {query, invoke} from "../api/axios"
import StepProgress from "./StepProgress"
import ProgressStatus from "../helper/helper"
import history from "../history"

class TradeItem extends React.Component {

    state = {
        status: null,
        error: ""
    }


    componentDidMount() {

        console.log("componentDidMount", this.props.match.params.id);

        console.log("componentDidMount status = ", ProgressStatus.getStatus());
        this.id = (this.props.match.params.id);
        this.getTrade();
    }

    getTrade = () => {
         query("/query", "getOrder", [this.id])
            .then((response) => {
                console.log("get= ", response.data)

                ProgressStatus.setStatus(response.data.status)
                this.setState({status: ProgressStatus.getStatus()});
            })
            .catch( (error) => {
                console.log(error.response.data.message);
                this.setState({error : error.response.data.message})
            });
    }

    reset = () => {
        console.log("TradeItem::reset");
        this.invoke("reset", [this.id])
            .then (()=>{
            history.push("/");
        }).catch( (error) => {
            console.log(error);
        });
    }

    getHistory = () =>{
        history.push(`/history/${this.id}`);
    }


    invoke = (fcn, args) => {

        return invoke(fcn, args)
            .then((res) => {
                console.log("post= ", res)
                ProgressStatus.setStatus(res.data.status)
                this.setState({status: ProgressStatus.getStatus(),error:""});


            }).catch( (error) => {
                console.log(error.response.data.message);
                this.setState({error : error.response.data.message})
        })
    }

    onAcceptOrder = (value) => {
        console.log("TradeItem::onAcceptOrder", value);

        this.invoke("acceptOrder", [this.id]);
    }

    onPrepayment = () => {
        console.log("TradeItem::makePrepayment");

        this.invoke("makePrepayment", [this.id]);
    }

    onSetoff = () => {
        console.log("TradeItem::prepareShipment");
        this.invoke("prepareShipment", [this.id, "Shanghai", "Odessa", "Shanghai", "19.02.2020", "20.03.2020"]);
    }

    onUpdateLocation = () => {
        console.log("TradeItem::updateShipmentLocation");
        this.invoke("updateShipmentLocation", [this.id, "Odessa"]);
    }

    onFullPay = () => {
        console.log("TradeItem::makePayment");
        this.invoke("makePayment", [this.id]);
    }

    renderError = () => {
        return (<div className="errorText">
            {this.state.error}
            </div>)
    };

    render() {

        if (!this.state.status) {
            return null;
        }
        return (
            <div>
                <StepProgress status={this.state.status}
                              onAcceptOrder={this.onAcceptOrder}
                              onPrepayment={this.onPrepayment} onSetoff={this.onSetoff}
                              onUpdateLocation={this.onUpdateLocation} onFullPay={this.onFullPay}
                />

                <button className="ui primary button" onClick={this.getTrade}>
                    getTrade
                </button>
                <button className="ui negative button" onClick={this.reset}>
                    Reset
                </button>
                <button className="ui button" onClick={this.getHistory}>
                    GetHistory
                </button>

                {this.renderError()}
            </div>
        )
    }
}


export default TradeItem;