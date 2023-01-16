import { BaseChart } from "./BaseChart.js";

export default class LineChart extends BaseChart {
	draw() {
		if (!this.chart_area) return console.log('No chart-area');
		
		$.jqplot.config.enablePlugins = true;
		$.jsDate.config.defaultCentury = 2000;
		this.chart = $.jqplot(this.chart_area.attr('id'), [this.value.data], {
			//title		: this.label,
			height: this.height,
			width: this.width,
			// colors that will
			// be assigned to the series.  If there are more series than colors, colors
			// will wrap around and start at the beginning again.
			// Turns on animatino for all series in this plot.
			//animate: true,
			// Will animate plot on calls to plot1.replot({resetAxes:true})
			//animateReplot: true,
			axesDefaults: {
				tickRenderer: $.jqplot.CanvasAxisTickRenderer,
				tickOptions: {
					fontSize: '10pt'
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