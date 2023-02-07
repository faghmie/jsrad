if (typeof FD === 'undefined') FD = {};

let App = {
	message_div: $('<div class="card notify">' +
		'<div class="side-bar"></div>' +
		'<div class="content">' +
		'<a class="pull-right close-btn"><i class="la la-fw la-times"></i></a>' +
		'<h3 class="title">#{title}</h3>' +
		'<p class="message">#{text}</p>' +
		'</div>' +
		'</div>')
		.appendTo('body')
		.hide(),
	MessageTypes: {
		INFO: 0,
		WARNING: 1,
		ERROR: 2
	},
	designer: null,
	datasources: {},
	base_path: './',
	is_web_app: (location.href.indexOf('file:///') === 0),
	is_mobile: (/Mobi|Android/i.test(navigator.userAgent)),
	AuthToken: {
		email: null,
		token: null,
		network: null,
	},

	init_auth: function () {
		App.AuthToken = {};
		hello.init({
			google: '26993373135-jg35i8p0sjkdp2jcf8ul5g5554rgcdj8.apps.googleusercontent.com',
			facebook: '238548349921361',

		}, {
			//redirect_uri: 'http://thefoundry.doagileprojects.com/',
			scope: 'email',
		});
	},

	closeModal: function () {
		if ($('div.modal').length > 0) $('div.modal').modal('hide');
	},

	Input: function (options) {
		let defaults = {
			default_value: '',
			title: '',
			ok_title: 'Ok',
			cancel_title: 'Cancel',
			width: null,
			on_done: function () { },
			on_show: function () { },

		},
			card = null,
			dlg = $('<div class=\'container-fluid\'>' +
				'<div class=\'row content-area\'></div>' +
				'<div class=\'row button-area\'></div>' +
				'</div>');

		if (typeof options !== 'object')
			options = $.extend(true, {}, defaults);
		else
			options = $.extend(true, defaults, options);


		let content = $("<input type='text' class='form-control'>").appendTo(dlg.find('.content-area'));
		content.val(options.default_value);
		let btn_ok = $("<button type='button' class='btn btn-success btn-flat pull-right'>" + options.ok_title + '</button>');
		btn_ok.on('click', function () {
			options.on_done(content.val());
			card.close();
		});

		let btn_cancel = $("<button type='button' class='btn btn-danger btn-flat btn-outline pull-left'>" + options.cancel_title + '</button>');
		btn_cancel.on('click', function () {
			card.close();
		});

		dlg.find('.button-area')
			.css('padding', '10px')
			.append(btn_ok)
			.append(btn_cancel);

		card = open_card(dlg, {
			title: options.title,
			'min-width': '300px',
		});

		return card;
	},

	Modal: function (options) {
		let defaults = {
			content: null,
			title: '',
			width: '100%',
			'min-width': '300px',
			'max-width': '100%',
			height: '70vh',
			'max-height': '70vh',
			'overflow': 'auto',
			on_done: null,
			on_show: null,
			buttons: {}
		};

		if (typeof options !== 'object')
			options = $.extend(true, {}, defaults);
		else
			options = $.extend(true, defaults, options);

		let dlg = $('<div>').append(options.content);

		dlg.css({
			height: options.height,
			'max-height': options['max-height'],
			width: options.width,
			'max-width': options['max-width'],
			'overflow': options.overflow,
			'display': 'inline-block',
		});

		for (let b in options.buttons) {
			let btn = options.buttons[b];
			let $btn = null;

			if (typeof btn === 'object') {
				if (typeof btn.title !== 'string') btn.title = b;
				if (typeof btn.type !== 'string') btn.type = ' btn-light ';
				$btn = $("<button type='button' class='btn " + btn.type + "'>" + btn.title + '</button>');

				if (typeof btn.click === 'function') {
					$btn.on('click', btn, function (evt) { evt.data.click(); });
				}

			} else if (typeof btn === 'function') {
				$btn = $("<button type='button' class='btn btn-light'>" + b + '</button>');
				$btn.on('click', btn);
			}

			dlg.append($btn);
		}

		return open_card(dlg, options);
	},

	Dialog: function (options) {
		let defaults = {
			content: null,
			title: '',
			width: null,
			on_done: null,
			on_show: null,
			buttons: {}
		};

		if (typeof options !== 'object')
			options = $.extend(true, {}, defaults);
		else
			options = $.extend(true, defaults, options);

		let dlg = $('<div>').append(options.content);
		for (let b in options.buttons) {
			let btn = options.buttons[b];
			let $btn = null;

			if (typeof btn === 'object') {
				if (typeof btn.title !== 'string') btn.title = b;
				if (typeof btn.type !== 'string') btn.type = ' btn-light ';
				$btn = $("<button type='button' class='btn " + btn.type + "'>" + btn.title + '</button>');

				if (typeof btn.click === 'function') {
					$btn.on('click', btn, function (evt) { evt.data.click(); });
				}

			} else if (typeof btn === 'function') {
				$btn = $("<button type='button' class='btn btn-light'>" + b + '</button>');
				$btn.on('click', btn);
			}

			dlg.append($btn);
		}

		return open_card(dlg, {
			title: options.title,
			'min-width': '300px'
		});
	},

	Confirm: function (msg, title, on_done, ok_button, cancel_button) {
		let no_header = false;

		if (typeof ok_button !== 'string') ok_button = 'Yes';
		if (typeof cancel_button !== 'string') cancel_button = 'No';
		if (typeof title !== 'string') {
			title = 'Confirm';
			no_header = true;
		}

		let dlg = $(`
			<div class="confirm-card">
				<div class="message"></div>
				<div>
				<div class="button-list">
					<button class="default"><i class="la la-check"></i>${ok_button}</button>
					<button class="cancel"><i class="la la-times"></i>${cancel_button}</button>
				</div>
				</div>
			</div>`);
		ok_button = dlg.find('.default');
		cancel_button = dlg.find('.cancel');

		dlg.find('.message').html(msg);

		ok_button.on('click', dlg, function (evt) {
			if (typeof on_done === 'function') on_done();
			card.close();
		});

		cancel_button.on('click', dlg, function (evt) {
			card.close();
		});

		let card = open_card(dlg, {
			title: title,
			no_header: true,
			
		});

		return card;
	},

	notify: function (defaults) {
		let options = $.extend(
			{
				message: '',
				title: null,
				type: App.MessageTypes.INFO,
				auto_close: true,
				timeout: 5000,
			},
			defaults
		),
			$this = this;


		if (typeof options.title === 'undefined' || options.title === null) {
			this.message_div.find('.title').hide();
		}
		this.message_div.removeClass('text-success text-info text-danger');
		switch (options.type) {
			case this.MessageTypes.ERROR:
				this.message_div.find('.side-bar').css('background', 'red');
				this.message_div.addClass('text-danger');
				this.message_div.find('.message').css('font-weight', 'bold');
				this.message_div.css({
					border: '2px solid red'
				});

				break;
			case this.MessageTypes.WARNING:
				this.message_div.find('.side-bar').css('background', '#FFA500');
				this.message_div.css({
					border: '2px solid #FFA500'
				});

				break;

			case this.MessageTypes.INFO:
				this.message_div.find('.side-bar').css('background', '#0BAD0B');
				this.message_div.css({
					border: '2px solid #0BAD0B'
				});
				break;
		}
		this.message_div.find('.title').html(options.title);
		this.message_div.find('.message').html(options.message);
		this.message_div.show('blind');

		this.message_div.find('.close-btn').off('click').on('click', this.message_div, function (evt) {
			evt.data.hide();
		});

		if (options.auto_close === true) {
			setTimeout(function () {
				$this.message_div.hide('blind');
			}, options.timeout);
		}

		return this.message_div;
	},

	MessageInfo: function (msg, title) {
		return this.notify({
			message: msg,
			title: title,
			type: this.MessageTypes.INFO
		});
	},

	MessageWarning: function (msg, title) {
		return this.notify({
			message: msg,
			title: title,
			type: this.MessageTypes.WARNING
		});
	},

	MessageError: function (msg, title) {
		return this.notify({
			message: msg,
			title: title,
			type: this.MessageTypes.ERROR,
			auto_close: false,
		});
	},

	load_module: function (module) {
		if (module === undefined) {
			return;
		}
		for (let key in module.forms) {
			let ctrl = module.forms[key];

			if (typeof ctrl.display_type !== 'undefined' && ctrl.display_type === 'widget') {
				//MAKE A COPY INTO THE WINDOW SO THAT THE IDE CAN PICK IT UP
				window[ctrl.custom_type] = $.extend(true, {}, ctrl);
			}

			let form = new FD.Control(null, 'form', 0, 0);
			form.fromObject(ctrl);
			form.display_type = form.display_type === 'normal' ? 'popup' : form.display_type;
			this[form.name] = form;
			form.panel = null;
			form.change_mode(true);	//PUT INTO RUN MODE
		}
	},

	getUrlParameter: function (name) {
		if (!name) return null;

		name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
		let regexS = '[\\?&]' + name + '=([^&#]*)';
		let regex = new RegExp(regexS);
		let results = regex.exec(window.location.href);
		if (results === null)
			return null;
		else
			return unescape(results[1]);
	},

	copy_message: function (source, destination) {
		if (typeof destination === 'undefined') return;

		for (let key in source) {
			destination[key] = source[key];
		}
	}
};
