//@ts-check

import ControlFactory from "../ControlFactory.js";

export default class ControlBase {
    ctrl;
    controls = {};
    in_run_mode = false;
    uuid = null;

    setUUID(uuid) {
		// @ts-ignore
		if (!uuid || typeof uuid === 'undefined') uuid = generate_uuid();
        
		this.uuid = uuid;

		let ctrl = this.ctrl.find('.main-control');
		if (ctrl.length !== 0)
			ctrl.attr('id', uuid);
		else
			this.ctrl.attr('id', uuid);

		return this;
	}

    async fromObject(node, form) {
        let str_ctrl = null,
            obj = null,
            ctrl = null;

        for (let key in node) {
            this[key] = JSON.parse(JSON.stringify(node[key]));
        }

        this.selected = false;

        //SET THE FORM
        if (form && form.uuid != this.uuid) {
            this.form = form;
        } else {
            form = this.getForm();
        }

        for (str_ctrl in this.controls) {
            obj = this.controls[str_ctrl];

            ctrl = await new ControlFactory().Get(form, obj);

            if (!ctrl) continue;
            
            this.controls[str_ctrl] = await ctrl.fromObject(obj, form);
            this.controls[str_ctrl].in_run_mode = form.in_run_mode;

            if (ctrl.is_an_activity === true)
                form.is_a_process = true;
        }

        return this;
    }

    toObject() {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        let obj = JSON.parse(JSON.stringify(this, getCircularReplacer()));

        if (obj.form)
            obj.form = obj.form.uuid;
        else
            obj.form = null;

        delete obj.dom;
        delete obj.designer;
        delete obj.ctrl;
        delete obj.prototype;
        delete obj.properties;
        delete obj.preview;
        delete obj.ignore_properties;

        delete obj.style_to_exclude;
        delete obj.in_run_mode;
        delete obj.aspect_ratio;
        delete obj.control_category;
        delete obj.control_description;
        delete obj.control_form;
        delete obj.control_thumbnail;
        delete obj.control_name;
        delete obj.control_label;
        delete obj.message;
        delete obj.pre_message;
        delete obj.post_message;
        delete obj.navigation;

        if (obj.datasource && obj.datasource.name === null)
            delete obj.datasource;

        for (let key in this.controls) {
            let ctrl = this.controls[key];
            obj.controls[key] = ctrl.toObject();
            if (ctrl.form) {
                obj.controls[key].form = ctrl.form.uuid;
            }
        }

        for (let key in obj) {
            if (typeof obj[key] === 'function') delete obj[key];
            if (obj[key] === null) delete obj[key];
        }

        return obj;
    }

    getForm() {
		let form = this.form;
		if (!form) form = this;

		return form;
	}

    findControlByName(name) {
        let ctrl = null;
        for (let c in this.controls) {
            if (name == this.controls[c].name){
                ctrl = this.controls[c];
                break;
            }
        }

        return ctrl;
    }
}