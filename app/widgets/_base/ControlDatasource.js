export const ControlDatasource = (superclass) => class extends superclass {

    datasource = {
		name: null,
		entity: null,
		key: null,
		value: [] //CAN SELECT A LIST OF FIELDS TO DISPLAY
	};

    translate_datasource() {
		var datasource = null;

		if (!datasource) datasource = this.datasource;

		if (!datasource || datasource.entity === null) return null;

		if (datasource.name === null) return null;

		if (typeof App.datasources[datasource.name] === 'undefined') return null;

		if (typeof App.datasources[datasource.name] === 'undefined' ||
			typeof App.datasources[datasource.name].entities === 'undefined') {
			return null;
		}

		var ds = App.datasources[datasource.name].entities[datasource.entity];
		if (!ds) return null;

		return ds;
	}

	get_datasource(_input_datasource, as_object, on_done) {
		var datasource = null;

		this.dom.container.find('.' + this.uuid).remove();

		if (typeof _input_datasource === 'function')
			on_done = _input_datasource;
		else
			datasource = _input_datasource;

		if (typeof on_done !== 'function') on_done = function () {};

		if (this.in_run_mode !== true) return on_done(null);

		if (typeof as_object === 'undefined' || as_object === null) as_object = false;

		if (!datasource) datasource = this.datasource;

		if (!datasource || datasource.entity === null) return on_done(null);

		if (datasource.name === null) return on_done(null);

		if (typeof App.datasources[datasource.name] === 'undefined') return on_done(null);

		if (typeof App.datasources[datasource.name] === 'undefined' ||
			typeof App.datasources[datasource.name].entities === 'undefined') {
			return on_done(null);
		}

		var ds = App.datasources[datasource.name].entities[datasource.entity];
		if (!ds) return on_done(null);

		var $this = this,
			show_again = true;

		if (!this.message) this.message = {};
		if (!this.getForm().message) this.getForm().message = {};

		if ($this.is_an_activity !== true) //ALLOW CONTROLS TO INHERIT FROM FORM
			$this.message = Object.assign($this.message, this.getForm().message);

		//REPLACE CONTROL WITH A TEMPORARY CONTROL TO SHOW IT IS BUSY LOADING.
		show_again = $this.ctrl.is(':visible');
		$this.ctrl.hide();
		var progress = $('<div>')
			.appendTo($this.dom.container)
			.css({
				width: this.width,
				height: this.height,
			})
			.addClass($this.uuid)
			.addClass('data-source-loading pull-left')
			.show();
		var indicator = $('<i>')
			.addClass('la la-lg la-fw la-spinner la-pulse pull-left')
			.css({
				'font-size': '28px',
				padding: '4px',
				display: 'table-cell',
			})
			.appendTo(progress);
		var text = $('<h4>').html(this.label).appendTo(progress);

		var sort_data = function (header, data) {
			var sorting = Object.assign({}, datasource.sort);
			var sorting_required = false;
			for (var key in sorting) {
				sorting_required = true;
				break;
			}

			if (true === sorting_required) {
				if (sorting.field in ds.fields) {
					sorting.field = ds.fields[sorting.field].name;
				}
				var header_row = data.shift();

				data = data.sort(function (a, b) {
					if (!(sorting.field in b)) return 0;

					var value_1 = a[sorting.field],
						value_2 = b[sorting.field];

					if (value_1 === null) {
						if (!isNaN(parseFloat(value_2)))
							value_1 = 0;
						else
							value_1 = '';
					}

					if (value_2 === null) {
						if (!isNaN(parseFloat(value_1)))
							value_2 = 0;
						else
							value_2 = '';
					}

					if (sorting.order_by === 'desc')
						return value_2.toString().localeCompare(value_1.toString());
					else
						return value_1.toString().localeCompare(value_2.toString());
				});

				data.unshift(header_row);
			}

			return data;
		};

		ds.select(null, function (view) {
			progress.remove();
			if (true === show_again) $this.ctrl.show();

			var data = [
				[]
			];
			var header = [];
			var ref_key = null,
				key = null;

			//IF NO COLUMNS WAS SELECTED THEN LOAD ALL COLUMNS
			if (datasource.value.length > 0) {
				for (var index = 0; index < datasource.value.length; index++) {
					data[0].push(ds.fields[datasource.value[index]].title);
					header.push(ds.fields[datasource.value[index]].name);
				}
			} else {
				for (key in ds.fields) {
					data[0].push(ds.fields[key].title);
					header.push(ds.fields[key].name);
				}
			}
			if (typeof datasource.reference_key === 'string' &&
				datasource.reference_key.trim() !== '') {

				ref_key = ds.fields[datasource.reference_key].name;
				data[0].push('reference-key/' + ref_key);
			}

			var parts = [];
			var input_data = [];
			if (typeof datasource.filter === 'string') {
				parts = datasource.filter.split(/[(=)]/);
				if (parts.length > 1) {
					datasource.filter = {};
					datasource.filter[parts[0]] = $.trim(parts[1].replace(/(')|(")|(\r)|(\n)/g, ''));
				}
			}

			var filter = Object.assign({}, datasource.filter);
			var found = false;
			for (key in filter) {
				found = true;
				break;
			}

			if (true === found) {
				for (key in filter) {
					if (filter[key][0] === '{') {
						var message = Object.assign({}, $this.message);
						//THIS MUST BE AN ATTRIBUTE OF THE MESSAGE OF THE FORM
						var form = $this.getForm();
						if (form.isProcess() === false)
							message = Object.assign($this.message, form.message);

						filter[key] = filter[key].replace(/(\})|(\{)/g, '');

						if (message && (filter[key] in message))
							filter[key] = message[filter[key]];
					}
				}
				//logger.log($this.getForm().message);
				//console.log(filter);
				//console.log(view);
				if (!datasource.filter_type) datasource.filter_type = '';

				input_data = _.filter(view, function (item) {
					var result = true;

					for (key in filter) {

						var filter_val = filter[key];
						if (!filter_val) {
							//console.log('filter error:');
							//console.log(filter);
							continue;
						}
						if (filter_val instanceof Array) filter_val = filter_val[0];

						filter_val = filter_val.toString().trim().toLowerCase();
						var ref_val = null;

						if (key in item)
							ref_val = item[key].toString().trim().toLowerCase();

						switch (datasource.filter_type) {
							case 'contains':
								if (ref_val.indexOf(filter_val) === -1) {
									result = false;
									break;
								}
								break;

							default:
								if (item[key] != filter[key]) {
									//if (ref_val != filter_val){
									result = false;
									break;
								}
						}
					}

					return result;
				});
			} else
				input_data = view;

			//console.log(input_data);

			if (true === as_object) {
				return on_done(input_data);
			}

			if (datasource.aggregation && datasource.aggregation !== '') {
				var sql_view = new SQLView();
				data = sql_view.aggregate(
					input_data,
					[],
					[{
						name: datasource.aggregation,
						aggregate_type: datasource.aggregation
					}]);

				var value = 0;
				if (data.length !== 0)
					value = data[0][datasource.aggregation];

				data = [datasource.aggregation, value];

			} else {
				input_data = sort_data(header, input_data);

				$(input_data).each(function () {
					var item = [];
					for (var index = 0; index < header.length; index++) {
						item.push(this[header[index]]);
					}

					if (ref_key) {
						item.push(this[ref_key]);
					}

					data.push(item);
				});
			}
			if (datasource.value.length === 1 && !ref_key) {
				on_done(_.flatten(data));
			} else
				on_done(data);
		});
	}
}