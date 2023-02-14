import { BaseFormControl } from './BaseFormControl.js';
import ControlInterface from '../_base/ControlInterface.js';

export default class Slider extends BaseFormControl(ControlInterface) {
  properties = {
    height: 24,
    width: 300,
  };

  ignore_properties = [
    'on-click',
    'display name',
    'allow inline editor',
    'name'
  ];


  orientation = 'horizontal';

  get_settings() {
    return super.get_settings();
    // let $this = this;
    // if (typeof this.value !== 'object' || this.value === null) this.value = {};

    // let orientation_select = $("<select class='form-control'>");
    // orientation_select.append('<option>vertical</option>');
    // orientation_select.append('<option>horizontal</option>');

    // orientation_select.find('option').each(function () {
    //   let opt = $(this);
    //   if (opt.val() === $this.orientation)
    //     opt.attr('selected', 'selected');
    // });
    // orientation_select.on('change', function () {
    //   $this.orientation = $(this).val();
    //   $this.format();
    // });

    // return [['orientation', orientation_select]];
  }

  format() {
    super.format();

    // switch (this.orientation) {
    //   case 'horizontal':
    //     this.resize(
    //       Math.max(this.width, this.height),
    //       Math.min(this.width, this.height),
    //     );
    //     break;
    //   default:
    //     this.resize(
    //       Math.min(this.width, this.height),
    //       Math.max(this.width, this.height),
    //     );
    // }

  }

  getControl() {
    super.getControl();
    this.ctrl.find('.control-group').append(`<div class="slidecontainer">
					<input type="range" min="1" max="100" value="50" class="slider" id="ui-12313">
				</div>`);
    return this.ctrl;
  }
}
