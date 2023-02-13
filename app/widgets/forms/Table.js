import ControlInterface from "../_base/ControlInterface.js";

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

		// this.setValue();
		//  
			
		// this.ctrl.find('.table-container').css({
		// 	height: (parseFloat(this.dom.container.css('height')) - parseFloat(caption.css('height')) - 20),
		// 	overflow : 'auto',
		// 	display : 'block',
		// });
	
		// this.ctrl.find('table').css({
		// 	'max-height' : parseFloat(this.dom.container.css('height')),
		// });
		
		// this.ctrl.removeClass(this.panel_types.join(' ').replace(/bg-/g, 'border-'));
		// this.ctrl.removeClass('border-none none');
		// // this.ctrl.removeClass('card');
		
		// caption.removeClass('bg-heading').addClass('h4');
		// // this.ctrl.find('.table-container').removeClass('bg-body');
		// caption.removeClass(this.panel_types.join(' '));
		// caption.removeClass('text-dark text-light');
		// if (this.panel_type !== 'none'){
		// 	caption.addClass(this.panel_type);
		
		// 	caption.addClass(this.panel_type === 'bg-light' ? 'text-dark' : 'text-white');
		// 	this.ctrl.addClass(this.panel_type.replace('bg-', 'border-'));
	
		// 	caption.addClass('bg-heading').removeClass('h4');
		// 	// this.ctrl.find('.table-container').addClass('bg-body');
		// }

		// console.log('class ',this.ctrl.attr('class'));
		
		// $table
		// 	.on('click', 'tr', function(evt){
		// 		evt.stopPropagation();
		// 		let is_active = $(this).hasClass('row-is-selected');
				
		// 		$table.find('tr').removeClass('row-active row-is-selected');
				
		// 		if (false === is_active || evt.ctrlKey === true)
		// 			$(this).addClass('row-active row-is-selected');
		// 	})
		// 	.on('mouseleave', 'tr', function(){
		// 		let row = $(this);
				
		// 		if (row.hasClass('row-is-selected') !== true)
		// 			row.removeClass('row-active');
		// 	});
		
		// let td_height = parseFloat($table.find('.td-content:first-child').closest('td').css('height'));
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
	
	// get_settings (){
	// 	if (typeof this.value !== 'object') this.value = {};
	// 	if (typeof this.label !== 'string') this.label = '';
		
	// 	let $this = this;

	// 	let type_list = $('<select>').addClass('form-control');
	// 	type_list.append('<option>');
	// 	for(let i = 0; i < this.panel_types.length; i++){
	// 		type_list.append('<option>'+this.panel_types[i]+'</option>');
	// 	}
		
	// 	type_list.find('option').each(function(){
	// 		let opt = $(this);
	// 		if (opt.val() === $this.panel_type) opt.attr('selected', 'selected');
	// 	});
		
	// 	type_list.on('change', function(){
	// 		$this.panel_type = $(this).val();
	// 		$this._format();
	// 	});
		
	// 	//UNIQUE LIST
	// 	let unique_list = $("<input type='checkbox'>");
	// 	if (this.unique_list === true)
	// 		unique_list.attr("checked", "checked");
		
	// 	unique_list.on("click", this, function(evt){
	// 		evt.data.unique_list = $(this).is(":checked");
	// 		evt.data.setValue();
	// 	});
		
	// 	//TEXT
	// 	let text = $('<textarea>').val(this.default_value);
		
	// 	text.on('input', function(evt){
	// 		evt.stopPropagation();
	// 		$this.default_value = $(this).val();
	// 		$this.setValue($this.default_value);
	// 	});
		
	// 	return [
	// 		['unique table list', unique_list],
	// 		['panel type', type_list],
	// 		['default data', text],
	// 	];
	// }
	
	// setLabel (value){
	// 	this.label = typeof value !== 'undefined' ? $.trim(value) : this.label;
	// 	this.format();
	// }
	
	setValue (value){
		this.value = typeof value !== 'undefined' ? value : this.value;
		console.log('got here')
		this.read_records().then(function(data){
			if (data){
				this.value = data;
			}

			if (this.in_run_mode === false){
				this.value = this.default_value;
				console.log(this.value)
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
		
		if (!(value instanceof Array)) list = this.value;

		if (!(list instanceof Array)) 
		{
			return;
		}
		
		let table = this.ctrl.find('table');
		
		table.children().remove();

		hdr = list.shift();
		let thead = $(`<thead>`);
		let tr = $(`<tr>`).appendTo(thead);
		hdr.forEach(col => {
			tr.append(`<th>${col}</th>`);
		});


		let tbody = $('<tbody>');
		list.forEach(row =>{
			tr = $(`<tr>`).appendTo(tbody);
			row.forEach(col => {
				tr.append(`<td>${col}</td>`)
			});
		});
		
		table.append(thead).append(tbody);

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
