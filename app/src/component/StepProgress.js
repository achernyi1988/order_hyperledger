import React from 'react';
import "react-step-progress-bar/styles.css";
//import { ProgressBar, Step  } from "react-step-progress-bar";
import "./stepProgress.css"


const StepProgress = ((props) => {

    let {status} = props;

    const REQUESTED_ACTIVE = status.REQUESTED === "active step";
    const ACCEPTED_ACTIVE = status.ACCEPTED === "active step";
    const PREPAYMENT_ACTIVE = status.PREPAYMENT === "active step";
    const SETOFF_ACTIVE = status.SETOFF === "active step";
    const DELIVERED_ACTIVE = status.DELIVERED === "active step";
    const PAID_ACTIVE = status.PAID === "active step";

    return (
        <div className="ui vertical small steps">
            <div className={status.REQUESTED}>
                <i className="shopping basket icon"></i>
                <div className="content">
                    <button className={REQUESTED_ACTIVE ? "btn active": "btn inactive"}>
                        {"Request an order"}
                    </button>
                    <div className="description">Buyer</div>
                </div>
            </div>
            <div className={status.ACCEPTED}>
                <i className="thumbs up outline icon"></i>
                <div className="content">
                    <button className={ACCEPTED_ACTIVE ? "btn active": "btn inactive"}
                            onClick={ACCEPTED_ACTIVE ? props.onAcceptOrder : null}>
                        {"Accept an order"}
                    </button>
                    <div className="description">Seller</div>
                </div>
            </div>
            <div className={status.PREPAYMENT}>
                <i className="info icon"></i>
                <div className="content">
                    <button className={PREPAYMENT_ACTIVE ? "btn active": "btn inactive"}
                            onClick={PREPAYMENT_ACTIVE ? props.onPrepayment : null}>
                        {"Make a prepayment 20%"}
                    </button>
                    <div className="description">Buyer</div>
                </div>
            </div>
            <div className={status.SETOFF}>
                <i className="ship icon"></i>
                <div className="content">
                    <button className={SETOFF_ACTIVE ? "btn active": "btn inactive"}
                            onClick={SETOFF_ACTIVE ? props.onSetoff : null}>
                        {"Prepare a shipment"}
                    </button>
                    <div className="description">Seller</div>
                </div>
            </div>

            <div className={status.DELIVERED}>
                <i className="street view icon"></i>
                <div className="content">
                    <button className={DELIVERED_ACTIVE ? "btn active": "btn inactive"}
                            onClick={DELIVERED_ACTIVE ? props.onUpdateLocation : null}>
                        {"Update a shipment location"}
                    </button>
                    <div className="description">Carrier</div>
                </div>

            </div>

            <div className={status.PAID}>
                <i className="cc amazon pay icon"></i>
                <div className="content">
                    <button className={PAID_ACTIVE ? "btn active": "btn inactive"}
                            onClick={PAID_ACTIVE ? props.onFullPay : null}>
                        {"Make a full payment"}
                    </button>

                    <div className="description">Buyer or Carrier</div>
                </div>
            </div>
        </div>
    )
})

export default StepProgress