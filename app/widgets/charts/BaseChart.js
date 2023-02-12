import ControlInterface from "../_base/ControlInterface.js";

export class BaseChart extends ControlInterface {
	
	chart = null;
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
		'when the user click go to....',
		'name',
		'value',
		'tab index',
		'allow inline editor',
	];

	// style_to_exclude = ['border-width', 'border-color', 'border-style'];
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

	toObject() {
		var obj = super.toObject();

		delete obj.chart;
		delete obj.chart_area;

		return obj;
	}

	resize(width, height){
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
		if (this.label.length !== 0){
			caption.show();
		}

		for(var key in this.style){
			caption.css(key, this.style[key]);
		}

		caption.css('border-width', 0);

		this.create_chart();

	}

	create_chart(){
		if (this.chart) {
			if (typeof this.chart.destroy === 'function'){
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
			this.draw();
		} catch (e) {
			console.log(e);
		}
	}

	setLabel(text) {
		this.label = typeof text !== "undefined" ? $.trim(text) : this.label;
		this.setValue();
	}

	setValue(value) {
		this.value = typeof value !== "undefined" ? value : this.value;
		var $this = this;

		// this.get_datasource(function (data_) {
		// 	var datasource = [];
		// 	if (data_) {
		// 		datasource = data_.slice(1);
		// 	} else {
		// 		if ($this.value instanceof Array)
		// 			datasource = $this.value.slice(0);
		// 		else
		// 			datasource = Object.assign({}, $this.value);
		// 	}
		// 	if (datasource instanceof Array) {
		// 		$this.value = {
		// 			data: [],
		// 			ticks: []
		// 		};
		// 		for (var index = 0; index < datasource.length; index++) {
		// 			var row = datasource[index];

		// 			if (isNaN(parseFloat(row[1])) === true) continue;

		// 			$this.value.ticks.push(row[0]);
		// 			$this.value.data.push(parseFloat(row[1]));
		// 		}
		// 		console.log(datasource)
		// 	}
			
		// 	if (!($this.value.data instanceof Array)) $this.value = Object.assign({}, $this.properties.value);
			
		// 	if ($("#" + $($this.chart_area).attr("id")).length === 0) {
		// 		return console.log('Cannot find chart area');
		// 	}
			
		// 	$this.resize();
		// 	$this.format();
		// });
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