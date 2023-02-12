import ControlInterface from '../_base/ControlInterface.js';

export default class BigText extends ControlInterface {
  style = {
    'background-color': '#FFFFFF',
    'border-color': '#FFA500',
    'border-width': '5px',
    'border-style': 'solid',
    color: '#7f7f7f',
  };

  properties = {
    width: '150px',
    height: '100px',

    label: 'Number of users',
    value: '123456',
    line_position: 'bottom',
  };

  ignore_properties = [
    'display name',
    'required',
    'make it a card',
    'name',
    'value',
    'tab index',
    'id',
    'allow inline editor',
  ];

  get_settings() {
    var $this = this;

    //TITLE
    var title = $('<input type="text">').val(this.label);

    title.on(
      'input',
      function (evt) {
        evt.stopPropagation();
        this.label = evt.target.value;
        this.format();
      }.bind(this),
    );

    //TEXT
    var text = $('<textarea>').val(this.value);

    text.on(
      'input',
      function (evt) {
        evt.stopPropagation();
        this.value = evt.target.value;
        this.format();
      }.bind(this),
    );

    var line_position = $('<select>')
      .append('<option></option>')
      .append('<option>top</option>')
      .append('<option>right</option>')
      .append('<option>bottom</option>')
      .append('<option>left</option>');

    line_position.find('option').each(function () {
      if ($(this).val() == $this.line_position)
        $(this).attr('selected', 'selected');
    });

    line_position.on('change', function (evt) {
      $this.line_position = $(this).val();
      $this.format();
    });

    return [
      ['line position', line_position],
      ['title', title],
      ['text', text], //, 'text'],
    ];
  }

  setControlStyle(){
  	// this.format();
  }

  format() {
	super.format();
    this.ctrl.css({
      background: this.style['background-color'],
      'border-style': this.style['border-style'],
      'border-color': this.style['border-color'],
      overflow: 'hidden',
      display: 'inline-block',
    });

    this.ctrl.find('.text-area').css({
      background: this.style['background-color'],
    });

    this.ctrl
      .find('.card-title')
      .css({
        color: '#858282',
        background: 'transparent',
        'text-align': 'center',
        'vertical-align': 'middle',
        'font-size': '0.8em',
        'font-weight': 'bold',
        width: '100%',
        overflow: 'hidden',
      })
      .html(this.label);

    this.ctrl
      .find('.card-text')
      .css({
        color: this.style.color,
        background: 'transparent',
        width: '100%',
        'text-align': 'center',
        'font-size': '3.2em',
        'font-weight': 'bold',
        overflow: 'hidden',
      })
      .html(this.value);

    var strip = this.ctrl; //.find('.side-color');

    switch (this.line_position) {
      case 'top':
        strip.css({
          'border-top-width': this.style['border-width'],
          'border-right-width': 0,
          'border-bottom-width': 0,
          'border-left-width': 0,
        });
        break;
      case 'right':
        strip.css({
          'border-top-width': 0,
          'border-right-width': this.style['border-width'],
          'border-bottom-width': 0,
          'border-left-width': 0,
        });
        break;
      case 'bottom':
        strip.css({
          'border-top-width': 0,
          'border-right-width': 0,
          'border-bottom-width': this.style['border-width'],
          'border-left-width': 0,
        });
        break;
      default:
        strip.css({
          'border-top-width': 0,
          'border-right-width': 0,
          'border-bottom-width': 0,
          'border-left-width': this.style['border-width'],
        });
    }
  }

  setValue(value) {
    var $this = this;
    this.value = typeof value !== 'undefined' ? value : this.value;


  }

  getControl() {
    this.ctrl = $(`<div>
						<div class="text-area">
							<div class="card-title"></div>
							<div class="card-text"></div>
						</div>
					</div>`);

    return this.ctrl;
  }
}
