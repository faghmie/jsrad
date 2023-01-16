import BaseShape from "./BaseShape.js";

export default class DatabaseShape extends BaseShape {
	create_shape() {
		this.drawCylinder();
	}

	drawCylinder() {
		var canvas = this.ctrl[0];
		var ctx = canvas.getContext('2d');
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// canvas.width = 160;
		// canvas.height = 175;
		
		var border_width = parseInt(this.style['border-width']);

		ctx.fillStyle = this.style['background-color'];
		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color'];

		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		this.drawCylinderV2(ctx, border_width, border_width, canvas.width - 2*border_width, canvas.height - 2*border_width);
	}

	drawCylinderV2(ctx, x, y, w, h) {
		var i, xPos, yPos, pi = Math.PI, twoPi = 2 * pi;
	
		ctx.beginPath();
		ctx.fillStyle = this.style['background-color'];
		ctx.lineWidth = parseInt(this.style['border-width']);
		ctx.strokeStyle = this.style['border-color'];

		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		for (i = 0; i < twoPi; i += 0.001) {
			xPos = (x + w / 2) - (w / 2 * Math.cos(i));
			yPos = (y + h / 8) + (h / 8 * Math.sin(i));
	
			if (i === 0) {
				ctx.moveTo(xPos, yPos);
			} else {
				ctx.lineTo(xPos, yPos);
			}
		}
		ctx.moveTo(x, y + h / 8);
		ctx.lineTo(x, y + h - h / 8);
		// ctx.fill();

		for (i = 0; i < pi; i += 0.001) {
			xPos = (x + w / 2) - (w / 2 * Math.cos(i));
			yPos = (y + h - h / 8) + (h / 8 * Math.sin(i));
	
			if (i === 0) {
				ctx.moveTo(xPos, yPos);
			} else {
				ctx.lineTo(xPos, yPos);
			}
		}
		ctx.moveTo(x + w, y + h / 8);
		ctx.lineTo(x + w, y + h - h / 8);
	
		// ctx.fill();
		ctx.stroke();
	}
}