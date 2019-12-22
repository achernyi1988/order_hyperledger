import axios from "axios"

axios.defaults.baseURL = "http://192.168.56.101:2000"


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


export const get = (url,fcn,args) => {
    return axios.get(url,
        {
            params: {
                fcn,
                args
            }
        })
}

export const post = (url,fcn,args) => {
    return axios.get(url,
        {
            params: {
                fcn,
                args
            }
        })
}


export default axios
