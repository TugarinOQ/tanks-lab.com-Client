export const base = {

    JSON: {
        parse: (value) => {

            return JSON.parse(value);
        },
        encode: (value) => {

            return JSON.stringify(value);
        }
    },
    storage: {
        get: (key, json = false) => {

            return json === false ?
                localStorage.getItem(key)
                :
                base.JSON.parse(localStorage.getItem(key));
        },
        set: (key, value, json = false) => {

            return localStorage.setItem(key, json === false ? value : base.JSON.encode(value));
        },
        remove: (key) => {

            return localStorage.removeItem(key);
        }
    }
};
