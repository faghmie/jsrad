import line_connection from "../widgets/connections.js";
import ConnectionProperties from "../widgets/connection_properties.js";
import ControlFactory from "../widgets/ControlFactory.js";

export default class FormManager {

    designer;
    controls = {};
    connections = [];

    constructor(designer) {
        this.designer = designer;

        this.#listen_for_events();
    }

    [Symbol.iterator]() {
        let index = -1;
        let data = Object.keys(this.controls);
        let $this = this;

        return {
            next: () => ({
                value: $this.controls[data[++index]],
                done: !(index in data)
            })
        };
    }

    #listen_for_events(){
        document.addEventListener('ui-form-show', function(evt){
			this.showForm(evt.detail);
		}.bind(this));

		document.addEventListener('ui-control-add-connector', function(evt){
			this.AddConnector(evt.detail.form, evt.detail.from, evt.detail.to);
		}.bind(this));

        document.addEventListener('ui-control-redraw-connector', function(evt){
			this.connections.forEach(item => {
                if (item.container_id == evt.detail.form.uuid){
                    item.connect();
                }
            });
		}.bind(this));

        document.addEventListener('ui-connector-clicked', function(evt){
            this.#on_connector_clicked(evt.detail.connector);
		}.bind(this));

        document.addEventListener('ui-connector-removed', function(evt){
			this.RemoveConnector(evt.detail.connector);
		}.bind(this));

        document.addEventListener('ui-disconnect-control', function(evt){
			this.RemoveConnectionsFromControl(evt.detail);
		}.bind(this));

        document.addEventListener('ui-connector-mouse-over', function(evt){
            let line = evt.detail.connector;
            line.current_bg = line.style['border-color'];
            line.style['border-color'] = 'red';
            line.connect();
		}.bind(this));

