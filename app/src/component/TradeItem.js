import React from 'react';
import {query, invoke} from "../api/axios"
import StepProgress from "./StepProgress"
import ProgressStatus from "../helper/ProgressStatus"
import history from "../history"

class TradeItem extends React.Component {

    state = {
        status: null,
        content: null,
        error: "",
        input: '',
        location: ''
    }


    componentDidMount() {

        console.log("componentDidMount", this.props.match.params.id);

        console.log("componentDidMount status = ", ProgressStatus.getStatus());
        this.id = (this.props.match.params.id);
        this.getTrade();
        this.getShipment();
    }

    getShipment = () => {
        query("/query", "getShipment", [this.id])
            .then((response) => {
                console.log("getShipment get= ", response.data)

                this.setState({location: response.data.location});
            })
            .catch((error) => {
                if (typeof error.response !== "undefined") {
                    console.log("getShipment", error.response.data.message);
                }
            });
    }

    getTrade = () => {
        query("/query", "getOrder", [this.id])
            .then(  (response) => {
                console.log("get= ", response.data)

                ProgressStatus.setStatus(response.data.status)
                this.setState({content: response.data, status: ProgressStatus.getStatus()});
            })
            .catch((error) => {
                if (typeof error.response !== "undefined") {
                    console.log(error.response.data.message);
                    this.setState({error: error.response.data.message})
                }
            });
    }

    reset = () => {
        console.log("TradeItem::reset");
        this.invoke("reset", [this.id], () => {
            history.push("/")
        })

    }

    getHistory = () => {
        history.push(`/history/${this.id}`);
    }


    invoke = (fcn, args, resolve) => {

        return invoke(fcn, args)
            .then(async (res) => {
                console.log("post= ", res)
                resolve();
                ProgressStatus.setStatus(res.data.status)
                this.setState({status: ProgressStatus.getStatus(), error: ""});

            })
            .catch((error) => {
                console.log(error.response.data.message);
                this.setState({error: error.response.data.message})
            })
    }

    onAcceptOrder = (value) => {
        console.log("TradeItem::onAcceptOrder", value);

        this.invoke("acceptOrder", [this.id], () => {
        });
    }

    onPrepayment = () => {
        console.log("TradeItem::makePrepayment");

        this.invoke("makePrepayment", [this.id], () => {
        });
    }

    onSetoff = () => {
        console.log("TradeItem::prepareShipment");
        this.invoke("prepareShipment", [this.id, "Shanghai", "Odessa", "19.02.2020", "20.03.2020"], () => {
            this.setState({location: "Shanghai"});
        })
    }

    onUpdateLocation = (value) => {
        console.log("TradeItem::updateShipmentLocation", value);
        this.invoke("updateShipmentLocation", [this.id, value], () => {
            this.getShipment();
        })

    }

    onFullPay = () => {
        console.log("TradeItem::makePayment");
        this.invoke("makePayment", [this.id], () => {
            this.getShipment();
        });
    }

    renderError = () => {
        return (<div className="errorText">
            {this.state.error}
        </div>)
    };


    handleSubmit = (event) => {
        event.preventDefault();
        this.onUpdateLocation(this.state.input);
        this.setState({input: ""});

    }

    render() {

        const {status, content, location} = this.state;
        if (!status || !content) {
            return null;
        }
        return (
            <div>
                <span className={"ui header"}>{content.description}  </span>
                <span className={"ui header"} style={{color: "green"}}>{content.amount}$ </span>
                <div className={"ui header"} style={{color: "blue"}}>{`current location: ${location}`} </div>

                <p/>
                <StepProgress status={status}
                              onAcceptOrder={this.onAcceptOrder}
                              onPrepayment={this.onPrepayment} onSetoff={this.onSetoff}
                              onFullPay={this.onFullPay}
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

                {"SETOFF" === ProgressStatus.getCurrentStatus() ?
                    <form onSubmit={this.handleSubmit}>
                        <p className={"field"}>
                            <input value={this.state.input} onChange={(event) => {
                                this.setState({input: event.target.value});
                            }} placeholder={"Input the current city"}/>
                        </p>
                        <button className="ui primary button" type={"submit"}>
                            Submit
                        </button>
                    </form>
                    : null}
                {this.renderError()}
            </div>
        )
    }
}


export default TradeItem;