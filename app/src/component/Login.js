import React, {Component} from 'react';
import {get} from "../api/axios"
import SelectForm from "./SelectForm"
class Login extends Component {

    state = {
        list: null,
        error: ""
    }

    componentDidMount(){
        get("/get", "getPeers", [])
            .then((response) => {

                var obj = []

                response.data.forEach(el =>{
                    obj.push({label:el})
                })


                console.log("Login::getPeers= ", obj)
                this.setState({list: obj, error: ""})
            })
            .catch ((error) => {
                console.log(error.toString());
                this.setState({error:error.toString()})
            })
    }

    render() {
        return (


            <SelectForm options = {this.state.list}/>

        );
    }
}

export default Login;
