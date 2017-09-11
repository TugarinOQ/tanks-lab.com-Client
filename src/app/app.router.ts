import { Routes } from '@angular/router';

import { AuthGuard } from './components/auth.guard.component';

import { homeComponent } from './components/pages/home.component';
import { authComponent } from './components/pages/auth.component';
import { regComponent } from './components/pages/reg.component';
import { forgotComponent } from './components/pages/forgot.component';
import { aboutComponent } from './components/pages/about.component';
import { helpmeComponent } from './components/pages/helpme.component';
import { termsComponent } from './components/pages/terms.component';
import { gameComponent } from './components/pages/game.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: homeComponent
  },
  {
    path: 'auth',
    component: authComponent
  },
  {
    path: 'reg',
    component: regComponent
  },
  {
    path: 'forgot',
    component: forgotComponent
  },
  {
    path: 'about',
    component: aboutComponent
  },
  {
    path: 'helpme',
    component: helpmeComponent
  },
  {
    path: 'terms',
    component: termsComponent
  },
  {
    path: 'game',
    component: gameComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'game/:section',
    component: gameComponent,
    canActivate: [ AuthGuard ]
  }
];
