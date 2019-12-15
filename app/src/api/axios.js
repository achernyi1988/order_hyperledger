import axios from "axios"

axios.defaults.baseURL = "http://192.168.0.69:2000"


export const query = (url,fcn,args) => {
    return axios.get(url,
        {
            params: {
                fcn,
                args
            }
        })
}

export const invoke = (fcn, args) => {
    return axios.post("/invoke",
        {fcn, args})
}

export default axios
