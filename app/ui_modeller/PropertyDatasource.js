export default class PropertyDatasource {

    // Data aware properties
    data_awareness(widget) {
        if (!this.ctrl || !this.ctrl.datamodel || !this.ctrl.is_data_aware) {
            return;
        }


        this.ctrl.filter ||= {};

        this.add_separator('data model', widget);

        this.append_item('entity', this.#make_table_selector(), widget);
        this.append_item('filter', this.#make_filter_mapper_button(), widget);
        this.append_item('values', this.#make_mapper_button(), widget);
        this.append_item('fields', this.#make_field_mapper_button(), widget);

    }

    open_field_selector() {
        //ON THIS CHANGE WE LOAD THE TABLES
        let fields = [],
            mapper = $(`<div class="text-formater"></div>`);

        /** @type{SqlField|undefined} */
        let col = null;

        let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
        if (!table) return;

        this.ctrl.data_fields ||= [];

        for (col of table) {
            fields.push(col);
        }

        fields = fields.sort(function (a, b) {
            return (a.title || '').localeCompare(b.title);
        });

        fields.forEach(function (col) {
            let chk = $(`<input type="checkbox" value="${col.uuid}">`);

            if (this.ctrl.data_fields.indexOf(col.uuid) != -1) {
                chk[0].checked = true;
            }

            this.append_item(col.title, chk, mapper, true);
        }.bind(this));

        mapper.find('input').on('click', function (evt) {
            console.log(evt.target);
            let ctrl = this.ctrl;

            if (this.ctrl.data_single_field_selector === true) {
                mapper.find('input').each(function () {
                    console.log(this)
                    if (this != evt.target) {
                        this.checked = false;
                    }
                });
            }

            //Reset list and only added selected items
            ctrl.data_fields = [];
            mapper.find('input').each(function () {
                console.log(this)
                if (this.checked) {
                    ctrl.data_fields.push(this.value);
                }
            });

            console.log(ctrl.data_fields)
        }.bind(this));

        open_card(mapper, {
            title: 'Field Selector',
            'width': '30vw',
            'min-width': '30vw',
            'max-width': '30vw',
            'height': '60vh',
            'min-height': '60vh',
            'max-height': '60vh',
        });
    }

    open_mapper() {
        //ON THIS CHANGE WE LOAD THE TABLES
        let fields = [],
            mapper = $(`<div class="process-atrr-map"></div>`);

        /** @type{SqlField|undefined} */
        let col = null;

        let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
        if (!table) return;

        for (col of table) {
            fields.push(col);
        }

        fields = fields.sort(function (a, b) {
            return (a.title || '').localeCompare(b.title);
        });
        mapper.append(`
			<div class="header">Field</div>
			<div class="header">Value</div>
			<div class="header">Select Source</div>
		`);

        fields.forEach(function (col) {
            let field = this.ctrl.create_attribute(col.uuid);

            mapper.append(`<div class="first-col" value="${field.uuid}">${col.title}</div>`);

            let div = $(`<div></div>`).append(field[0][1]).appendTo(mapper);

            div = $(`<div></div>`).append(field[1][1]).appendTo(mapper);
        }.bind(this));

        open_card(mapper, {
            title: 'Map database fields',
            'width': '60vw',
            'min-width': '60vw',
            'max-width': '60vw',
            'height': '60vh',
            'min-height': '60vh',
            'max-height': '60vh',
        });
    }

    open_filter_mapper() {
        //ON THIS CHANGE WE LOAD THE TABLES
        let fields = [],
            mapper = $(`<div class="process-atrr-map"></div>`);

        /** @type{SqlField|undefined} */
        let col = null;

        let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
        if (!table) return;

        for (col of table) {
            fields.push(col);
        }

        fields = fields.sort(function (a, b) {
            return (a.title || '').localeCompare(b.title);
        });
        mapper.append(`
			<div class="header">Field</div>
			<div class="header">Value</div>
			<div class="header">Select Source</div>
		`);

        fields.forEach(function (col) {
            this.#make_filter_row(mapper, col);
        }.bind(this));

        open_card(mapper, {
            title: 'Define Filter',
            'width': '60vw',
            'min-width': '60vw',
            'max-width': '60vw',
            'height': '60vh',
            'min-height': '60vh',
            'max-height': '60vh',
        });
    }

    #make_filter_row(mapper, field) {
        mapper.append(`<div>${field.title}</div>`);
        this.ctrl.filter[field.uuid] ||= {};

        let input = $(`<input class="form-control">`)
            .val(this.ctrl.filter[field.uuid].value)
            .on('input', function (evt) {
                this.ctrl.filter[field.uuid].value = evt.target.value;

                if (evt.target.value.length == 0) {
                    this.ctrl.filter[field.uuid] = {};
                }
                //Fire off event to ensure change is stored
                document.dispatchEvent(new CustomEvent('ide-is-dirty'));
            }.bind(this))

        let div = $(`<div></div>`).append(input).appendTo(mapper);

        let filter_types = ['equals', 'not equal', 'is empty', 'contains'];

        let select = $('<select class="form-control form-select">');

        filter_types.forEach(function (item) {
            select.append(`<option>${item}</option>`);
            if (item == this.ctrl.filter[field.uuid].type) {
                select.find('option:last-child').attr('selected', 'selected');
            }

            //Fire off event to ensure change is stored
            document.dispatchEvent(new CustomEvent('ide-is-dirty'));
        }.bind(this));

        select.on('change', this, function (evt) {
            evt.stopPropagation();
            this.ctrl.filter[field.uuid].type = evt.target.value;

            //Fire off event to ensure change is stored
            document.dispatchEvent(new CustomEvent('ide-is-dirty'));
        }.bind(this));

        div = $(`<div></div>`).append(select).appendTo(mapper);
    }

    #make_table_selector() {
        let prop = $(`<div class="d-flex flex-row w-100">`);
        let tables = $('<select class="form-control form-select">').appendTo(prop);
        let _ = $(`<button><i class="la la-table"></i></button>`)
            .appendTo(prop)
            .on('click', function () {
                let entity = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
                if (!entity) {
                    return App.notifyError('No entity selected');
                }

                entity.show_data();
            }.bind(this));

        /** @type{SqlTable|undefined} */
        let tbl = null;

        tables.append('<option>');

        for (tbl of this.ctrl.datamodel.TableManager) {
            tables.append(`<option value="${tbl.uuid}">${tbl.title}</option>`);
            if (this.ctrl.entity === tbl.uuid) {
                tables.find('option:last-child').attr('selected', 'selected');
            }
        }

        tables.on('change', function (evt) {
            console.log(evt.target.value)
            this.ctrl.entity = evt.target.value;
            //Fire off event to ensure change is stored
            document.dispatchEvent(new CustomEvent('ide-is-dirty'));
        }.bind(this));

        return prop;
    }

    #make_filter_mapper_button() {
        let btn = $(`<button class="w-100">Filter</button>`);

        btn.on('click', function () {
            this.open_filter_mapper();
        }.bind(this));

        return btn;
    }

    #make_mapper_button() {
        let btn = $(`<button class="w-100">Values</button>`);

        btn.on('click', function () {
            this.open_mapper();
        }.bind(this));

        return btn;
    }

    #make_field_mapper_button() {
        let btn = $(`<button class="w-100">Fields</button>`);

        btn.on('click', function () {
            this.open_field_selector();
        }.bind(this));

        return btn;
    }
}
