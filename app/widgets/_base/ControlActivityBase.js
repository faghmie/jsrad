export const ControlActivityBase = (superclass) => class extends superclass {
    create_attribute(attribute, hide_selector) {
        let form = this.getForm(),
            key = null;

        if (typeof this.message_map !== 'object') {
            this.message_map = { '@types': {} };
        }

        if (typeof this.message_map['@types'] !== 'object') {
            this.message_map['@types'] = {};
        }

        if (!this.message_map['@types'][attribute]) {
            this.message_map['@types'][attribute] = 'static';
        }

        let message = $(`<input type="text" class="form-control attribute-value">`)
            .val(this.message_map[attribute])
            .on('input', this, function (evt) {
                evt.stopPropagation();
                evt.data.message_map[attribute] = evt.target.value;

                //Fire off event to ensure change is stored
                document.dispatchEvent(new CustomEvent('ide-is-dirty'));
            });

        let list = [];
        for (let msg in this.message) {
            list.push(msg);
        }

        let prev_step = this.getForm().controls[this.previous_step];
        if (prev_step) {
            for (let msg in prev_step.message) {
                if (list.indexOf(msg) !== -1) continue;
                list.push(msg);
            }
        }

        list.sort(function (a, b) {
            return a.localeCompare(b);
        });

        let ctrl = $('<select>').addClass('form-control');

        for (key in form.controls) {
            if (key == this.uuid) continue;
            let text = form.controls[key].label.trim();

            if (text.length === 0) text = form.controls[key].name.trim();

            ctrl.append(`<option value="${key}">${text}</option>`);
        }

        ctrl.on('change', this, function (evt) {
            evt.data.message_map[attribute] = evt.target.value;
            //Fire off event to ensure change is stored
            document.dispatchEvent(new CustomEvent('ide-is-dirty'));
        });

        let select = $('<select>')
            .addClass('form-control attribute-type')
            .append("<option value='message'>Read From Message</option>")
            .append("<option  value='static'>Is Static Value</option>");

        select.on('change', this, function (evt) {
            evt.stopPropagation();
            evt.data.message_map['@types'][attribute] = evt.target.value;

            ctrl.hide();
            message.show();

            if (evt.target.value == 'control') {
                ctrl.show();
                message.hide();
            }

            //Fire off event to ensure change is stored
            document.dispatchEvent(new CustomEvent('ide-is-dirty'));
        });

        if (this.message_map['@types'][attribute] === 'message') {
            select.find('option:first-child').attr('selected', 'selected');
        }
        else {
            select.find('option:last-child').attr('selected', 'selected');
        }

        select.trigger('change');

        let result = [[attribute, message]];
        if (hide_selector !== true) {
            result.push(['get value from?', select])
        }
        return result;
    }

    clear_attributes() {
        //ON THIS CHANGE WE LOAD THE TABLES
        for (let attr in this.message_map) {
            if (attr === '@types') continue;
            this.message[this.message_map[attr]] = null;
        }
    }

    has_attribute(attribute) {
        console.log(Object.assign({}, this.message_map))

        if (typeof this.message_map !== 'object') {
            this.message_map = Object.assign({}, this.value);
        }

        return attribute in this.message_map;
    }

    get_attribute(attribute) {
        if (typeof this.message_map !== 'object')
            this.message_map = Object.assign({}, this.value);
        if (typeof this.message_map !== 'object') return null;
        if (
            this.message_map['@types'] &&
            this.message_map['@types'][attribute] === 'message'
        ) {
            return this.message[this.message_map[attribute]];
        } else if (
            this.message_map['@types'] &&
            this.message_map['@types'][attribute] === 'control'
        ) {
            if (this.message_map[attribute] in this.getForm().controls) {
                return this.getForm().controls[this.message_map[attribute]].val();
            } else {
                return null;
            }
        } else {
            return this.message_map[attribute];
        }
    }
}