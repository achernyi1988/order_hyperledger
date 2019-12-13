import React from 'react';
import axios from "../api/axios"
import StepProgress from "./StepProgress"
import ProgressStatus from "../helper/helper"


class TradeItem extends React.Component {

    state = {
        status: null
    }


    componentDidMount() {

        console.log("componentDidMount", this.props.match.params.id);

        console.log("componentDidMount status = ", ProgressStatus.getStatus());
        this.name = this.props.match.params.id;
        this.getTrade();
    }

    getTrade = () => {
        axios.get("/query",
            {
                params: {
                    fcn: "getOrder",
                    args: [this.name]
                }
            })
            .then((response) => {
                console.log("get= ", response.data)

                ProgressStatus.setStatus(response.data.status)
                this.setState({status: ProgressStatus.getStatus()});
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    reset = () => {
        console.log("TradeItem::reset");
        this.invoke("reset", [this.name]);
    }

    invoke=(fcn, args)=>{
        axios.post("/invoke",
            {fcn, args})
            .then((res)=>{
                console.log("post= ", res)

                ProgressStatus.setStatus(res.data.status)
                this.setState({status: ProgressStatus.getStatus()});

            }).catch(function (error) {
            console.log(error);
        })
    }

    onRequestOrder = ()=>{
        console.log("TradeItem::requestOrder");
        this.invoke("requestOrder", [this.name,"17000","solar battery: Risen rsm 144-6-390m half-cell","187"]);
    }

    onAcceptOrder = (value) => {
        console.log("TradeItem::onAcceptOrder", value);

        this.invoke("acceptOrder", [this.name]);
    }

    onPrepayment = () => {
        console.log("TradeItem::makePrepayment");

        this.invoke("makePrepayment", [this.name]);
    }

    onSetoff =()=>{
        console.log("TradeItem::prepareShipment");
        this.invoke("prepareShipment", [this.name,"Shanghai","Odessa","Shanghai","19.02.2020","20.03.2020"]);
    }

    onUpdateLocation = () =>{
        console.log("TradeItem::updateShipmentLocation");
        this.invoke("updateShipmentLocation", [this.name,"Odessa"]);
    }

    onFullPay = ( ) => {
        console.log("TradeItem::makePayment");
        this.invoke("makePayment", [this.name]);
    }

    render()
    {

        if (!this.state.status) {
            return null;
        }
console.log("render",this.state.status );
        return (
            <div>
                <StepProgress status={this.state.status}
                              onRequestOrder = {this.onRequestOrder} onAcceptOrder={this.onAcceptOrder}
                              onPrepayment = {this.onPrepayment} onSetoff = {this.onSetoff}
                              onUpdateLocation = {this.onUpdateLocation} onFullPay = {this.onFullPay}
                />

                <button className="ui primary button" onClick={this.getTrade}>
                    getTrade
                </button>
                <button className="ui negative button" onClick={this.reset}>
                    Reset
                </button>
            </div>
        )
    }
}


export default TradeItem;