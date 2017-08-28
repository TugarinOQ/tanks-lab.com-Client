import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { HttpModule } from '@angular/http';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

import { appRoutes } from './app.router';
import { ReCaptchaModule } from 'angular2-recaptcha';
import { AuthGuard } from './components/auth.guard.component';

import { AppComponent } from './components/pages/app.component';
import { homeComponent } from './components/pages/home.component';
import { authComponent } from './components/pages/auth.component';
import { regComponent } from './components/pages/reg.component';
import { forgotComponent } from './components/pages/forgot.component';
import { gameComponent } from './components/pages/game.component';
import { hangarComponent } from './components/pages/hangar.component';
import { shopComponent } from './components/pages/shop.component';
import { researchComponent } from './components/pages/research.component';

import { checkbtnComponent } from './components/checkbtn.component';
import { btnsComponent } from './components/btns.component';
import { checkboxComponent } from './components/checkbox.component';

@NgModule({
  declarations: [
    AppComponent,
    homeComponent,
    authComponent,
    regComponent,
    forgotComponent,
    gameComponent,
    hangarComponent,
    shopComponent,
    researchComponent,
      checkbtnComponent,
      btnsComponent,
      checkboxComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ReCaptchaModule,
    RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(public appRef: ApplicationRef) {}
    hmrOnInit(store) {
        console.log('HMR store', store);
    }
    hmrOnDestroy(store) {
        let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
        // recreate elements
        store.disposeOldHosts = createNewHosts(cmpLocation);
        // remove styles
        removeNgStyles();
    }
    hmrAfterDestroy(store) {
        // display new elements
        store.disposeOldHosts();
        delete store.disposeOldHosts;
    }
}
