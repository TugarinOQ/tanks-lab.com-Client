import { Component, ViewEncapsulation } from '@angular/core';
import { Http } from '@angular/http';
import { Title } from '@angular/platform-browser';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { isNullOrUndefined } from 'util';

import * as d3 from 'd3';
import { config } from '../../configs/base.config';

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
  isHomePage = false;
  isCabinetPage = false;

  menuitem = [
    {
      text: 'О проекте',
      href: ''
    },
    {
      text: 'Статистика',
      href: ''
    },
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
    },
    {
      text: 'Поддержка',
      href: ''
    }
  ];

  constructor(private http: Http, private router: Router, private titleService: Title ) {

    (!isNullOrUndefined(localStorage.getItem('token'))) ? this.isLogged = true : this.isLogged = false;

    if (!window['user']) {

      window['user'] = { };
    }

    this.router.events.subscribe((event: any): void => {
      this.navigationInterceptor(event);
    });

    this.titleService.setTitle( 'Главная' + config.genTitle() );
  }

  navigationInterceptor(event) {
    if (event instanceof NavigationEnd) {
      this.isHomePage = (location.hash === '#/');
      const href = location.hash.split('#')[1].split('/')[1];
      this.isAppView = ( href === '/auth' || href === '/reg' || href === '/game' || href === '/forgot' );
      this.isCabinetPage = ( href === '/game' );
    }
  }
}

