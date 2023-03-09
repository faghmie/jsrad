import fa_icon_list from '../../config/icons.js';

export default class IconSelector {
    constructor(options_in) {
        this.options = Object.assign({
            use_icon: true,
            on_selected: function (icon_class, use_icon) { }
        }, options_in);
    }

    open() {
        var div = $('<div>');
        if ((typeof fa_icon_list === 'undefined') || (typeof fa_icon_list !== 'object')) {
            App.MessageError('Line-awesome icon-list did not load, please check if the la-icons.js file is in your app directory');
            return;
        }
        this.show();
    }

    show() {
        var list = [];
        for (var key in fa_icon_list) {
            let cls = key.trim();
            if (!cls.startsWith('lab ') && !cls.startsWith('las') && !cls.startsWith('lar ')){
                cls = 'la '+ cls;
            }
            list.push({
                text: fa_icon_list[key],
                class: cls
            });


        }

        list.sort(function (a, b) {
            return a.text.localeCompare(b.text);
        });

        var div = $(`<div class="icon-selector">`);
        var search = $("<input class='form-control' placeholder='type to search...' >").appendTo(div);
        search.on('input', function (evt) {
            var find = evt.target.value;

            ul.find('li').show();
            ul.find('li').each(function () {
                var cls = this.getAttribute('icon-class')||'';
                if (cls.indexOf(find) === -1) $(this).hide();
            });
        });

        var ul = $("<ul>").appendTo(div);
        ul.append('<li>');
        ul.find('li:last')
            .text('No Icon')
            .data('class', '');
        for (var index = 0; index < list.length; index++) {
            ul.append('<li>');
            ul.find('li:last')
                .append(`<i class="la-2x ${list[index].class}" icon-class="${list[index].class}">`)
                .attr('title', list[index].class.trim())
                .attr('icon-class', list[index].class);
        }
        ul.find('li')
            .on('click', function (evt) {
                let iconClass = evt.target.getAttribute('icon-class')||'';
                this.options.on_selected(
                    iconClass,
                    iconClass.length !== 0
                );
            }.bind(this));
        
        open_card(div, {
            title: 'Select Icon',
        });

        return this;
    }
}
