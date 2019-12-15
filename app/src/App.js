import React from 'react';
import TradeList from "./component/TradeList";
import TradeItem from "./component/TradeItem";
import Header from "./component/Header";
import TradeHistory from "./component/TradeHistory";
import CreateForm from "./component/CreateForm";

import {Router, Route, Switch} from "react-router-dom"
import history from "./history"

const  App  = () => {


        return (
            <div className="ui container">
                <Router history={history}>
                    <Header/>
                     <Switch>
                         <Route path={"/"} exact component={TradeList}/>
                         <Route path={"/trades/:id"} exact component={TradeItem}/>
                         <Route path={"/history/:id"} exact component={TradeHistory}/>
                         <Route path={"/create"} exact component={CreateForm}/>

                     </Switch>
                </Router>
            </div>
        );

}

export default App;
