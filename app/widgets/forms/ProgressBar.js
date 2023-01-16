import { BaseFormControl } from './BaseFormControl.js';
import ControlInterface from '../_base/ControlInterface.js';

export default class ProgressBar extends BaseFormControl(ControlInterface) {
  properties = {
    height: 20,
    width: 300,
    min_height: 30,
    value: 30,
    max: 100,
  };
  
  ignore_properties = [
    'when the user click go to....',
    'display name',
    'allow inline editor',
    'name'
  ];

  bar_color = '#000000'

  get_settings() {
    let bar = $(`<input type="color">`)
      .val(this.bar_color)
      .on('input', function(evt){
        this.bar_color = evt.target.value;
        this.format();
      }.bind(this));
    
    return [
    		['bar color', bar]
    	];
  }

  format() {
    super.format();

    this.ctrl
      .find('.progress-bar')
      .css({
        'background-color': this.bar_color
      });
  }

  val(value) {
    if (typeof value === 'undefined') {
      return this.value;
    } else {
      this.setValue(value);
    }
  }

  step(step_value) {
    if (isNaN(step_value) || parseFloat(step_value) <= 0) step_value = 1;
    this.value += step_value;

    this.setValue();
  }

  setValue(value) {
    this.value = isNaN(value) === false ? parseFloat(value) : this.value;
    if (isNaN(this.value)) this.value = 0;

    let w = Math.floor((100 * this.value) / this.max);
    this.setLabel(w + '%');
    this.ctrl
      .find('.progress-bar')
      .css('width', w + '%')
      .attr('aria-valuenow', this.value);
  }

  setMax(max) {
    this.max = isNaN(max) === false ? max : this.max;
    this.ctrl.find('.progress-bar').attr('aria-valuemax', this.max);
  }

  setLabel(text) {
    super.setLabel(text);
    this.ctrl.find('.progress-bar').text(this.label);
  }

  getControl() {
    this.ctrl = $(`<div class="progress">
							<div class="progress-bar" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 30%;">
							</div>
					</div>`);
    return this.ctrl;
  }
}
