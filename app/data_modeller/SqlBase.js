export default class SqlBase {
	name = null;
	title = null;
	uuid = null;
	comment = null;
	description = null;
	selected = false;

	object_type = null;

	dom = {
		container: null,
		title: null
	};

	hide_connector = false;

	constructor() {
		this.uuid = generate_uuid();
		this.dom = {};
	}


	is_selected() {
		return this.selected;
	}

	destroy() {
		this.dom.container.remove();
	}

	toObject() {
		var obj = Object.assign({}, this);

		delete obj.owner;
		delete obj.flag;
		delete obj.selected;
		delete obj.designer;
		delete obj.dom;
		delete obj.moving;
		delete obj.prototype;

		for (var key in obj) {
			if (typeof obj[key] === 'function') delete obj[key];
		}

		return obj;
	}

	set_title(name, comment) {
		if (name === undefined || name === null)
			name = this.name;
		else
			this.name = name.trim();

		if (comment === undefined || comment === null)
			comment = this.comment;
		else
			this.comment = comment;


		var _title = this.title;

		if (this.comment) {
			_title += '<p class="comment">' + this.comment + '</p>';
		}

		if (this.dom.title)
			this.dom.title.html(_title);
	}

	setName(string) {
		this.name = typeof string === 'undefined' ? string.trim() : this.name;

		this.name = string;
	}

	setComment(text) {
		this.comment = text;
		this.set_title(this.name, this.comment);
	}

	getComment() {
		return this.comment;
	}

	getTitle() {
		return this.name;
	}

	toFront() {
		//GO THROUGH ALL VISUALS ON CENTER PANE AND
		document.dispatchEvent(new CustomEvent('table-send-to-front', {
			detail: {
				table: this
			}
		}));
	}

	redraw() {}
}

function clone(existingArray) {
	var newObj = (existingArray instanceof Array) ? [] : {};
	for (var i in existingArray) {
		if (i === 'clone') continue;
		if (existingArray[i] && typeof existingArray[i] === 'object') {
			newObj[i] = clone(existingArray[i]);
		} else {
			newObj[i] = existingArray[i];
		}
	}
	return newObj;
}
