import React from 'react';
import {Link} from "react-router-dom";


const Card = (props) => {
    const {trade} = props;
    return (
        <div className="ui cards">
            <div className="card">
                <div className="content">
                    <Link to={`trades/${trade.key}`} className="header">
                        <div className="header">{trade.key}</div>
                        <div className="description">
                            {trade.description}
                        </div>
                        <div className="meta" style={{float: "right", color: "#00994d"}}>{trade.amount}$</div>
                    </Link>
                </div>
                <div className="extra content">
                    <Link to={`trades/${trade.key}`}>
                        <span className="left floated like">
                            <i className="yellow info icon"></i>
                            <span style={{color: "#ff0000"}}>
                                {trade.status}
                            </span>
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Card;
