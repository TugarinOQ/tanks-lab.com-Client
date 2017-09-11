import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';
import { urls__config } from '../../configs/urls.config';
import { AppComponent } from './app.component';

import * as d3 from 'd3';
import { alertBox } from '../../modules/alert.module';

@Component({
  selector: 'auth__pane',
  templateUrl: '../../views/pages/auth.view.html',
  styleUrls: [ '../../styles/pages/auth.style.scss' ]
})

export class authComponent {
  @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

  propsAuth = {};
  enabledButton = false;

  constructor(private http: Http, private router: Router, private app: AppComponent, private titleService: Title) {

      if (localStorage.getItem('token')) {

          this.router.navigateByUrl('/game/hangar');
      }

      this.titleService.setTitle( 'Авторизация' + config.genTitle() );
  }

  agreeEvent(event) {

    this.enabledButton = event;

    (event) ? d3.select('.big-button_red').classed('disabled', false) : d3.select('.big-button_red').classed('disabled', true);
  }

  preauth(email, password) {

    if (!this.enabledButton) {
      return;
    }

    alertBox.loading.show();

    this.propsAuth = { email: email.value, password: password.value };

    this.captcha.execute();
  }

  auth(captchaResponse: string) {

    const body = Object.assign({captcha: captchaResponse}, this.propsAuth);

    this.http.post(urls__config.hostLocal + urls__config.users.auth, body)
        .map((res: Response) => res.json())
        .subscribe((res) => {

          alertBox.loading.hide();

          if (res.error) {

            alertBox.show({ title: 'Ошибка', html: res.error });

            this.captcha.reset();

            return;
          }

          localStorage.setItem('token', res.token);

          this.app.isLogged = true;

          this.router.navigateByUrl('/game/hangar');
        });
  }
}
