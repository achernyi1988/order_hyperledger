import React from 'react';
import history from "../history"
import {invoke} from "../api/axios"
import {useFormik} from 'formik';

const validate = values => {
    const errors = {};
    if (!values.key) {
        errors.key = 'Required';
    } else if (values.key.length > 15) {
        errors.key = 'Must be 15 characters or less';
    }
    if (!values.amount) {
        errors.amount = 'Required';
    } else if (!values.amount.match(/^[0-9]+$/)) {
        errors.amount = 'must be integer w/o extra spaces';
    }
    return errors;
}

    const CreateForm = () => {

    const formik = useFormik({
        initialValues: {
            key: '',
            description: '',
            amount: '',
            numbers: '',
        },
        validate,
        onSubmit: obj => {
            console.log("onSubmit = ", obj)
            invoke("requestOrder",[obj.key, obj.amount, obj.description, obj.numbers] )
                .then((res) => {
                    console.log("invoke res = ", res)
                    history.push(`/trades/${obj.key}`);
                })
                .catch(function (error) {
                    console.log(error.response.data.message) // some reason error message
                });
        },
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            <div>

                <input
                    id="key"
                    name="key"
                    type="text"
                    placeholder="Tittle key"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                {formik.errors.key ? <div>{formik.errors.key}</div> : null}
            </div>
            <div>
                <input
                    id="description"
                    name="description"
                    type="text"
                    placeholder="Description"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
            </div>
            <div>
                <input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="Amount"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                {formik.errors.amount ? <div>{formik.errors.amount}</div> : null}
            </div>
            <div>
                <input
                    id="numbers"
                    name="numbers"
                    type="text"
                    placeholder="Numbers"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
}

export default CreateForm;
