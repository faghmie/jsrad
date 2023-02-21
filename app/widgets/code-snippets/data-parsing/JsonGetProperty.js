import BaseActivity from "../BaseActivity.js";

export default class JsonGetPropertyActivity extends BaseActivity {
    get_settings() {
        let settings = super.get_settings();

        return [
            ...settings,
            ...this.create_attribute('json object'),
            ...this.create_attribute('property to find'),
            ...this.create_attribute('map response to', true),
        ];
    }

    execute() {
        let prop = this.get_attribute('property to find'),
            json = this.get_attribute('json object');

        this.message[this.get_attribute('map response to')] = this.#get_json_property(json, prop);

        this.next();
    }

    #get_json_property(json, property) {
        let props = property.split('.');
        if (typeof json === 'string') {
            json = JSON.parse(json);
        }

        let result = json;
        props.forEach(item => {
            for (let prop in result) {
                if (prop === item) {
                    result = result[prop];
                    break;
                }
            }
        });
        return result;
    }
}