        document.addEventListener('ui-connector-mouse-out', function(evt){
            let line = evt.detail.connector;
            line.style['border-color'] = line.current_bg;
            delete line.current_bg;
            line.connect();
		}.bind(this));
    }

    #on_connector_clicked(line){
        if (this.designer.in_run_mode){
            return;
        }
        let props = (new ConnectionProperties(line)).GetProperties();
        
        props.css({ 'overflow' : 'show' });

        open_card(props,{
            title: 'Line Settings',
            'width': '350px',
            'min-width': '350px',
            'max-width': '350px',
            'height': '80px',
            'min-height': '80px',
            'max-height': '80px',
        });
    }

    /**
     *Get the form based on GUID in control list
     *
     * @param {*} form_guid
     * @memberof FormManager
     */
    Get(form_guid) {
        return this.controls[form_guid];
    }

    Exists(form_guid) {
        return form_guid in this.controls;
    }

    Count(){
        return Object.keys(this.controls).length;
    }

    async addForm(node) {

        let form = await new ControlFactory().Get(this.designer, {type:'./Form', label: 'Form'});
        if (typeof node !== 'undefined') {
            await form.fromObject(node);
        }

        this.controls[form.uuid] = form;
        form.designer = this.designer;
        form.panel = $('<div>').addClass('form-canvas');
        form.panel
            .attr('id', 'panel-' + form.uuid)
            .append(form.dom.container)
            .appendTo(this.designer.dom.design_forms)
            .data('form', form);
        
        form.change_mode(false);
        
        this.showForm(form);
        
        if (App.is_mobile){
            form.resize(parseFloat(document.documentElement.clientWidth) - 10, 2 * parseFloat(document.documentElement.clientHeight));
        } 

        return form;
    }

    removeFormById(form_guid) {
        this.removeForm(this.control[form_guid]);
    }

    removeForm(form) {
        delete this.controls[form.uuid];
        form.destroy();
    }

    removeAllForms() {
        for (let f in this.controls) {
            this.removeForm(this.controls[f]);
        }
    }

    hideAll() {
        for (let f in this.controls) {
            this.controls[f].hide();
        }
    }

    showForm(form) {
        let $this = this.designer;

        if (typeof form === 'string') {
            form = this.controls[form];
        } else if (typeof form === 'undefined' || form == null){
            form = this.getActiveForm();
        }
        
        if (!form) return console.log('no form');

        this.designer.project_change_mode(!this.designer.in_run_mode);
        this.designer.dom.design_forms.children().hide();
        form.show();
        this.connections.forEach(item =>{
            if (item.container_id == form.uuid){
                item.connect();
            }
        });

        return $this;
    }

    cloneForm() {
        let form = this.getActiveForm();
        let clone = form.toObject();

        clone.uuid = generate_uuid();
        for (let ctrl in clone.controls) {
            let key = generate_uuid();
            clone.controls[key] = Object.assign({}, clone.controls[ctrl]);
            clone.controls[key].form = clone.uuid;
            clone.controls[key].uuid = key;

            delete clone.controls[ctrl];
        }

        this.addForm(clone);
    }

    getActiveForm() {
        let active_form = this.designer.dom.design_forms.find('.form-canvas:visible');
        return active_form.data('form');
    };

    GenerateDocument(form) {
        return new Promise((resolve, reject) => {

            form.show();

            if (typeof form.deselect === 'function') form.deselect();

            for (let ctrl in form.controls) {
                if (typeof form.controls[ctrl].deselect === 'function') {
                    form.controls[ctrl].deselect();
                }
            }

            form.ctrl.removeClass('design-mode');

            html2canvas(form.ctrl, {
                onrendered: function (canvas) {
                    form.ctrl.addClass('design-mode');

                    let div = $('<div>').addClass('docs');
                    div.append('<h1>' + form.label + '</h1>');

                    let img = $('<img>').appendTo(div);
                    img.attr('src', canvas.toDataURL());

                    div.append(form.get_documentation());
                    div.append('<hr><br>');

                    resolve(div.html());
                }
            }, {
                allowTaint: true,
                useCORS: true
            });
        });
    }

    #remove_connector_for_control(ctrl){
		for (let idx = 0; idx < this.connections.length; idx++) {
            if (this.connections[idx].contains(ctrl.dom.container[0])) {
                this.connections[idx].destroy();
				this.connections.splice(idx, 1);
			}
		}
    }

    RemoveConnectionsFromControl(ctrl){
		for (let idx = 0; idx < this.connections.length; idx++) {
            if (this.connections[idx].startsWith(ctrl.dom.container[0])) {
                this.connections[idx].destroy();
				this.connections.splice(idx, 1);
			}
		}
    }

    RemoveFormControl(ctrl){
        for (let key in ctrl.form.controls) {
            if (ctrl.uuid === ctrl.form.controls[key].container_id) {
                ctrl.form.controls[key].destroy();
                
                this.#remove_connector_for_control(ctrl.form.controls[key]);
                
                delete ctrl.form.controls[key];
            }
        }

        //REMOVE THE ACTUAL CONTROL
        this.#remove_connector_for_control(ctrl);
        ctrl.destroy();
        delete ctrl.form.controls[ctrl.uuid];

        ctrl.form.setProcessStatus();
    }

    AddConnector(form, node_from, node_to, _style){
        if (!form || !node_from || !node_to){
            return;
        }

        let existing_line = null;

        this.connections.forEach(item => {
            if (item.source_id == node_from.uuid && item.destination_id == node_to.uuid){
                existing_line = item;
            }
        });

        if (existing_line){
            existing_line.connect();
            return;
        }

        //If you get here, it means the connection does not exist
        let line = new line_connection({
            from		: node_from.dom.container[0],
            to			: node_to.dom.container[0],
            container	: form.ctrl[0],
            source_id   : node_from.uuid,
            destination_id : node_to.uuid,
            container_id : form.uuid,
            event_prefix: 'ui-',
            style       : Object.assign({ 'cursor': 'pointer' }, _style)
        });

        this.connections.push(line);
    }

    RemoveConnector(connector) {
		for (let idx = 0; idx < this.connections.length; idx++) {
            if (this.connections[idx] == connector) {
				this.connections.splice(idx, 1);
			}
		}
        connector.destroy();
	}

    toObject(){
		let lines = this.connections.map(item => { 
            return JSON.stringify({
				from	    : item.connection.source_id,
				to		    : item.connection.destination_id,
				container   : item.connection.container_id || ':root',
				style	    : item.style
			});
		});

        lines = lines.filter((c, index) => {
            return lines.indexOf(c) === index;
        }).map(item => JSON.parse(item));
        
        return lines;
	};
}