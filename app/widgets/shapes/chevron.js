import BaseShape from "./BaseShape.js";

export default class Chevron extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');
		var offset = canvas.width / 6;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var border_width = parseInt(this.style['border-width']);

		if (border_width < 0) border_width = 0;

		ctx.lineWidth = border_width;
		ctx.strokeStyle = this.style['border-color'];
		ctx.fillStyle = this.style['background-color'];
		ctx.beginPath();
		ctx.moveTo(border_width, border_width);
		ctx.lineTo(canvas.width - offset, border_width);
		ctx.lineTo(canvas.width - border_width, (canvas.height - border_width)/2);
		ctx.lineTo(canvas.width - offset, canvas.height - border_width);
		ctx.lineTo(border_width, canvas.height - border_width);
		ctx.lineTo(offset, (canvas.height - border_width)/2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}