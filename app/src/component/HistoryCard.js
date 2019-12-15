import React from 'react';

const HistoryCard = (props) => {
    const {trade} = props;

    if(!trade){
        return (
            <div className="ui cards">
                <div className="card">
                    <div className="content">
                        <div className="description">
                            removed goods
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="ui cards">
            <div className="card">
                <div className="content">
                        <div className="description">
                            {trade.description}
                        </div>
                        <div className="meta" style={{float: "right", color: "#00994d"}}>{trade.amount}$</div>
                </div>
                <div className="extra content">
                        <span className="left floated like">
                            <i className="yellow info icon"></i>
                            <span style={{color: "#ff0000"}}>
                                {trade.status}
                            </span>
                        </span>
                </div>
            </div>
        </div>
    )
}

export default HistoryCard;
