import { BaseChart } from "./BaseChart.js";

export default class BarChartHorizontal extends BaseChart {
	label = 'horizontal bar';
	
	draw() {
		if (!this.chart_area) return;

		this.chart = $.jqplot(this.chart_area.attr('id'), [this.value.data], {
			//title: this.label,
			// Turns on animatino for all series in this plot.
			//animate: true,
			// Will animate plot on calls to plot1.replot({resetAxes:true})
			//animateReplot: true,
			seriesDefaults: {
				renderer: $.jqplot.BarRenderer,
				// Show point labels to the right ('e'ast) of each bar.
				// edgeTolerance of -15 allows labels flow outside the grid
				// up to 15 pixels.  If they flow out more than that, they
				// will be hidden.
				pointLabels: {
					show: true,
					location: 'e',
					edgeTolerance: -15
				},
				// Rotate the bar shadow as if bar is lit from top right.
				shadowAngle: 135,
				// Here's where we tell the chart it is oriented horizontally.
				rendererOptions: {
					barDirection: 'horizontal',
					fillToZero: true,
					barMargin: 10
				}
			},
			axes: {
				yaxis: {
					renderer: $.jqplot.CategoryAxisRenderer,
					ticks: this.value.ticks
				}
			},
			grid: this.chart_area_style
		});
	}
}