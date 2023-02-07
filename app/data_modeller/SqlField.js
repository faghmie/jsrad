import ColumnProperties from "./ColumnProperties.js";
import SqlBase from "./SqlBase.js";

export default class SqlField extends SqlBase{
	
	sql_type		= 'VARCHAR';
	comment		= null;
	sql_size		= 50;
	sql_default	= null;
	primary_key	= null;
	nullable		= true;
	auto_increment	= false;
	required		= false;
	show_on_editor	= true;
	show_on_grid	= true;
	data_type		= 'text';
	keys			= {};
	selected		= false;
	object_type 	= 'FIELD';
	
	constructor(owner, title, data, tableManager){
		super();

		this.ColumnProperties = new ColumnProperties(this, tableManager);

		this.table = owner;

		this.name = title;
		this.title = title;

		if (data){
			this.auto_increment = data.auto_increment || false;
			
			if (typeof data.show_on_import !== 'undefined')
				this.show_on_import = data.show_on_import;
	
			if (typeof data.show_on_grid !== 'undefined')
				this.show_on_grid = data.show_on_grid;
	
			if (typeof data.show_on_editor !== 'undefined')
				this.show_on_editor = data.show_on_editor;
			
			if (typeof data.type !== 'undefined')
				this.sql_type = data.type;
			
			if (typeof data.nullable !== 'undefined')
				this.nullable = data.nullable;
			
			if (typeof data.data_type !== 'undefined')
				this.data_type = data.data_type;
		}
	
		if (true === this.auto_increment) this.primary_key = true;

		this.build();
	}
	
	
	build() {
		var dest = this;
		
		this.dom.container = $("<tr class='sql-table-field'>")
									.append("<td class='remove-field faded-text' style='width:20px;'><span class='hide-me la la-times'></span></td>")
									.append("<td class='title'>")
									.append("<td class='typehint'>")
									.append("<td class='field-type'>");
									
		//CREATE A REFERENCE TO THE MAIN ROW OBJECT
		this.dom.title = this.dom.container.find('.title');
		this.dom.container.prop('row', this);
		
		this.dom.container.find('.title').on('click  tap', this, function(evt){
			evt.stopPropagation();
			evt.data.ColumnProperties.Show();
		});

		this.dom.container.find('.la-times').on('click tap', this, function(evt){
			evt.stopPropagation();

			App.Confirm('Are you sure you want to remove the field' + ' [' + evt.data.name + '] ?', function () {
				evt.data.destroy();
			});
		});
		
		this.dom.container.on('mouseover', function(evt){
			evt.stopPropagation();
			dest.dom.container.find('.hide-me').show();
		});

		this.dom.container.on('mouseleave', function(evt){
			evt.stopPropagation();
			dest.dom.container.find('.hide-me').hide();
		});
		
		this.dom.container
			.draggable({
				revert	: 'invalid',
				helper	: 'clone'
			})
			.droppable({
				drop		: function(evt, ui){
					var src		= ui.draggable.prop('row');
					document.dispatchEvent(new CustomEvent('foreign-key-add', {
						detail:{
							table: src.table,
							node_from: src,
							node_to: dest
						}
					}));

					dest.redraw();
				}
			});
		this.redraw();
	}

	setTitle(t) {
		// var _title = t;
				
		// if (this.comment){
		// 	_title += '<p class="comment">'+this.comment+'</p>';
		// }
		
		// if (this.dom.title)
		// 	this.dom.title.html(_title);
		
		super.set_title(t, this.comment);
	}

	setName(string){
		var result = false;

		if (typeof string === 'undefined') return result;

		var title = $.trim(string);
		var db_name = title.toLowerCase().replace(/( )/g, '_');

		//MAKE SURE THAT THE NAME IS NOT ALREADY IN THE LIST OF FIELDS
		if (typeof this.table.fields[this.uuid] === 'undefined' ||
			this.table.fields[this.uuid] === this){

			this.title = title;
			this.name = db_name;
			this.setTitle(this.title);
			result = true;
		} else {
			if (this.table.fields[this.uuid] !== this){
				App.MessageError('There is already a field with this name: '+db_name);
			}
		}
		
		return result;
	}
	
	hideConnector(bool){
		if (typeof bool === 'boolean') this.hide_connector = bool;
		
		this.redraw();
	}
		
	reset_index(){
		for(var c in this.table.fields){
			this.table.fields[c].index = this.table.fields[c].dom.container.index();
		}
	}
	
	up() {
		var prev = this.dom.container.prevAll('tr:visible:first');
		if (prev.length === 0){
			return;
		}
		prev.before(this.dom.container);
		
		this.reset_index();
	}

	down() {
		var next = this.dom.container.nextAll('tr:visible:first');
		if (next.length === 0){
			return;
		}
		next.after(this.dom.container);
		
		this.reset_index();
	}

	redraw() {
		var title		= this.dom.container.find('.title'),
			field_type	= this.dom.container.find('.field-type'),
			i			= 0,
			rel			= null;
		
		title.removeClass('primary');
		title.removeClass('key');
		field_type.html('');
		if (this.isPrimary()){
			title.addClass('primary');
			field_type.html('PK');
		}
		
		this.dom.container.show();
		
		document.dispatchEvent(new CustomEvent('table-redraw',{
			detail: {
				table: this.table
			}
		}));
		
		super.set_title();
	}

	destroy() {
		for (var i=0;i<this.keys.length;i++){
			this.keys[i].removeRow(this);
		}

		document.dispatchEvent(new CustomEvent('table-row-removed',{
			detail: {
				table: this.table,
				field: this
			}
		}));

		this.dom.container.remove();
	}
	
	toObject() {
		var obj = super.toObject();
			
		delete obj.table;
		delete obj.selected;
		delete obj.dom;
		delete obj.keys;
		delete obj.ColumnProperties;
		
		for(var key in obj){
			if (typeof obj[key] === 'function') delete obj[key];
		}
		
		obj.index = this.dom.container.index();
		
		return obj;
	}

	fromObject(node) {
		this.prototype = $.extend(true, this, node);
		if (this.auto_increment === true){
			this.primary_key = true;
		}

		if (!node.sql_type){
			switch($.trim(node.data_type).toLowerCase()){
				case 'number':
					if (node.auto_increment === true){
						this.sql_type = 'BIGINT';
						this.sql_size = 20;
					
					} else
						this.sql_type = 'INT';
					
					break;
				
				case 'lookup':
					this.sql_type = 'BIGINT';
					this.sql_size = 20;
					break;
				
				case 'text':
					this.sql_type = 'VARCHAR';
					this.sql_size = 50;
					break;
				
				case 'notes':
					this.sql_type = 'MEDIUMTEXT';
					break;
					
				case 'date':
					this.sql_type = 'DATETIME';
					break;
				
				default:
					this.sql_type = 'INT';
					break;
			}
		}
		
		this.redraw();
	}

	isPrimary() {
		if (this.auto_increment === true) return true;
		return false;
	}

	isUnique() {
		for (var i=0;i<this.keys.length;i++) {
			var k = this.keys[i];
			var t = k.getType();
			if (t === 'PRIMARY' || t === 'UNIQUE') { return true; }
		}
		return false;
	}

	isKey() {
		return this.keys.length > 0;
	};

	// this.build();
	// this.set_title(this.name);

}
