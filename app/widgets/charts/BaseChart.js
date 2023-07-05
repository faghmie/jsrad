import App from "../../common/App.js";
import ControlInterface from "../_base/ControlInterface.js";

export class BaseChart extends ControlInterface {

	chart = null;
	is_data_aware = true;

	style = {
		'background-color': '#FFFFFF',
		'border-style': 'solid',
		'border-width': '1',
		'border-color': '#E5E5E5',
	};
	properties = {
		height: 350,
		width: 300,
		value: {
			data: [1, 2, 3, 4, 5],
			ticks: ["Red", "Yellow", "Orange", "Blue", "Pink"]
		}
	};

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'tab index',
		'allow inline editor',
	];

	style_to_exclude = ['background-color', 'font-size', 'font-weight', 'font-style', 'color'];

	chart_area_style = {
		drawGridLines: true, // whether to draw lines across the grid or not.
		gridLineColor: '#E5E5E5', // Color of the grid lines.
		background: '#FFFFFF', // CSS color spec for background color of grid.
		borderColor: '#E5E5E5', // CSS color spec for border around grid.
		gridLineWidth: 1, // pixel width of border around grid.
		borderWidth: 0,
		shadow: false, // draw a shadow for grid.
		shadowAngle: 45, // angle of the shadow.  Clockwise from x axis.
		shadowOffset: 1.5, // offset from the line of the shadow.
		shadowWidth: 3, // width of the stroke for the shadow.
		shadowDepth: 3, // Number of strokes to make when drawing shadow.
		// Each stroke offset by shadowOffset from the last.
		shadowAlpha: 0.07 // Opacity of the shadow
	};

	get_settings() {
		return [
			// ...super.get_settings(),
			['X-Axis', this.get_x_axis()],
			['Y-Axis', this.get_y_axis()]
		];
	}

	get_table_fields() {
		let fields = [];

		/** @type{SqlField|undefined} */
		let col = null;

		let table = this.datamodel.TableManager.tables[this.entity];
		if (!table) return App.notifyError('First select an entity');

		for (col of table) {
			fields.push(col);
		}

		fields = fields.sort(function (a, b) {
			return (a.title || '').localeCompare(b.title);
		});

		return fields;
	}

	get_x_axis() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = this.get_table_fields(),
			mapper = $(`<select class="form-select  form-control"><option></option></select>`);

		if (!fields) {
			return console.log('No fields available');
		}

		fields.forEach(function (col) {
			let chk = $(`<option value="${col.uuid}">${col.title}</option>`).appendTo(mapper);

			if (this.data_x_axis == col.uuid) {
				chk.attr('selected', 'selected');
			}
		}.bind(this));

		mapper.on('change', function (evt) {
			this.data_x_axis = evt.target.value
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		return mapper;
	}

	get_y_axis() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = this.get_table_fields(),
			mapper = $(`<select class="form-select form-control"><option></option></select>`);
		if (!fields) {
			return console.log('No fields available');
		}
		fields.forEach(function (col) {
			let chk = $(`<option value="${col.uuid}">${col.title}</option>`).appendTo(mapper);

			if (this.data_y_axis == col.uuid) {
				chk.attr('selected', 'selected');
			}
		}.bind(this));

		mapper.on('change', function (evt) {
			this.data_y_axis = evt.target.value;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		return mapper;
	}

	get_chart_data(data) {
		let x_col = this.get_field_name(this.data_x_axis);
		let y_col = this.get_field_name(this.data_y_axis);
		
		let chart_data = data.map(item => {
			return {
				x: item[x_col],
				y: item[y_col]
			};
		});
		
		let values = {};
		chart_data.forEach(item => {
			if (!values[item.x]) {
				values[item.x] = parseFloat(item.y);
			} else {
				values[item.x] += parseFloat(item.y);
			}
		});

		chart_data = Object.keys(values).map(key => {
			return [key, values[key]];
		});	

		console.log(chart_data);

		return chart_data;
	}

	map_x_data(data) {
		let field = this.get_field_name(this.data_x_axis);
		this.value.ticks = [];
		for (var index = 0; index < data.length; index++) {
			this.value.ticks.push((data[index][field]));
		}
	}

	map_y_data(data) {
		let field = this.get_field_name(this.data_y_axis);
		this.value.data = [];
		for (var index = 0; index < data.length; index++) {
			this.value.data.push(parseFloat(data[index][field]));
		}
	}

	get_field_name(uuid) {
		let fields = this.get_table_fields();
		if (!fields) return console.log('No fields available');
		for (var index = 0; index < fields.length; index++) {
			if (fields[index].uuid == uuid) {
				return fields[index].title;
			}
		}
	}

	toObject() {
		var obj = super.toObject();

		delete obj.chart;
		delete obj.chart_area;

		return obj;
	}

	resize(width, height) {
		super.resize(width, height);

		this.create_chart();
	}

	format() {
		super.format();

		this.setControlStyle();

		var caption = this.ctrl.find('.chart-caption');
		caption.hide();
		this.label = this.label.trim();
		caption.html(this.label);
		if (this.label.length !== 0) {
			caption.show();
		}

		for (var key in this.style) {
			caption.css(key, this.style[key]);
		}

		caption.css('border-width', 0);

		this.create_chart();

	}

	create_chart() {
		if (this.chart) {
			if (typeof this.chart.destroy === 'function') {
				console.log('remove old chart')
				this.chart.destroy();
			}
			this.chart = null;
		}

		this.chart_area.children().remove();
		this.chart_area.css({
			width: parseInt(this.width),
			height: parseInt(this.height)
		});

		if (!this.value.data || this.value.data.length === 0) {
			if (true === this.in_run_mode) {
				this.chart_area.append("<span class='lead text-danger'>No data available for chart</span>");
				return console.log('No data to draw');
			} else {
				this.value = this.properties.value;
			}
		}

		try {
			if (this.value.data.length === 0) {
				this.chart_area.append("<span class='lead text-danger'>No data available for chart</span>");
				return console.log('No data to draw');
			}
			this.draw();
		} catch (e) {
			console.log(e);
		}
	}

	setLabel(text) {
		this.label = typeof text !== "undefined" ? $.trim(text) : this.label;
		this.setValue();
	}

	async setValue(value) {
		this.value = typeof value !== "undefined" ? value : this.value;

		this.read_records().then(function (data) {
			// console.log(data);
			if (data) {
				let values = this.get_chart_data(data);
				this.value.ticks_data = values.slice();
				this.value.ticks = values.map(item => item[0]); 
				this.value.data = values.map(item => item[1]); 
				// this.map_x_data(data);
				// this.map_y_data(data);
				this.create_chart();
				// console.log(this.value);
			}
		}.bind(this));
	}



	getControl() {
		this.ctrl = $(`<div class="chart">
					<div class="chart-caption"></div>
					<div class="chart-container"></div>
				</div>`);

		this.chart_area = this.ctrl.find('.chart-container');
		this.chart_area.uniqueId();

		return this.ctrl;
	}

}