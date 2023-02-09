
export default class AlignmentManager {
	width = null;
	height = null;
	style = null;

	attach(obj) {
		let widget = $(`<div class="text-formater">`);

		widget.append(`<div class="title-line">alignment</div>`);
		widget.append(this.get_alignment(obj));
		widget.append(this.get_spacing(obj));
		widget.append(this.get_order(obj));
		widget.append(this.get_sizer(obj));
		widget.append(this.get_styler(obj));

		return widget;
	};

	get_order(obj) {
		let prop = $(`
			<div>
				<button class="to-front">to front</button>
				<button class="send-back">send back</button>
            </div>`);

		prop.find('.to-front').on('click', obj, function (evt) {
			this.bringForward(evt.data);
		}.bind(this));

		prop.find('.send-back').on('click', obj, function (evt) {
			this.sendBack(evt.data);
		}.bind(this));

		return prop;
	}

	get_spacing(obj) {
		let prop = $(`
			<div>
				<button class="space-v">space vetically</button>
				<button class="space-h">space horizontally</button>
            </div>`);

		prop.find('.space-v').on('click', obj, function (evt) {
			this.spaceVertically(evt.data);
		}.bind(this));

		prop.find('.space-h').on('click', obj, function (evt) {
			this.spaceHorizontally(evt.data);
		}.bind(this));

		return prop;
	}

