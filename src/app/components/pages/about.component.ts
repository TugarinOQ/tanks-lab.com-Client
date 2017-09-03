import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/map';

import { config } from '../../configs/base.config';

@Component({
    selector: 'about',
    templateUrl: '../../views/pages/about.view.html',
    styleUrls: [ '../../styles/pages/about.style.scss' ]
})

export class aboutComponent {

    constructor(private titleService: Title) {
        
        this.titleService.setTitle( 'О проекте' + config.genTitle() );
    }
}
