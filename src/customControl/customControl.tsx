import * as React from "react";
//import * as  ReactDOM from "react-dom";
import { Modal, Button, Form, Input, DatePicker } from 'antd';

/**
 * 
 */
interface ICustomControlState {
    title: string
}

interface ICustomControlProp {
    inputValue: string
}

/**
 * 
 */
export class customControl extends React.Component<ICustomControlProp, ICustomControlState> {
    //private _inputValue: string;

    constructor(props) {
        super(props);
        // this.refTextField = React.createRef();

        //this._inputValue = this.props.inputValue;
    }

    render(): JSX.Element {
        return (
            <Form
                layout="vertical"
                name="form_in_modal"
            >
                <Form.Item
                    //label={this.state.title}
                    name="fieldValue"
                    rules={[{ required: false, message: this.state.title }]}
                >
                    <Input value={this.props.inputValue} />
                </Form.Item>
            </Form>
        );
    }
}

