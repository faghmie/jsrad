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

	add_panel(title, body) {
        let panel = $(`<div class="design-toolbox-panel">
                    <div class="design-toolbox-title">
                        <span>${title}</span>
                        <div class="panel-controls">
                            <i class="la la-chevron-down show-hide"/>
                            <i class="la la-times close-panel"/>
                        </div>
                    </div>
                    <div class="toolbox-body"/>
                </div>`)
            .appendTo($('body'))
            // .resizable()
            .draggable({
                handle: '.design-toolbox-title'
            });

            panel.on('click', panel, function (evt) {
				let panel = evt.data;
                if (evt.target.className.includes('close-panel')) {
                    panel.hide();
                } else if (evt.target.className.includes('show-hide')) {
                    if (evt.target.className.includes('la-chevron-down')) {
                        evt.target.classList.remove('la-chevron-down');
                        evt.target.classList.add('la-chevron-up');
                        panel.attr('current-height', panel.css('height'));
                        panel.css('height', 40);
                        panel.resizable('destroy');

                    } else if (evt.target.className.includes('la-chevron-up')) {
                        evt.target.classList.remove('la-chevron-up');
                        evt.target.classList.add('la-chevron-down');
                        panel.css('height', panel.attr('current-height'));
                        panel.resizable();
                    }
                } else {
                    panel.show();
                }
            }.bind(this));

		panel.find('.toolbox-body').append(body);

		panel.show();

        return panel;
    }

}
