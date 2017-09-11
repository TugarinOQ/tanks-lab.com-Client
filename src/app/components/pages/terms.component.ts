import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';

@Component({
    selector: 'terms',
    templateUrl: '../../views/pages/terms.view.html',
    styleUrls: [ '../../styles/pages/terms.style.scss' ]
})

export class termsComponent {

    constructor(private titleService: Title) {

        this.titleService.setTitle( 'Пользовательское соглашение' + config.genTitle() );
    }
}
