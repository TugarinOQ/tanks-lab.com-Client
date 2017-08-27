import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'btn',
    templateUrl: '../views/btns.view.html',
    styleUrls: ['../styles/btns.style.scss']
})

export class btnsComponent {
    private _classed = '';
    private _id = '';

    @Input()
    set classed(classed: string) {
        this._classed = (classed && classed.trim()) || '';
    }
    get classed(): string { return this._classed; }

    set id(id: string) {
        this._id = (id && id.trim()) || '';
    }
    get id(): string { return this._id || this._classed; }

    text: string;

    @Output() onClick = new EventEmitter<boolean>();

    click(value) {
        this.onClick.emit(!value);
    }

    constructor() {}
}
