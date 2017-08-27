import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'checkbox',
    templateUrl: '../views/checkbox.view.html',
    styleUrls: ['../styles/checkbox.style.scss']
})

export class checkboxComponent {
    private _id = '';
    private _title = '';

    @Input()
    set id(id: string) {
        this._id = (id && id.trim()) || '';
    }
    get id(): string { return this._id || ''; }

    @Input()
    set title(title: string) {
        this._title = ((title) && title.trim()) || '';
    }
    get title(): string { return this._title || ''; }

    @Output() onChecked = new EventEmitter<boolean>();

    click(value) {

        this.onChecked.emit(!value);
    }

    constructor() {}
}
