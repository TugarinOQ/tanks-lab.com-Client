import { Component } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { gameComponent } from './game.component';
import { urls__config } from '../../configs/urls.config';
import { config } from '../../configs/base.config';

import { req } from '../../modules/request.module';
import { alertBox } from '../../modules/alert.module';
import { base } from  '../../modules/base.module';

import * as d3 from 'd3';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
    selector: 'shop',
    templateUrl: '../../views/pages/shop.view.html',
    styleUrls: [
        '../../styles/pages/shop.style.scss',
        '../../styles/vehicles_ussr.scss',
        '../../styles/levels.style.scss',
        '../../styles/types.style.scss'
    ]
})

export class shopComponent {

    types = ['type lt', 'type mt', 'type ht', 'type at-spg', 'type spg'];
    levels = ['level I', 'level II', 'level III', 'level IV', 'level V', 'level VI', 'level VII', 'level VIII', 'level IX', 'level X'];

    selTypes = [];
    selLevels = [];

    tanks = [];

    filters = {
        types: [],
        levels: []
    };

    buyTankBox = {
        buyAvailable: true,
        additionSlot: false,
        lastPrice: 0
    };

    price = {
        slot: 0
    };

    constructor(private router: Router, private titleService: Title, private http: Http, private game: gameComponent) {

        this.titleService.setTitle( 'Магазин' + config.genTitle() );

        this.getList();

        this.price = base.storage.get('price', true);
    }

    fullnameOfTypeTank(type) {

        switch (type) {
            case 'lt':
                return 'Легкий танк';

            case 'mt':
                return 'Средний танк';

            case 'ht':
                return 'Тяжелый танк';

            case 'at-spg':
                return 'ПТ-САУ';

            case 'spg':
                return 'САУ';
        }
    }

    normalPrice(price) {

        return price.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
    }

    getList() {

        alertBox.loading.show();

        req.post(this.http, {
            url: urls__config.hostLocal + urls__config.shop.getList, body: {filters: this.filters}, err__cb: (res) => {

                alertBox.show({title: 'Ошибка', html: res.error});
            }, success__cb: (tanks) => {

                alertBox.loading.hide();

                this.tanks = [];

                this.tanks = tanks;
            }
        });
    }

    checkedType(id, $ev) {

        const type = id.split('type ')[1];

        this.filters.types = [];

        $ev === true ? this.selTypes.push(type) : this.selTypes.splice(this.selTypes.indexOf(type), 1);

        this.selTypes.map(type => {

            this.filters.types.push(type);
        });

        this.getList();
    }

    checkedLevel(id, $ev) {

        const level = id.split('level ')[1];

        this.filters.levels = [];

        $ev === true ? this.selLevels.push(level) : this.selLevels.splice(this.selLevels.indexOf(level), 1);

        this.selLevels.map(level => {

            this.filters.levels.push(level);
        });

        this.getList();
    }

    preBuyTank(idTank, available) {

        if (available) {
            return;
        }

        alertBox.loading.show();

        req.post(this.http, {
            url: urls__config.hostLocal + urls__config.hangar.getInfoTank, body: {tankID: idTank}, err__cb: (res) => {

                alertBox.show({title: 'Ошибка', html: res.error});
            }, success__cb: (tank) => {

                this.buyTankBox = {
                    buyAvailable: true,
                    additionSlot: false,
                    lastPrice: 0
                };

                const htmlBuyTankBox = d3
                    .select('#buyTankBox');

                const tmpBox = d3
                    .select('#buyTankBox').html();

                htmlBuyTankBox
                    .select('.nation')
                    .attr('class', `nation ${tank.nation}`);

                htmlBuyTankBox
                    .select('.type')
                    .attr('class', `type ${tank.type}`);

                htmlBuyTankBox
                    .select('.level')
                    .attr('class', `level ${tank.level}`);

                htmlBuyTankBox
                    .select('.tankImage')
                    .attr('class', `tankImage ${tank.name}_resized`);

                htmlBuyTankBox
                    .select('.tankInfo .name')
                    .text(tank.displayName);

                htmlBuyTankBox
                    .select('.tankInfo .type_info')
                    .text(this.fullnameOfTypeTank(tank.type));

                htmlBuyTankBox
                    .select('.tankInfo .level_info')
                    .html(`<span>${tank.level}</span> Уровень`);

                htmlBuyTankBox
                    .select('.education')
                    .select('.count span')
                    .text(Object.keys(tank.crew).length);

                htmlBuyTankBox
                    .select('.tankBuyName')
                    .select('.name')
                    .text(`Стоимость ${tank.displayName}:`);

                const price = htmlBuyTankBox
                    .select('.tankBuyName')
                    .select('.price');

                price
                    .html(`${this.normalPrice(tank.price)} ${price.html()}`);

                htmlBuyTankBox
                    .selectAll('.checkbtn.academy .checked .academy')
                    .classed(tank.nation, true);

                alertBox.show({
                    _this: this,
                    title: 'Покупка ' + tank.displayName,
                    html: htmlBuyTankBox.html(),
                    buttons: [
                        {
                            title: 'Отменить',
                            classed: 'default',
                            on: () => alertBox.hide(() => {

                                htmlBuyTankBox.html( tmpBox );
                            })
                        },
                        {
                            title: 'Купить',
                            classed: 'action',
                            on: () => this.buyTank({ tank: tank })
                        }
                    ],
                    props: {
                        width: 440
                    },
                    cb: (__this) => {

                        htmlBuyTankBox
                            .select('.tankBuyBlock')
                            .remove();

                        d3
                            .select('.tankBuyBlock')
                            .select('input#additionSlot')
                            .on('change', function() {
                                __this.eventAdditionSlot(this.checked, __this)
                            });

                        __this.updateTotalPrice(tank.price);
                    }
                });
            }
        });
    }

    buyTank({ tank }) {

        if (this.buyTankBox.buyAvailable === false) {
            return;
        }

        alertBox.hide( alertBox.loading.show );

        const data = {
            tankID: tank._id,
            slot: this.buyTankBox.additionSlot
        };

        req.post(this.http, {
            url: urls__config.hostLocal + urls__config.shop.buyTank,
            body: data,
            err__cb: (res) => {

                alertBox.show({title: 'Ошибка', html: res.error});
            }, success__cb: (tanks) => {

                alertBox.loading.hide();

                this.game.getData();

                this.router.navigateByUrl('/game/hangar');
            }
        })
    }

    eventAdditionSlot(ev, _this) {

        this.buyTankBox.additionSlot = ev;

        _this.updateTotalPrice( (ev) ? (_this.price.slot) : (-(_this.price.slot)) );
    }

    updateTotalPrice(price) {

        const totalPrice = this.checkPrice(price);

        d3
            .select('.tankBuyBlock')
            .select('.totalPrice span')
            .text(this.normalPrice(totalPrice.lastPrice));

        d3
            .select('.tankBuyBlock')
            .select('.totalPrice span')
            .classed('red', !totalPrice.buyAvailable);

        d3
            .select('#alert')
            .select('._btns .action')
            .classed('disabled', !totalPrice.buyAvailable);

        this.buyTankBox.buyAvailable = totalPrice.buyAvailable;
    }

    checkPrice(price = 0) {

        const silverBalance = base.storage.get('user', true).silver;

        this.buyTankBox.lastPrice += price;

        return {
            lastPrice: this.buyTankBox.lastPrice,
            buyAvailable: this.buyTankBox.lastPrice <= silverBalance
        }
    }
}
