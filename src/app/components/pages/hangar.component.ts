import { Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { gameComponent } from './game.component';
import { urls__config } from '../../configs/urls.config';
import { config } from '../../configs/base.config';

import { balance } from '../../modules/balance.module';
import { req } from '../../modules/request.module';
import { alertBox } from '../../modules/alert.module';
import { base } from  '../../modules/base.module';
import * as d3 from 'd3';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
    selector: 'hangar',
    templateUrl: '../../views/pages/hangar.view.html',
    styleUrls: [
        '../../styles/pages/hangar.style.scss',
        '../../styles/vehicles_ussr.scss',
        '../../styles/levels.style.scss',
        '../../styles/types.style.scss'
    ]
})

export class hangarComponent {

    section = '';
    tanks = [];
    showTank = false;
    visibleToSell = false;
    selectedTank = <any>{};
    tankImprovements = [];

    countSeats = 0;
    freeSeats = 0;
    countScreenSeats = [];
    price = <any>{};

    researchedTank;
    researchTime = undefined;
    updateResearchTime;

    constructor(private http: Http, private game: gameComponent, private titleService: Title) {

        this.titleService.setTitle( 'Ангар' + config.genTitle() );

        this.getTanksList();
        balance.http = this.http;
        this.price = base.storage.get('price', true);
    }

    getTanksList() {

      this.countScreenSeats = new Array(parseInt((window.screen.width / 165).toString()));

      alertBox.loading.show();

      req.get(this.http,
          {
            url: urls__config.hostLocal + urls__config.hangar.getList,
            err__cb: (res) => {

                alertBox.show({ title: 'Ошибка', html: res.error });
            },
            success__cb: (res) => {

              alertBox.loading.hide();

              this.tanks = this.getTank(res.tanks);

              this.countScreenSeats = new Array( parseInt(
                  (window.screen.width / 165).toString() ) - Object.keys(res.tanks).length - 2
              );
              this.freeSeats = res.countSeats - Object.keys(res.tanks).length;
              this.countSeats = res.countSeats;

              this.selTank(res.tanks[ Object.keys(res.tanks)[0] ]);

              this.showTank = true;
            }
          });
    }

    getTank(tanks) {

      const _tanks = [];

      Object.keys(tanks).map((idxTank) => {

          const tmpTank = tanks[idxTank];
          tmpTank.key = idxTank;
          tmpTank.outGold = 0.00;

          _tanks.push( tmpTank );
      });

      return _tanks;
    }

    preBuySlot() {

      alertBox.loading.show();

      balance.check(this.price.slot, (res) => {

          alertBox.loading.hide();

          if (res) {

              alertBox.show({
                  title: 'Подтверждение покупки',
                  html: 'Вы действительно желаете купить дополнительный слот в Ангаре?',
                  buttons: [
                      {
                          title: 'Отменить',
                          classed: 'default',
                          on: alertBox.hide
                      },
                      {
                          title: 'Купить',
                          classed: 'action',
                          on: () => this.buySlot(req)
                      }
                  ],
                  props: {
                      width: 400
                  }
              });
          } else {

              alertBox.show({
                  title: 'Ошибка',
                  html: 'Недостаточно серебра для покупки дополнительного слота в Ангаре.'
              });
          }
      });
    }
    buySlot(req) {

      alertBox.hide();
      alertBox.loading.show();

      req.get(this.http, {
          url: urls__config.hostLocal + urls__config.hangar.buySlot,
          err__cb: (err) => {

              alertBox.show({ title: 'Ошибка', html: err.error });
          },
          success__cb: (res) => {

              this.game.getData();

              this.getTanksList();
          }
      });
    }

    selTank(tank) {

        alertBox.loading.show();

        this.selectedTank = tank;

        this.tankImprovements = Object.keys(tank.research);

        this.researchedTank = this.calcTimeResearchTank(tank);

        if (!this.researchedTank) {

            if (this.updateResearchTime) {

                clearInterval(this.updateResearchTime);
            }

            this.updateResearchTime = setInterval(() => this.calcTimeResearchTank(tank), 1000);

            alertBox.loading.hide();
        } else {

            req.post(this.http, {
                url: urls__config.hostLocal + urls__config.hangar.getOutGold,
                body: {
                    tankID: tank.key
                },
                err__cb: (err) => {

                    alertBox.show({ title: 'Ошибка', html: err.error });
                },
                success__cb: (res) => {

                    alertBox.loading.hide();

                    this.selectedTank.outGold = (res.outGold.toFixed(2));
                }
            });
        }
    }

    preSellTank(tank) {

        alertBox.show({
            title: 'Подтверждение продажи',
            html: `Продать собранные ${tank.displayName} за ` +
            `<span class="ico goldColor">` +
            `${this.normalPrice(tank.outGold)} <span class="ico gold"></span></span>` +
            `и <span class="ico silverColor">` +
            `${this.normalPrice((tank.outGold) * 100)} <span class="ico whiteStar"></span>?`,
            buttons: [
                {
                    title: 'Отменить',
                    classed: 'default',
                    on: alertBox.hide
                },
                {
                    title: 'Продать',
                    classed: 'action',
                    on: () => this.sellTank(req, tank)
                }
            ],
            props: {
                width: 400
            }
        });
    }

    sellTank(req, tank) {

        alertBox.hide();
        alertBox.loading.show();

        req.post(this.http, {
            url: urls__config.hostLocal + urls__config.hangar.outGold,
            body: {
                tankID: tank.key
            },
            err__cb: (err) => {

                alertBox.show({ title: 'Ошибка', html: err.error });
            },
            success__cb: (res) => {

                this.game.getData();

                this.getTanksList();
            }
        });
    }

    calcTimeResearchTank(tank) {

        const time = new Date();
        time.setTime(tank.researchedDate);

        const endTime = new Date();
        endTime.setTime(Date.now());

        const researchTime = new Date();
        researchTime.setDate( time.getDate() - endTime.getDate() );
        researchTime.setHours( time.getHours() - endTime.getHours() );
        researchTime.setMinutes( time.getMinutes() - endTime.getMinutes() );
        researchTime.setSeconds( time.getSeconds() - endTime.getSeconds() );

        this.researchTime = researchTime.toTimeString().split(' ')[0];

        return endTime.getTime() > time.getTime();
    }

    normalPrice(price) {

        return price.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
    }
}