	get_sizer(obj) {
		let prop = $(`
			<div>
				<button class="copy">copy size</button>
				<button class="paste">paste size</button>
            </div>`);

		prop.find('.copy').on('click', obj, function (evt) {
			this.width = evt.data.width;
			this.height = evt.data.height;
		}.bind(this));

		prop.find('.paste').on('click', obj, function (evt) {
			if (this.height == null || this.width == null) {
				return console.log('no resizing allowed');
			}

			let form = evt.data.getForm();

			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true) {
					ctrl.resize(this.width, this.height);
				}
			}

		}.bind(this));

		return prop;
	}

	get_styler(obj) {
		let prop = $(`
			<div>
				<button class="copy">copy style</button>
				<button class="paste">paste style</button>
				<button class="default">default style</button>
            </div>`);

		prop.find('.copy').on('click', obj, function (evt) {
			this.style = Object.assign({}, evt.data.style);
		}.bind(this));

		prop.find('.paste').on('click', obj, function (evt) {
			if (this.style == null) {
				return console.log('no styling allowed');
			}

			let form = evt.data.getForm();

			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true) {
					ctrl.style = Object.assign({}, this.style);
					ctrl.setControlStyle();
					ctrl.format();
				}
			}

		}.bind(this));

		prop.find('.default').on('click', obj, function (evt) {
			let form = evt.data.getForm();

			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true && ctrl.default_style) {
					ctrl.style = Object.assign({}, ctrl.default_style);
					ctrl.setControlStyle();
					ctrl.format();
				}
			}

		}.bind(this));

		return prop;
	}

	get_alignment(obj) {
		let prop = $(`
					<div class="row">
						<button class=" la la-download la-rotate-90 left btn" title="align to left"></button>
						<button class="la la-download la-rotate-180 top btn" title="align top"></button>
						<button class="la la-download la-rotate-270 right btn" title="align to right"></button>
						<button class="la la-download bottom btn" title="align bottoms"></button>
					</div>`);

		prop.find('.left').on('click', obj, function (evt) {
			this.toLeft(evt.data);
		}.bind(this));

		prop.find('.top').on('click', obj, function (evt) {
			this.toTop(evt.data);
		}.bind(this));

		prop.find('.right').on('click', obj, function (evt) {
			this.toRight(evt.data);
		}.bind(this));

		prop.find('.bottom').on('click', obj, function (evt) {
			this.toBottom(evt.data);
		}.bind(this));

		return prop;
	}

	spaceVertically(src) {
		let f = null,
			form = src.getForm(),
			ctrl = null,
			top = null,
			bottom = null,
			height_sum = 0,
			ctrl_count = 0,
			top_ctrl = null,
			list = [];

		for (f in form.controls) {
			ctrl = form.controls[f];

			if (ctrl.selected === true) {
				list.push(ctrl);
				let cur_bottom = ctrl.top + ctrl.height;
				height_sum += ctrl.height;
				ctrl_count++;
				if (top == null || ctrl.top < top) {
					top_ctrl = ctrl;

					//remove the top control from the list
					list.pop();
					top = ctrl.top;
				}

				if (bottom == null || cur_bottom > bottom) {
					bottom = cur_bottom;
				}
			}
		}

		if (ctrl_count == 0) {
			return;
		}

		let delta = Math.ceil((bottom - top - height_sum) / ctrl_count);

		while (list.length > 0) {
			let idx = null;
			top = null;
			//First find the heighest control
			list.forEach((ctrl, index) => {
				if (top == null || ctrl.top < top) {
					top = ctrl.top;
					idx = index;
				}
			});

			if (idx == null) {
				//Fail safe to prevent infinite loop
				break;
			}

			list[idx].top = top_ctrl.top + top_ctrl.height + delta;
			list[idx].format();

			//This now becomes the top control for the next one to be set
			top_ctrl = list[idx];

			//Remove it from the list of controls to still adjust
			list.splice(idx, 1);
		}
	}

	spaceHorizontally(src) {
		let f = null,
			form = src.getForm(),
			ctrl = null,
			left = null,
			right = null,
			width_sum = 0,
			ctrl_count = 0,
			left_ctrl = null,
			list = [];

		for (f in form.controls) {
			ctrl = form.controls[f];

			if (ctrl.selected === true) {
				list.push(ctrl);
				let cur_right = ctrl.left + ctrl.width;
				width_sum += ctrl.width;
				ctrl_count++;
				if (left == null || ctrl.left < left) {
					left_ctrl = ctrl;

					//remove the left-ist control from the list
					list.pop();
					left = ctrl.left;
				}

				if (right == null || cur_right > right) {
					right = cur_right;
				}
			}
		}

		if (ctrl_count == 0) {
			return;
		}

		let delta = Math.ceil((right - left - width_sum) / ctrl_count);

		while (list.length > 0) {
			let idx = null;
			left = null;
			//First find the left-ist control
			list.forEach((ctrl, index) => {
				if (left == null || ctrl.left < left) {
					left = ctrl.left;
					idx = index;
				}
			});

			if (idx == null) {
				//Fail safe to prevent infinite loop
				break;
			}

			list[idx].left = left_ctrl.left + left_ctrl.width + delta;
			list[idx].format();

			//This now becomes the left control for the next one to be set
			left_ctrl = list[idx];

			//Remove it from the list of controls to still adjust
			list.splice(idx, 1);
		}
	}

	sendBack(src) {
		let form = src.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (let c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toBack();
			}
		}
	}

	bringForward(src) {
		let form = src.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (let c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toFront();
			}
		}
	}

	toTop(src) {
		let f = null,
			form = src.getForm(),
			ctrl = null,
			top = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				if (top == null || ctrl.top < top) {
					top = ctrl.top;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(ctrl.left, top);
			}
		}
	}

	toLeft(src) {
		let f = null,
			form = src.getForm(),
			ctrl = null,
			left = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				if (left == null || ctrl.left < left) {
					left = ctrl.left;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(left, ctrl.top);
			}
		}
	}

	toRight(src) {
		let f = null,
			form = src.getForm(),
			ctrl = null,
			right = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				let c_r = ctrl.left + ctrl.width;

				if (right == null || c_r > right) {
					right = c_r;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(right - ctrl.width, ctrl.top);
			}
		}
	}

	toBottom() {
		let f = null,
			form = ctrl.getForm(),
			ctrl = null,
			bottom = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				let c_b = ctrl.top + ctrl.height;

				if (bottom == null || c_b > bottom) {
					bottom = c_b;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(ctrl.left, bottom - ctrl.height);
			}
		}
	}
}