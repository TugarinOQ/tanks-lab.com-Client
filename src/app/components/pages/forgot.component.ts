import { Component, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReCaptchaComponent } from 'angular2-recaptcha';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';
import { urls__config } from '../../configs/urls.config';
import { req } from '../../modules/request.module';

import * as d3 from 'd3';
import { alertBox } from '../../modules/alert.module';

@Component({
    selector: 'forgot__pane',
    templateUrl: '../../views/pages/forgot.view.html',
    styleUrls: [ '../../styles/pages/forgot.style.scss' ]
})

export class forgotComponent {
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

    propsForgot = {};
    enabledButton = false;

    constructor(private http: Http, private router: Router, private titleService: Title) {

        if (localStorage.getItem('token')) {

            this.router.navigateByUrl('/game/hangar');
        }

        this.titleService.setTitle( 'Восстановление доступа' + config.genTitle() );
    }

    agreeEvent(event) {

        this.enabledButton = event;

        (event) ?
            d3.select('.big-button_red').classed('disabled', false)
            :
            d3.select('.big-button_red').classed('disabled', true);
    }

    preforgot(email, login) {

        if (!this.enabledButton) {
            return;
        }

        alertBox.loading.show();

        this.propsForgot = { email: email.value, login: login.value };

        this.captcha.execute();
    }

    forgot(captchaResponse: string) {

        const body = Object.assign({captcha: captchaResponse}, this.propsForgot);

        req.post(this.http, {
            url: urls__config.hostLocal + urls__config.users.forgot,
            body: body,
            err__cb: (err) => {

                alertBox.show({ title: 'Ошибка', html: err.error });

                this.captcha.reset();

                return;
            },
            success__cb: (res) => {

                alertBox.loading.hide();

                this.router.navigateByUrl('/auth');
            }
        });
    }
}
