import BaseShape from "./BaseShape.js";

export default class Circle extends BaseShape {
	create_shape() {
		var canvas = this.ctrl[0];

		var ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		var border_width = parseInt(this.style['border-width']);
		var r_width = (canvas.width - border_width)/2;
		var r_height = (canvas.height - border_width)/2;

		if (border_width < 0) border_width = 0;

		ctx.lineWidth = border_width;
		ctx.strokeStyle = this.style['border-color'];
		ctx.fillStyle = this.style['background-color'];
		ctx.beginPath();
		
		// ctx.translate(border_width, 0);
		ctx.ellipse(r_width + border_width, r_height + border_width, r_width - border_width, r_height - border_width, 0, 0, Math.PI * 2, true);

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}