import { req } from './request.module';
import { urls__config } from '../configs/urls.config';

function get(cb) {

    req.get(balance.http,  { url: urls__config.hostLocal + urls__config.users.balance, err__cb: (err) => {

        console.log(err);
    }, success__cb: (res) => {

        cb(res);
    }
    });
}

function check(value, cb) {

    get((res) => {

        cb((res.silver >= value));
    });
}

export const balance = {
    http: null,
    get,
    check
};
