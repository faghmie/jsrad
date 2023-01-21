import BaseShape from "./BaseShape.js";

export default class LineZigZagRight extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');
		var border_width = parseInt(this.style['border-width']);
		var size = canvas.width / 6;

		ctx.clearRect(0, 0, canvas.width * 10, canvas.height * 10);

		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color']
		ctx.lineJoin = "round";

		var path = new Path2D();

		path.moveTo(border_width, canvas.height - border_width);
		path.lineTo((canvas.width - 2 * border_width) / 2, canvas.height - border_width);
		path.lineTo((canvas.width - 2 * border_width) / 2, border_width + size);
		path.lineTo(canvas.width - border_width, border_width + size);
		path.lineTo(canvas.width - border_width - size, border_width);
		path.moveTo(canvas.width - border_width, border_width + size);
		path.lineTo(canvas.width - border_width - size, 2 * size + border_width);

		ctx.stroke(path);
	}
}