import ControlInterface from '../_base/ControlInterface.js';
import { BaseFormControl } from './BaseFormControl.js';

// export default class ButtonSwitch extends BaseFormControl(ControlInterface) {
export default class ButtonSwitch extends ControlInterface {
    properties = {
        height: 24,
        width: 120,
        label: 'switch',
        value: true,
    };

    ignore_properties = [
        'when the user click go to....',
        'display name',
        'allow inline editor',
    ];

    format() {
        super.format();
    }

    text(string) {
        this.setLabel(string);
        this.format();
    }

    setDefault(bool) {
        this.val(bool);
    }

    isChecked() {
        return this.ctrl.find('input')[0].checked;
    }

    setChecked(bool) {
        this.value = typeof bool !== 'boolean' ? this.value : bool;
    }

    val(bool) {
        if (typeof bool === 'undefined') {
            return this.isChecked();
        } else {
            this.setChecked(bool);
        }
    }

    getControl() {
        this.ctrl = $(
            `<div>
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>`,
        );
        return this.ctrl;
    }
}
