import { BaseChart } from "./BaseChart.js";

export default class BarChart extends BaseChart {
	label = 'Bar';
	
	draw() {

		$.jqplot.config.enablePlugins = true;
		$.jsDate.config.defaultCentury = 2000;

		if (!this.chart_area) return;

		this.chart = $.jqplot(this.chart_area.attr('id'), [this.value.data], {
			//animateReplot: true,
			seriesDefaults: {
				renderer: $.jqplot.BarRenderer,
				rendererOptions: {
					fillToZero: true,
					barMargin: 20
				}
			},
			axesDefaults: {
				tickRenderer: $.jqplot.CanvasAxisTickRenderer,
				tickOptions: {
					//angle: -30,
					fontSize: '9pt',
					//labelPosition:'inside',
				}
			},
			axes: {
				// Use a category axis on the x axis and use our custom ticks.
				xaxis: {
					renderer: $.jqplot.CategoryAxisRenderer,
					ticks: this.value.ticks
				}
			},
			grid: this.chart_area_style

		});
	}
};