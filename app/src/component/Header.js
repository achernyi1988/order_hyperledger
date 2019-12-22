import React, {Component} from 'react';
import {Link} from "react-router-dom"
import Login from "./Login";
//import GoogleAPI from "../../../../../../react/react_2019/streams/client/src/api/GoogleAPI"

class Header extends Component {
    render() {
        return (
            <div className={"ui secondary pointing menu"}>
                <Link className={"item"} to={"/"}> Anytime Buys </Link>
                <div className={"  compact  menu"}>
                    <Link className={"  item"} to={"/create"}> Create Trade </Link>
                </div>
                <div className={"right menu"}>
                    <Login/>
                    <Link className={"item"} to={"/"}> All Trades </Link>
                </div>

            </div>
        );
    }
}

export default Header;
