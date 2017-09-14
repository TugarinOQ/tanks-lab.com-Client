import { Component } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { urls__config } from '../../configs/urls.config';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';
import { req } from '../../modules/request.module';
import { base } from  '../../modules/base.module';

import * as d3 from 'd3';
import { alertBox } from '../../modules/alert.module';
import {exit} from "shelljs";

@Component({
    selector: 'game',
    templateUrl: '../../views/pages/game.view.html',
    styleUrls: [ '../../styles/pages/game.style.scss', '../../styles/btns.style.scss' ]
})

export class gameComponent {

  section = '';
  time = this.getTime();
  user = {
      username: undefined,
      email: undefined,
      bons: undefined,
      gold: undefined,
      silver: undefined,
      practice: undefined,
      referral: undefined
  };
  pay = {
      course: 100,
      methods: [
          { name: 'VISA / MasterCard', code: 8 },
          { name: 'Yandex.Money', code: 1 },
          { name: 'PerfectMoney', code: 1 },
          { name: 'Payeer', code: 1 },
          { name: 'Альфа-Клик', code: 1 },
          { name: 'Промсвязьбанк', code: 1 },
          { name: 'Банковский перевод', code: 1 },
          { name: 'Платежные терминалы России', code: 1 },
          { name: 'М.видео', code: 1 },
          { name: 'Элекснет', code: 1 },
          { name: 'Лидер', code: 1 },
          { name: 'МосОблБанк', code: 1 },
          { name: 'Евросеть', code: 1 },
          { name: 'Связной', code: 1 },
          { name: 'Билайн', code: 1 },
          { name: 'Tele2', code: 1 }
      ],
      withdraw: [
          { name: 'VISA / MasterCard', code: 73 },
          { name: 'Yandex.Money', code: 71 },
          { name: 'QIWI Wallet', code: 74 }
      ]
  };

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private http: Http,
      private titleService: Title
  ) {

    this.titleService.setTitle( config.genTitle() );

    this.route.url.subscribe(url => {

      (url.length === 1) ? this.router.navigateByUrl('/#/game/hangar') : this.section = url[1].path;

    });

    setTimeout(() => this.getLocalData(), 0);

    this.getData();

    setInterval(() => {

        this.time = this.getTime();

        d3
            .select('.info .time span')
            .text(this.time);

    }, 1000);
  }

  getLocalData() {
      if (base.storage.get('user') !== null) {

          this.user = base.storage.get('user', true);

          this.updateBalance();
      }
  }

  getData() {

      req.get(this.http, {
          url: urls__config.hostLocal + urls__config.token.valid,
          err__cb: () => {

              localStorage.removeItem('token');
              location.href = '/#/auth';
          },
          success__cb: (res) => {

              this.user = res.user;

              base.storage.set('user', this.user, true);
              base.storage.set('price', res.price, true);

              this.updateBalance();
          }
      });
  }

  updateBalance() {

      d3
          .select('.topBtn.user .name')
          .text(this.user.username || 'UserName');

      d3
          .select('.topBtn.bons .count')
          .text(this.normalPrice(this.user.bons || 0));

      d3
          .select('.topBtn.gold .count')
          .text(this.normalPrice(this.user.gold.toFixed(2) || 0));

      d3
          .select('.topBtn.silver .count')
          .text(this.normalPrice(this.user.silver.toFixed(0) || 0));

      d3
          .select('.topBtn.practice .count')
          .text(this.normalPrice(this.user.practice || 0));
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

  getTime() {

    const date = new Date();

    return `${this.checkTime(date.getHours())}:${this.checkTime(date.getMinutes())}`;
  }

  checkTime(i) {

    return (i < 10) ? '0' + i : i;
  }

  upBalance() {

      alertBox.show({
          title: 'Пополнение баланса',
          html: ``,
          props: {
              width: 400
          },
          buttons: [
              {
                  title: 'Отменить',
                  classed: 'default',
                  on: () => alertBox.hide()
              },
              {
                  title: 'Пополнить',
                  classed: 'action',
                  on: () => this.preUpBalance()
              }
          ],
          cb: () => {

              const viewHtml = d3.select('#alert .box').select('.html');

              const __this = this;

              viewHtml
                  .append('div')
                  .classed('course', true)
                  .html(`<span class="textCourse">Курс обмена:&nbsp;</span>` +
                        `<span class="ico silverColor">1&nbsp;₽</span>` +
                        `&nbsp;=&nbsp;` +
                        `<span class="ico silverColor">100&nbsp;<span class="ico silver"></span>`);

              viewHtml
                  .append('div')
                  .classed('separator', true);

              const methodPay = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              methodPay
                  .append('div')
                  .classed('nameInput', true)
                  .text('Способ оплаты:');

              const selectMethod = methodPay
                  .append('div')
                  .classed('input', true)
                  .append('select')
                  .classed('select', true)
                  .selectAll('option')
                  .data(this.pay.methods);

              selectMethod
                  .enter()
                  .append('option')
                  .attr('value', (data) => data.code)
                  .text((data) => data.name);

              const rubleInput = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              rubleInput
                  .append('div')
                  .classed('nameInput', true)
                  .text('Сумма в рублях:');

              rubleInput
                  .append('div')
                  .classed('input', true)
                  .append('input')
                  .attr('type', 'number')
                  .attr('id', 'rubleInput')
                  .attr('name', 'rubleInput')
                  .attr('placeholder', '0')
                  .on('keyup', function() {

                      __this.upBalanceChangeValue({ money: this.value });
                  })
                  .on('change', function() {

                      __this.upBalanceChangeValue({ money: this.value });
                  });

              const silverInput = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              silverInput
                  .append('div')
                  .classed('nameInput', true)
                  .text('Кол-во серебра:');

              silverInput
                  .append('div')
                  .classed('input', true)
                  .append('input')
                  .attr('type', 'number')
                  .attr('id', 'silverInput')
                  .attr('name', 'silverInput')
                  .attr('placeholder', '0')
                  .on('keyup', function() {

                      __this.upBalanceChangeValue({ silver: this.value });
                  })
                  .on('change', function() {

                      __this.upBalanceChangeValue({ silver: this.value });
                  });

              viewHtml
                  .append('div')
                  .classed('separator', true);
          }
      });
  }

  outBalance() {

      alertBox.show({
          title: 'Вывод средств',
          html: ``,
          props: {
              width: 400
          },
          buttons: [
              {
                  title: 'Отменить',
                  classed: 'default',
                  on: () => alertBox.hide()
              },
              {
                  title: 'Вывести',
                  classed: 'action',
                  on: () => this.preOutBalance()
              }
          ],
          cb: () => {

              const viewHtml = d3.select('#alert .box').select('.html');

              const __this = this;

              viewHtml
                  .append('div')
                  .classed('course', true)
                  .html(`<span class="textCourse">Курс обмена:&nbsp;</span>` +
                      `<span class="ico silverColor">1&nbsp;<span class="ico gold"></span>` +
                      `&nbsp;=&nbsp;` +
                      `<span class="ico silverColor">1&nbsp;₽</span>`);

              viewHtml
                  .append('div')
                  .classed('separator', true);

              const methodPay = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              methodPay
                  .append('div')
                  .classed('nameInput', true)
                  .text('Платежная система:');

              const selectMethod = methodPay
                  .append('div')
                  .classed('input', true)
                  .append('select')
                  .classed('select', true)
                  .selectAll('option')
                  .data(this.pay.withdraw);

              selectMethod
                  .enter()
                  .append('option')
                  .attr('value', (data) => data.code)
                  .text((data) => data.name);

              const walletInput = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              walletInput
                  .append('div')
                  .classed('nameInput', true)
                  .text('Кошелек:');

              walletInput
                  .append('div')
                  .classed('input', true)
                  .append('input')
                  .attr('type', 'text')
                  .attr('id', 'walletInput')
                  .attr('name', 'walletInput')
                  .attr('placeholder', '000-000000');

              const goldInput = viewHtml
                  .append('div')
                  .classed('groupInput', true);

              goldInput
                  .append('div')
                  .classed('nameInput', true)
                  .text('Сумма в золоте:');

              goldInput
                  .append('div')
                  .classed('input', true)
                  .append('input')
                  .attr('type', 'number')
                  .attr('id', 'goldInput')
                  .attr('name', 'goldInput')
                  .attr('placeholder', '0')
                  .on('keyup', function() {

                      const money = (d3.select(this).node().value);

                      d3
                          .select('#alert')
                          .select('.group.totalPrice')
                          .select('.totalPrice')
                          .select('span')
                          .text( __this.normalPrice(money - ( money * 0.05 )) );
                  })
                  .on('change', function() {

                      const money = (d3.select(this).node().value);

                      d3
                          .select('#alert')
                          .select('.group.totalPrice')
                          .select('.totalPrice')
                          .select('span')
                          .text( __this.normalPrice(money - ( money * 0.05 )) );
                  });

              viewHtml
                  .append('div')
                  .classed('separator', true);

              const totalCommission = viewHtml
                  .append('div')
                  .classed('group', true);

              totalCommission
                  .append('div')
                  .classed('name title small', true)
                  .text('Комиссия');

              totalCommission
                  .append('span')
                  .classed('outgrowth', true);

              totalCommission
                  .append('div')
                  .classed('totalPrice', true)
                  .append('span')
                  .text('5%');

              const totalPrice = viewHtml
                  .append('div')
                  .classed('group totalPrice', true);

              totalPrice
                  .append('div')
                  .classed('name title', true)
                  .text('Итого');

              totalPrice
                  .append('span')
                  .classed('outgrowth', true);

              const totalPriceView = totalPrice
                  .append('div')
                  .classed('totalPrice', true);

              totalPriceView
                  .append('span')
                  .text('0');

              totalPriceView
                  .append('span')
                  .html('&nbsp;₽');
          }
      });
  }

  upBalanceChangeValue({ money = null, silver = null }) {

      const html = d3
          .select('#alert')
          .select('.html');

      const rubleHtml = html
          .select('#rubleInput');

      const silverHtml = html
          .select('#silverInput');

      let _moneyCourse = money;
      let _silverCourse = silver;

      (money !== null && silver === null) ?
          _silverCourse = money * this.pay.course
          :
          _moneyCourse = silver / this.pay.course;

      rubleHtml
          .node()
          .value = _moneyCourse;

      silverHtml
          .node()
          .value = _silverCourse;
  }

  preUpBalance() {

      const method = d3.select('#alert').select('.html').select('select.select').node().value;
      const rubles = d3.select('#alert').select('.html').select('input#rubleInput').node().value;
      const silvers = d3.select('#alert').select('.html').select('input#silverInput').node().value;

      alertBox.hide(() => {

          alertBox.loading.show();
      });

      req.post(this.http, {
          url: urls__config.hostLocal + urls__config.payments.genURL,
          body: {
              method: method,
              ruble: rubles,
              silver: silvers
          },
          err__cb: (err) => {

              return alertBox.show({ title: 'Ошибка', html: err.error });
          },
          success__cb: (res) => {

              window.location.href = res.url;
          }
      });
  }

  preOutBalance() {

      const method = d3.select('#alert').select('.html').select('select.select').node().value;
      const wallet = d3.select('#alert').select('.html').select('input#walletInput').node().value;
      const gold = d3.select('#alert').select('.html').select('input#goldInput').node().value;

      alertBox.hide(() => {

          alertBox.loading.show();
      });

      req.post(this.http, {
          url: urls__config.hostLocal + urls__config.payments.withdrawCreate,
          body: {
              method: method,
              wallet: wallet,
              gold: gold
          },
          err__cb: (err) => {

              if (err.error === 'manual') {

                  this.getData();

                  return alertBox.show({
                      title: 'Вывод средств',
                      html: `Вывод средств будет выполнен в ручном режиме, после проверки Администрацией проекта.`
                  });
              }

              return alertBox.show({title: 'Ошибка', html: err.error});
          },
          success__cb: (res) => {

              alertBox.loading.hide();

              this.getData();

              alertBox.show({
                  title: 'Вывод средств',
                  html: 'Деньги успешно выведенны. В течении 5 минут они поступят на ваш кошелек!'
              });
          }
      });
  }

    funcIsNotAvailable() {

        alertBox.show({
            title: 'Функционал недоступен',
            html: 'Данный функционал недоступен в АЛЬФА-ТЕСТЕ'
        });
    }

    openSettings() {

        alertBox.popupNoCloseButton.show({

            title: 'Меню',
            html: `
            <div class="menu">
                <div class="alfatest red">АЛЬФА-ТЕСТ</div>
                
                <div class="buttons">
                    
                    <div class="menuButton settings"><span class="text">Изменить пароль</span></div>
                    <div class="menuButton logout"><span class="text">Выйти из учетной записи</span></div>
                    <div class="menuButton exitInHangar"><span class="text">Вернуться в ангар</span></div>
                    
                </div>
                
                <div class="infoList">
                    
                    <div class="versionInfo">0.0.1.1 ~ alpha</div>
                    
                    <div (click)="openInfoList()" class="small-btn default">
                        <span class="text">
                            ChangeLog
                        </span>
                    </div>
                    
                </div>
            </div>
            `,
            buttons: [],
            props: {
                width: 295
            },
            cb: () => {

                const self = this;

                function exitInHangar() {

                    d3.select('#alert .menuButton.exitInHangar').on('click', () => alertBox.popupNoCloseButton.hide());
                }

                function logout() {

                    d3.select('#alert .menuButton.logout').on('click', () => {

                        alertBox.popupNoCloseButton.hide();

                        localStorage.removeItem('token');

                        window.location.href = '/#/';
                    });
                }

                function settings() {

                    d3.select('#alert .menuButton.settings').on('click', () => {

                        alertBox.popupNoCloseButton.hide();

                        self.openBoxSettings();
                    });
                }

                settings();
                logout();
                exitInHangar();
            }
        });
    }

    openBoxSettings() {
        alertBox.show({
            title: 'Изменение пароля',
            html: '<div class="settings">' +
            '<br>' +
            '<div class="groupClass">' +
            '<label for="old">Старый пароль:</label>' +
            '<div class="input"><input id="old" type="password"></div>' +
            '</div>' +
            '<div class="groupClass">' +
            '<label for="new">Новый пароль:</label>' +
            '<div class="input"><input id="new" type="password"></div>' +
            '</div>' +
            '<div class="groupClass">' +
            '<label for="confirm">Подтверждение:</label>' +
            '<div class="input"><input id="confirm" type="password"></div>' +
            '</div>' +
            '</div>',
            buttons: [
                {
                    title: 'Отменить',
                    classed: 'default',
                    on: () => alertBox.hide()
                },
                {
                    title: 'Изменить',
                    classed: 'action',
                    on: () => this.changePassword()
                }
            ],
            props: {
                width: 360
            }
        });
    }

    changePassword() {

      const oldPass = d3.select('#alert #old').node().value;
      const newPass = d3.select('#alert #new').node().value;
      const confirmPass = d3.select('#alert #confirm').node().value;

      if (oldPass === '' || newPass === '' || confirmPass === '') {

          return;
      }

      alertBox.popupNoCloseButton.hide();
      alertBox.loading.show();

      req.post(this.http, {
          url: urls__config.hostLocal + urls__config.users.changePassword,
          body: {
              oldPass: oldPass,
              newPass: newPass,
              confirmPass: confirmPass
          },
          err__cb: (err) => {

              alertBox.loading.hide();

              return alertBox.show({title: 'Ошибка', html: err.error});
          },
          success__cb: (res) => {

              alertBox.loading.hide();

              return alertBox.show({title: 'Успех', html: 'Пароль изменен.'});
          }
      });
    }

    openProfile() {

        alertBox.show({
            title: `${this.user.username} - Профиль конструктора (Альфа версия)`,
            html: `
            <div class="info">
                <div class="group">
                    <div class="name">Ник:</div>
                    <div class="value">${this.user.username}</div>
                </div>
                <div class="group">
                    <div class="name">E-Mail:</div>
                    <div class="value">${this.user.email}</div>
                </div>
                <br>
                <div class="groupClass">
                    <div class="name">Реферальная ссылка (5% от каждого реферала):</div>
                    <a class="value"><a href="${this.user.referral}">${this.user.referral}</a></div>
                </div>
            </div>
            `,
            buttons: [
                {
                    title: 'Закрыть',
                    classed: 'default',
                    on: () => alertBox.hide()
                }
            ],
            props: {
                width: 400
            }
        });

    }
}
