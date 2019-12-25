import React from 'react';
import Select from 'react-select';


const theme = theme => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary25: "#f3f3f3",
        primary: "blue"
        // All possible overrides
        // primary: '#2684FF',
        // primary75: '#4C9AFF',
        // primary50: '#B2D4FF',
        // primary25: '#DEEBFF',

        // danger: '#DE350B',
        // dangerLight: '#FFBDAD',

        // neutral0: 'hsl(0, 0%, 100%)',
        // neutral5: 'hsl(0, 0%, 95%)',
        // neutral10: 'hsl(0, 0%, 90%)',
        // neutral20: 'hsl(0, 0%, 80%)',
        // neutral30: 'hsl(0, 0%, 70%)',
        // neutral40: 'hsl(0, 0%, 60%)',
        // neutral50: 'hsl(0, 0%, 50%)',
        // neutral60: 'hsl(0, 0%, 40%)',
        // neutral70: 'hsl(0, 0%, 30%)',
        // neutral80: 'hsl(0, 0%, 20%)',
        // neutral90: 'hsl(0, 0%, 10%)',
    }
    // Other options you can use
    // borderRadius: 4
    // baseUnit: 4,
    // controlHeight: 38
    // menuGutter: baseUnit * 2
});


const SelectForm = (props) => {

    const {current, options} = props;

    return (
        <div style={{width: "150px"}}>
            <Select

                value={current}
                onChange={(value) => {
                    props.onLogin(value);
                }}
                options={options}
                getOptionLabel={option => `${option.name}`}
                theme={theme}
            />
        </div>
    );
}

export default SelectForm;

