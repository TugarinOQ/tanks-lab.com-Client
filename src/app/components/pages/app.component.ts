import { Component, ViewEncapsulation } from '@angular/core';
import { Http } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { isNullOrUndefined } from 'util';

import * as d3 from 'd3';
import { config } from '../../configs/base.config';
import { base } from '../../modules/base.module';

@Component({
  selector: 'app-root',
  templateUrl: '../../views/pages/app.component.html',
  styleUrls: ['../../styles/pages/app.component.scss', '../../styles/btns.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  isLogged = false;
  year = new Date().getFullYear();
  isAppView = false;
  isAuthUser = false;
  isHomePage = false;
  isCabinetPage = false;

  menuitem = [
    {
      text: 'О проекте',
      href: ''
    },
    // {
    //   text: 'Статистика',
    //   href: ''
    // },
    {
      text: 'Гарантии',
      href: ''
    },
    {
      text: 'Конкурсы',
      href: ''
    },
    {
      text: 'Отзывы',
      href: ''
    }
  ];

  constructor(private http: Http, private router: Router, private titleService: Title ) {

    (!isNullOrUndefined(localStorage.getItem('token'))) ? this.isLogged = true : this.isLogged = false;

    if (!window['user']) {

      window['user'] = { };
    }

    this.isAuthUser = !!base.storage.get('token');

    this.router.events.subscribe((event: any): void => {
      this.navigationInterceptor(event);
    });

    this.titleService.setTitle( 'Главная' + config.genTitle() );

    const args = location.hash.split('?')[1];

    if (args) {

      const referral = args.split('referral=')[1];

      if (referral) {

          sessionStorage.setItem('referral', referral);
      }
    }
  }

  navigationInterceptor(event) {
    if (event instanceof NavigationEnd) {
      const href = location.hash.split('#')[1].split('/')[1].split('?')[0];
      this.isHomePage = (href === '');
      this.isAppView = (
          href === 'auth' || href === 'reg' || href === 'game' || href === 'forgot'
      );
      this.isCabinetPage = ( href === 'game' );
    }
  }

  logout() {

    base.storage.remove('token');

    location.reload(true);
  }
}

