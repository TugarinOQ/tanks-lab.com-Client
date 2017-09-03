import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';

@Component({
    selector: 'helpme',
    templateUrl: '../../views/pages/helpme.view.html',
    styleUrls: [ '../../styles/pages/helpme.style.scss' ]
})

export class helpmeComponent {

    constructor(private titleService: Title) {

        this.titleService.setTitle( 'Контакты' + config.genTitle() );
    }
}
