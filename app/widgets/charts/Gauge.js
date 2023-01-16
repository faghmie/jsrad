import { BaseChart } from "./BaseChart.js";

export default class GaugeChart extends BaseChart {
	label = 'Gauge';
	min_value = 0;
	max_value = 100;
	style = {
		'background-color': '#FFFFFF',
		'border-style': 'solid',
		'border-width': '1',
		'border-color': '#E5E5E5',
	};

	properties = {
		height: 200,
		width: 200,
		label: "Gauge",
		label_align: "hide",
		value: 33
	};


	get_settings() {
		var min_val = $("<input type='number' class='ui-widget'>");

		min_val
			.val(this.min_value)
			.keyup(function (evt) {
				$this.min_value = parseFloat($(this).val());
				if (evt.which === 13) $this.setValue();
			})
			.focusout(function () {
				$this.setValue();
			});

		var max_val = $("<input type='number' class='ui-widget'>");

		max_val
			.val(this.max_value)
			.keyup(function (evt) {
				$this.max_value = parseFloat($(this).val());
				if (evt.which === 13) $this.setValue();
			})
			.focusout(function () {
				$this.setValue();
			});

		return [
			["min-value", min_val],
			["max-value", max_val]
		];
	}

	setMin(number) {
		this.min_value = typeof number !== "undefined" ? parseFloat(number) : this.min_value;
		this.setValue();
	}

	setMax(number) {
		this.max_value = typeof number !== "undefined" ? parseFloat(number) : this.max_value;
		this.setValue();
	}

	draw() {

		this.min_value = 0;
		this.max_value = 100;
		var value = 63;

		if (this.value.data && this.value.data.length === 3) {
			value = this.value.data[0];
			this.min_value = this.value.data[1];
			this.max_value = this.value.data[2];
		}

		this.chart = $.jqplot(this.chart_area.attr('id'), [
			[value]
		], {
			//title		: this.label,
			// height		: this.height,
			// width		: this.width,
			seriesDefaults: {
				renderer: $.jqplot.MeterGaugeRenderer,
				rendererOptions: {
					min: 0, //parseInt(this.min_value),
					max: 100, //parseInt(this.max_value),
					//label				: this.label,
					//intervals			: [this.max_value/3, this.max_value - this.max_value/3,this.max_value],
					//intervalColors	: ['#339933', '#E38A11',  '#F91800']
				}
			}
		});
	}
}