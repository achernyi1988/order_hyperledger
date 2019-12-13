import React from 'react';
import TradeList from "./component/TradeList";
import TradeItem from "./component/TradeItem";
import Header from "./component/Header";
import {Router, Route, Switch} from "react-router-dom"
import history from "./history"

class App extends React.Component {


    componentDidMount() {
        console.log("componentDidMount");
    }

    render() {
        return (
            <div className="ui container">
                <Router history={history}>
                    <Header/>
                     <Switch>
                         <Route path={"/"} exact component={TradeList}/>
                         <Route path={"/trades/:id"} exact component={TradeItem}/>
                     </Switch>
                </Router>
            </div>
        );
    }

}

export default App;
