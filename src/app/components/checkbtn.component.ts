import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'checkbtn',
    templateUrl: '../views/checkbtn.view.html',
    styleUrls: ['../styles/checkbtn.style.scss']
})

export class checkbtnComponent {
    private _classed = '';
    private _id = '';

    @Input()
    set classed(classed: string) {
        this._classed = (classed && classed.trim()) || '';
    }
    get classed(): string { return this._classed; }

    @Input()
    set id(id: string) {
        this._id = (id && id.trim()) || '';
    }
    get id(): string { return this._id || this._classed; }

    @Output() onChecked = new EventEmitter<boolean>();

    click(value) {
        this.onChecked.emit(!value);
    }

    constructor() {}
}
