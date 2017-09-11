import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { urls__config } from '../../configs/urls.config';
import { req } from '../../modules/request.module';

@Component({
  selector: 'home',
  templateUrl: '../../views/pages/home.view.html',
  styleUrls: [ '../../styles/pages/home.style.scss' ]
})

export class homeComponent {

    dayTitle = '';
    amountTitle = '0.00';
    usersTitle = '0';

    fakeValue = {
        amount: 1849.42,
        users: 29
    };

    constructor(private http: Http) {

      req.get(this.http, {
          url: urls__config.hostLocal + urls__config.info.get,
          err__cb: () => { },
          success__cb: (res) => {

              this.dayTitle = `${res.days} ${this.declOfNum(['день', 'дня', 'дней'])(res.days)}`;
              this.amountTitle = `${this.fakeValue.amount + parseFloat(res.payments)}`;
              this.usersTitle = `${this.fakeValue.users + res.users}`;
          }
      });
    }

    declOfNum(titles) {
        const cases = [2, 0, 1, 1, 1, 2];
        return function(number) {

            return titles[ (number % 100 > 4 && number % 100 < 20) ?
                2
                :
                cases[(number % 10 < 5) ? number % 10 : 5] ];
        };
    }
}
