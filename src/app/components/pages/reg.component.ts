import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import { AppComponent } from './app.component';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';
import { urls__config } from '../../configs/urls.config';
import * as d3 from 'd3';
import { alertBox } from '../../modules/alert.module';

@Component({
  selector: 'reg__pane',
  templateUrl: '../../views/pages/reg.view.html',
  styleUrls: [ '../../styles/pages/reg.style.scss' ]
})

export class regComponent {
  propsReg = {};
  enabledButton = false;

  @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

  constructor(private http: Http, private router: Router, private app: AppComponent, private titleService: Title) {

      if (localStorage.getItem('token')) {

          location.href = '/game/hangar';
      }

      this.titleService.setTitle( 'Регистрация' + config.genTitle() );
  }

  agreeEvent(event) {

    this.enabledButton = event;

    (event) ? d3.select('.big-button_red').classed('disabled', false) : d3.select('.big-button_red').classed('disabled', true);
  }

  prereg(login, email, password, confirm) {

    if (!this.enabledButton) {
      return;
    }

    alertBox.loading.show();

    this.propsReg = { username: login.value, email: email.value, password: password.value, confirm: confirm.value };

    this.captcha.execute();
  }

  reg(captchaResponse: string) {

    const body = Object.assign({captcha: captchaResponse}, this.propsReg);

    this.http.post(urls__config.hostLocal + urls__config.users.reg, body, [  ])
      .map((res: Response) => res.json())
      .subscribe((res) => {

        alertBox.loading.hide();

        if (res.error) {

          alertBox.show({ title: 'Ошибка', html: res.error });

          this.captcha.reset();

          return;
        }

        this.router.navigateByUrl('/auth');
      });
  }
}
