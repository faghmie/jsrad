import ControlInterface from "../_base/ControlInterface.js";
import DataForm from "../_base/DataForm.js";

export default class PanelControl extends ControlInterface {

	data_table_field = true;
	is_data_aware = true;

	properties	= {
			height		: 150,
			width			: 500,
			label			: 'Sample Table',
		};
		
	default_value	= `column-1,column-2,column-3
	value-1,value-2,value-3
	value-4,value-5,value-6
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9
	value-7,value-8,value-9`;

	// style_to_exclude	= ['border-width', 'border-color'];
	
	// panel_types		= ['none', 'bg-light', 'bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger'];
	
    ignore_properties= [
			'on-click',
			//'name',
			'allow inline editor',
		];
	
	format	(){
		super.format();

		let caption = this.ctrl.find('.caption');
		
		caption.hide();
		this.label = this.label.trim();
		caption.html(this.label);
		if (this.label.length !== 0){
			caption.show();
		}

		caption.css({
			'background-color': this.style['background-color']
		});
	}
	
	make_sortable(){
		let $this = this;
		this.ctrl.find('th').css({
				cursor: 'pointer'
			});
		
		this.ctrl.off('click').find('th').on('click', function(evt){
			evt.stopPropagation();
			let th = $(this);
			
			let sort_order = th.data('sort-order');
			if (sort_order === 'asc')
				sort_order = 'desc';
			else
				sort_order = 'asc';
			
			th.data('sort-order', sort_order);
			
			let hdr = $this.value.shift();
			
			$this.value = $this.value.sort(function(a, b){
				switch(sort_order){
					case 'asc':
						if ((a instanceof Array) && (b instanceof Array))
							return a[th.index()].toString().localeCompare(b[th.index()].toString());
						else {
							if (a && b)
								return a.toString().localeCompare(b.toString());
							else
								return 0;
						}
						break;
					default:
						if ((a instanceof Array) && (b instanceof Array))
							return b[th.index()].toString().localeCompare(a[th.index()].toString());
						else {
							if (a && b)
								return b.toString().localeCompare(a.toString());
							else
								return 0;
						}
				}
			});
			
			$this.value.unshift(hdr);
			$this.SetFromArray($this.value, true);
			$this._format();
			$this.ctrl.find('th i').remove();
			if (sort_order === 'asc')
				th.append('<i class=\'pull-right la la-caret-up\'>');
			else
				th.append('<i class=\'pull-right la la-caret-down\'>');
			
		});		
	}
	
	setValue (value){
		this.value = typeof value !== 'undefined' ? value : this.value;
		this.read_records().then(function(data){
			if (data){
				this.value = data;
			}

			if (this.in_run_mode === false){
				this.value = this.default_value;
			}

			if (typeof this.value === 'string'){
				this.value = this.value.trim().split(/\n|\r/g);
				for(let id = 0; id < this.value.length; id++){
					if (typeof this.value[id] === 'string')
						this.value[id] = this.value[id].split(/,/g);
				}
			}
			
			this.SetFromArray();
			
			this.format();

		}.bind(this));
		
		return this;
	}
	
	
	SetFromArray (value){
		let list = value,
			hdr = null;
		
		let fields_to_ignore = ['__system_id__'];

		if (!(value instanceof Array)) list = this.value;

		if (!(list instanceof Array)) 
		{
			return;
		}
		
		let table = this.ctrl.find('table');
		
		table.children().remove();

		hdr = list.shift()||[];
		let thead = $(`<thead>`);
		let tr = $(`<tr>`).appendTo(thead);
		let skip_list = [];
		let system_id_key = null;
		hdr.forEach((col, index) => {
			if (fields_to_ignore.indexOf(col) !== -1){
				skip_list.push(index);
				system_id_key = index;
				return;
			}
			tr.append(`<th>${col}</th>`);
		});


		let tbody = $('<tbody>');
		list.forEach(row =>{
			tr = $(`<tr>`).appendTo(tbody);
			tr.attr('datamodel-system-id', row[system_id_key]);

			row.forEach((col, index) => {
				if (skip_list.indexOf(index) !== -1){
					return;
				}

				tr.append(`<td>${col}</td>`)
			});
		});
		
		table.append(thead).append(tbody);

		tbody.on('dblclick', 'td', function(evt){
			let dataForm = new DataForm();
			dataForm.Open(this, evt.target.parentElement.getAttribute('datamodel-system-id'));
		}.bind(this));

		this.ctrl.show();
	}

	getControl	(){
		this.ctrl = $(`<div class="table-container">
						<div class="caption"></div>
						<div class="body">
							<table></table>
						</div>
					</div>`);
		
		return this.ctrl;
	}
}
