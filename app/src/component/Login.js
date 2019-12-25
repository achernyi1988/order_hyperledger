import React, {Component} from 'react';
import {get, post} from "../api/axios"
import SelectForm from "./SelectForm"

class Login extends Component {

    state = {
        list: null,
        current:{name: "importer"},
        error: ""
    }


    componentDidMount() {

    get("/get", "getPeer", [])
        .then((response) => {

            const data = response.data;
            if (typeof data !== "undefined" && data != null ) {
                console.log("Login::getPeer= ", data)
                this.setState({current: data})
            }
        })
        .catch((error) => {
            console.log(error.toString());
            this.setState({error: error.toString()})
        })

    get("/get", "getPeers", [])
        .then((response) => {

            const data = response.data;
            if (typeof data !== "undefined" && data != null && data.length != null
                && data.length > 0) {
                console.log("Login::getPeers= ", data)
                this.setState({list: data, error: ""})
            }
        })
        .catch((error) => {
            console.log(error.toString());
            this.setState({error: error.toString()})
        })
    }

    requestLogin = (obj) => {
        if(this.state.current.peer === obj.peer ){
            console.log("already active",obj.peer);
            return;
        }

        post("/post", "switchAccount", [obj.peer, obj.org, obj.mspid])
            .then((res) => {
                console.log(res);
                this.setState({current: obj})
            })
            .catch((error) => {
                console.log(error.toString());
                this.setState({error: error.toString()})
            })
    }

    render() {
        return (
            <SelectForm options={this.state.list} current={this.state.current} onLogin={this.requestLogin}/>
        );
    }
}

export default Login;
