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


class SelectForm extends React.Component {
    state = {
        selectedOption: null
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedOption: {label: "importer"}
        };
    }

    handleChange = selectedOption => {
        this.setState({selectedOption: selectedOption});
        console.log(`Option selected:`, selectedOption);
    };

    render() {
        const {selectedOption} = this.state;

        console.log(`render selectedOption `, selectedOption);

        return (
            <div style={{width: "150px"}}>
                <Select

                    value={selectedOption}
                    onChange={this.handleChange}
                    options={this.props.options}
                    getOptionLabel={option => `${option.label}`}
                    theme={theme}
                />
            </div>
        );

    }
}

export default SelectForm;

