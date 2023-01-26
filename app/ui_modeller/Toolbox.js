import ControlFactory from '../widgets/ControlFactory.js';

export default class Toolbox {

    toolbox = null;

    constructor() {
        this.#create();
    }

    Get() {
        this.#attach_events();

        return this.toolbox;
    }

    Show() {
        this.#filter_widgets();
    }

    #create() {
        this.toolbox = $(`<div class="design-toolbox-widgets">
                <select class="form-control"/>
                <input type="text" placeholder="refine search" class="search-box form-control"/>
                <div class="props-edit"><ul class="toolbox-area"/></div>
            </div>`);

        import('../widgets/widgets.js').then(function (plugins) {
            this.#add_plugins_to_list(plugins.default);
        }.bind(this)).catch(ex => {
            console.log(ex)
        });
    }

    #add_plugins_to_list(plugins) {
        let widgets = this.toolbox.find('ul.toolbox-area');

        plugins = plugins.sort(function (a, b) {
            return a.label.localeCompare(b.label);
        });
        let cats = [];

        for (let c = 0; c < plugins.length; c++) {
            if (cats.indexOf(plugins[c].category) === -1) {
                cats.push(plugins[c].category);
            }
        }

        cats = cats.sort(function (a, b) {
            return a.localeCompare(b);
        });

        cats.forEach(function(item){
            let cat = $(`<div class="widget-category">${item}</div>`).appendTo(widgets);
            let clsCat = item.replaceAll(' ', '-').replaceAll('(', '').replaceAll(')', '').trim();
            cat.addClass(clsCat);

            plugins.forEach(function(widget){
                if (widget.category != item){
                    return;
                }

                this.#add_widget(widget, widgets);
            }.bind(this));    
        }.bind(this));


        let select = this.toolbox.find('select');
        select.append('<option>ALL</option>');
        for (let c = 0; c < cats.length; c++) {
            select.append('<option>' + cats[c] + '</option>');
            if (cats[c] == 'ALL') {
                select.find('option:last').attr('selected', 'selected');
                this.#filter_widgets();
            }
        }
    }

    #filter_widgets() {
        let $this = this;
        let text = this.toolbox.find('input').val().toLowerCase().trim();
        let cat = this.toolbox.find('select').val();

        this.toolbox.find('.toolbox-area .widget-category').hide();

        this.toolbox.find('.toolbox-area .widget-template').each(function () {
            $(this).show();
            let title = this.getAttribute('title');
            let category = this.getAttribute('category');
            let clsCat = category.replaceAll(' ', '-').replaceAll('(', '').replaceAll(')', '').trim();
            let catMarker = $this.toolbox.find('.'+clsCat);

            catMarker.show();

            if (!category) {
                $(this).hide();
                catMarker.hide();
            } else {
                if (text.length !== 0 && title.toLowerCase().indexOf(text) === -1) {
                    $(this).hide();
                    catMarker.hide();
                }

                if (cat != 'ALL') {
                    if (category !== cat){
                        $(this).hide();
                        catMarker.hide();
                    }
                }
            }
        });
    }

    #attach_events() {
        this.toolbox.find('input').off('input').on('input', this, function (evt) {
            evt.stopPropagation();
            evt.data.#filter_widgets();
        });

        this.toolbox.find('select').off('change').on('change', this, function (evt) {
            evt.stopPropagation();
            evt.data.#filter_widgets();
        });

        this.toolbox.on('click', '.toolbox-area .widget-template', function (evt) {
            document.dispatchEvent(new CustomEvent('ide-control-add', {
                detail: JSON.parse(this.getAttribute('widget'))
            }));
        });

        this.toolbox.find('.toolbox-area .widget-template').draggable({
            revert: 'invalid',
            helper: function (evt) {
                let helper = $(`<div>`)
                    .css({
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '50px',
                    })
                    .html(this.getAttribute('type').replaceAll('./', ''))
                    .attr('widget', this.getAttribute('widget'))
                    .addClass('widget-template');
                $('body').append(helper);
                return helper;
            },

            containment: 'body'
        });
    }

    #add_widget(widget, target) {
        let already_exist = false;

        //Fix for module to load successfully
        widget.type = `./${widget.type}`;

        //CHECK TO ENSURE THAT THE CONTROL DOES NOT ALREADY EXIST
        target.find('.widget-template').each(function () {
            if ($(this).attr('type') === widget.type) {
                already_exist = true;
                App.MessageWarning(widget.type + ' already loaded');
            }
        });

        if (true === already_exist) return;

        target.each(function () {
            let li = $(`<div class="widget-template" title="${widget.label}">
                        <div class="widget-container">
                            <div class="widget-thumbnail"/>
                            <div class="widget-caption"/>
                        </div>' +
                    </div>`)
                .appendTo(this)
                .attr('widget', JSON.stringify(widget))
                .attr('type', `./${widget.type}`)
                .attr('category', widget.category);

            if (widget.thumbnail.indexOf('class:') !== -1) {
                li.find('.widget-thumbnail')
                    .append('<i class="' + widget.thumbnail.replace('class:', '') + '"/>');
            } else {
                li.find('.widget-thumbnail')
                    .append("<img src='" + widget.thumbnail + "' alt='...' />");
            }

            li.find('.widget-caption').text(widget.label);
        });
    }
}