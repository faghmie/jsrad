import ControlInterface from '../_base/ControlInterface.js';

export default class BigText extends ControlInterface {
    is_data_aware = true;

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
        //TITLE
        let title = $(`<input class="form-control">`).val(this.label);

        title.on(
            'input',
            function (evt) {
                evt.stopPropagation();
                this.label = evt.target.value;
                this.format();
            }.bind(this),
        );

        //TEXT
        let text = $(`<textarea  class="form-control">`).val(this.value);

        text.on(
            'input',
            function (evt) {
                evt.stopPropagation();
                this.value = evt.target.value;
                this.format();
            }.bind(this),
        );

        return [
            ['value-type', this.get_aggregate_settings()],
            ['title', title],
            ['text', text],
            ['line position', this.get_line_position_setting()],
        ];
    }

    get_line_position_setting() {
        let line_position = $(`<select  class="form-select form-control">`)
            .append('<option></option>')
            .append('<option>top</option>')
            .append('<option>right</option>')
            .append('<option>bottom</option>')
            .append('<option>left</option>');

        let opt = this.line_position;

        line_position.find('option').each(function () {
            if (this.value == opt)
                this.setAttribute('selected', 'selected');
        });

        line_position.on('change', function (evt) {
            this.line_position = evt.target.value;
            this.format();
        });

        return line_position;
    }

    get_aggregate_settings() {
        let setting = $(`<select  class="form-select form-control">`)
            .append('<option>sum</option>')
            .append('<option>max</option>')
            .append('<option>min</option>')
            .append('<option>average</option>');

        let aggr_type = this.aggregate_type;
        
        setting.find('option').each(function () {
            if (this.value == aggr_type){
                this.setAttribute('selected', 'selected');
            }
        });

        setting.on('change', function (evt) {
            this.aggregate_type = evt.target.value;
            this.format();
        }.bind(this));

        return setting;
    }

    setControlStyle() {
        //Override to prevent default
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
            .html(this.format_value(this.value));

        let strip = this.ctrl; //.find('.side-color');

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

    format_value(value) {
        let abs_value = Math.abs(value);
        let text = value;
        
        if (abs_value < Math.pow(10, 5)) {
            text = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");    
        } else if (abs_value < Math.pow(10, 6)) {
            text = (value / Math.pow(10, 5)).toFixed(2) + ' K';
        } else if (abs_value < Math.pow(10, 7)) {
            text = (value / Math.pow(10, 6)).toFixed(2) + ' M';
        } else if (abs_value < Math.pow(10, 8)) {
            text = (value / Math.pow(10, 7)).toFixed(2) + ' B';
        } else if (abs_value < Math.pow(10, 9)) {
            text = (value / Math.pow(10, 8)).toFixed(2) + ' T';
        } else if (abs_value < Math.pow(10, 10)) {
            text = (value / Math.pow(10, 9)).toFixed(2) + ' P';
        } else if (abs_value < Math.pow(10, 11)) {
            text = (value / Math.pow(10, 10)).toFixed(2) + ' E';
        } else {
            text = (value / Math.pow(10, 11)).toFixed(2) + ' Z';
        }

        return text;
    }

    setValue(value) {
        this.value = typeof value !== 'undefined' ? value : this.value;

        this.read_records().then(function (data) {
            if (data == null) {
                return;
            }
            this.set_value(data);
        }.bind(this));
    }

    set_value(data) {
        if (!(data instanceof Array)){
            return null;
        }
        let key = null;

        let keys = Object.keys(data[0]);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== '__system_id__') {
                key = keys[i];
                break;
            }
        }
        
        if (key == null){
            return null;
        }

        let values = data.map(function (item) {
            return parseFloat(item[key]);
        });

        this.value = null;
        switch(this.aggregate_type){
            case 'sum':
                this.value = values.reduce((a, b) => a + b, 0);
                break;
            case 'max':
                this.value = Math.max.apply(null, values);
                break;
            case 'min':
                this.value = Math.min.apply(null, values);
                break;
            case 'average':
                this.value = values.reduce((a, b) => a + b, 0) / values.length;
                break;
        }

        this.value = this.value.toFixed(0);
        this.format();
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
