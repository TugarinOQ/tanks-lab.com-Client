import {Component} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Title} from '@angular/platform-browser';

import {gameComponent} from './game.component';
import {urls__config} from '../../configs/urls.config';
import {config} from '../../configs/base.config';

import {balance} from '../../modules/balance.module';
import {req} from '../../modules/request.module';
import {alertBox} from '../../modules/alert.module';
import {base} from '../../modules/base.module';
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
    intervalUpdateBalanceTank;

    constructor(private http: Http, private game: gameComponent, private titleService: Title) {

        this.titleService.setTitle('Ангар' + config.genTitle());
        balance.http = this.http;
        this.price = base.storage.get('price', true);

        this.getTanksList();
    }

    getTanksList(selTank = undefined) {

        this.countScreenSeats = new Array(parseInt((window.screen.width / 165).toString()));

        alertBox.loading.show();

        req.get(this.http,
            {
                url: urls__config.hostLocal + urls__config.hangar.getList,
                err__cb: (res) => {

                    alertBox.show({title: 'Ошибка', html: res.error});
                },
                success__cb: (res) => {

                    alertBox.loading.hide();

                    this.tanks = this.getTank(res.tanks);

                    const countTanks = Object.keys(res.tanks).length;
                    const countSeats = parseInt((window.screen.width / 165).toString()) - countTanks - 2;

                    this.countScreenSeats = new Array((countSeats < 0) ? 0 : countSeats);

                    let widthCarousel = 0;

                    const __this = this;

                    if ((this.countScreenSeats.length) > 0) {

                        widthCarousel = (176 + 20) * (this.countScreenSeats.length + countTanks + 2);

                        d3
                            .select('.carousel')
                            .selectAll('.control')
                            .classed('active', false)
                            .on('click', () => { });
                    } else {

                        widthCarousel = (176 + 20) * (countTanks + 2);

                        d3
                            .select('.carousel')
                            .selectAll('.control')
                            .classed('active', true)
                            .on('click', function () { __this.controlCarousel(this, countTanks); });
                    }

                    this.freeSeats = res.countSeats - countTanks;
                    this.countSeats = res.countSeats;

                    d3
                        .select('.carousel')
                        .select('ul')
                        .attr('style', `width: ${ widthCarousel }px`);

                    this.selTank((selTank) ? res.tanks[selTank] : res.tanks[Object.keys(res.tanks)[0]]);

                    this.showTank = true;
                }
            });
    }

    controlCarousel(ev, countTanks) {

        const control = d3.select(ev).attr('class').split(' ')[1];

        const leftFirstItem = parseInt(d3
            .select('.carousel')
            .select('ul')
            .select('li')
            .style('margin-left').split('px')[0]) || 0;

        function leftClick() {

            if (leftFirstItem === 5) return;

            d3
                .select('.carousel')
                .select('ul')
                .select('li')
                .style('margin-left', `${ leftFirstItem + 174 }px`);
        }

        function rightClick() {

            const invisibleItem = Math.abs(parseInt(((window.screen.width - 110) / 165).toString()) - countTanks - 2);

            if ((invisibleItem * 174 - 5) === Math.abs(leftFirstItem)) return;

            const offset = (window.screen.width);

            d3
                .select('.carousel')
                .select('ul')
                .select('li')
                .style('margin-left', `${ leftFirstItem - (174 || offset) }px`);

        }

        (control === 'left') ? leftClick() : rightClick();
    }

    getTank(tanks) {

        const _tanks = [];

        Object.keys(tanks).map((idxTank) => {

            const tmpTank = tanks[idxTank];
            tmpTank.key = idxTank;
            tmpTank.outGold = 0.00;

            _tanks.push(tmpTank);
        });

        return _tanks;
    }

    preBuySlot() {

        alertBox.loading.show();

        balance.check(this.price.slot || 30000, (res) => {

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

                alertBox.show({title: 'Ошибка', html: err.error});
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

                    alertBox.show({title: 'Ошибка', html: err.error});
                },
                success__cb: (res) => {

                    alertBox.loading.hide();

                    this.selectedTank.outGold = (res.outGold.toFixed(8));
                    this.selectedTank.practice = (res.practice);

                    this.updateBalanceTank({ calcTank: res });
                }
            });
        }
    }

    updateBalanceTank({ calcTank }) {

        clearInterval(this.intervalUpdateBalanceTank);

        const self = this;

        d3
            .select('.tank__view')
            .select('.status')
            .select('.ico.goldColor')
            .html(`${this.normalPrice((calcTank.outGold).toFixed(8))} <span class="ico gold"></span>`);

        d3
            .select('.tank__view')
            .select('.status')
            .select('.ico.silverColor')
            .html(`${this.normalPrice((calcTank.practice))} <span class="ico whiteStar"></span>`);

        // this.intervalUpdateBalanceTank = setInterval(() => {
        //
        //     d3
        //         .select('.tank__view')
        //         .select('.status')
        //         .select('.ico.goldColor')
        //         .html(function() {
        //
        //             return `${self.normalPrice((parseFloat(d3.select(this).text()) + calcTank.inSecond).toFixed(8))} <span class="ico gold"></span>`;
        //         });
        //
        //     d3
        //         .select('.tank__view')
        //         .select('.status')
        //         .select('.ico.silverColor')
        //         .html(function() {
        //
        //             const value = parseFloat((parseFloat(d3.select('.tank__view .status .ico.goldColor').text()) + calcTank.inSecond).toFixed(8));
        //
        //             return `${self.normalPrice((value * 200).toFixed(0))} <span class="ico whiteStar"></span>`;
        //         });
        //
        // }, 1000);
    }

    preSellTank(tank) {

        alertBox.show({
            title: 'Подтверждение продажи',
            html: `Продать собранные ${tank.displayName} за ` +
            `<span class="ico goldColor">` +
            `${this.normalPrice(tank.outGold)} <span class="ico gold"></span></span>` +
            `и <span class="ico silverColor">` +
            `${this.normalPrice(((tank.outGold) * 200).toFixed(0))} <span class="ico whiteStar"></span>?`,
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

                alertBox.show({title: 'Ошибка', html: err.error});
            },
            success__cb: (res) => {

                this.game.getData();

                this.getTanksList(tank.key);
            }
        });
    }

    calcTimeResearchTank(tank) {

        const time = new Date();
        time.setTime(tank.researchedDate);

        const endTime = new Date();
        endTime.setTime(Date.now());

        const researchTime = new Date();
        researchTime.setDate(time.getDate() - endTime.getDate());
        researchTime.setHours(time.getHours() - endTime.getHours());
        researchTime.setMinutes(time.getMinutes() - endTime.getMinutes());
        researchTime.setSeconds(time.getSeconds() - endTime.getSeconds());

        this.researchTime = researchTime.toTimeString().split(' ')[0];

        return endTime.getTime() > time.getTime();
    }

    normalPrice(str) {

        let parts = (str + '').split('.'),
            main = parts[0],
            len = main.length,
            output = '',
            i = len - 1;

        while (i >= 0) {
            output = main.charAt(i) + output;
            if ((len - i) % 3 === 0 && i > 0) {
                output = ',' + output;
            }
            --i;
        }

        if (parts.length > 1) {
            output += '.' + parts[1];
        }
        return output;
    }

    funcIsNotAvailable() {

        alertBox.show({
            title: 'Функционал недоступен',
            html: 'Данный функционал недоступен в АЛЬФА-ТЕСТЕ'
        });
    }
}
