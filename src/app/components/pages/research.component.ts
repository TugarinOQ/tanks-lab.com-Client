import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { Title } from '@angular/platform-browser';

import { gameComponent } from './game.component';
import { urls__config } from '../../configs/urls.config';
import { config } from '../../configs/base.config';

import { req } from '../../modules/request.module';
import { alertBox } from '../../modules/alert.module';
import { base } from  '../../modules/base.module';

import * as async from 'async';

import * as d3 from 'd3';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
    selector: 'research',
    templateUrl: '../../views/pages/research.view.html',
    styleUrls: [
        '../../styles/pages/research.style.scss',
        '../../styles/vehicles_ussr.scss',
        '../../styles/levels.style.scss',
        '../../styles/types.style.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class researchComponent {

    grid = <any>{
        grid: {
            rows: Array(0),
            columns: Array(0),
            levels: []
        }
    };

    constructor(private titleService: Title, private http: Http, private game: gameComponent) {

        this.titleService.setTitle( 'Исследования' + config.genTitle() );

        this.getData();
    }

    fullnameOfTypeTank(type) {

        switch (type) {
            case 'lt':
                return 'Легкий танк';

            case 'mt':
                return 'Средний танк';

            case 'ht':
                return 'Тяжелый танк';

            case 'at-spg':
                return 'ПТ-САУ';

            case 'spg':
                return 'САУ';
        }
    }

    getData() {

        alertBox.loading.show();

        req.get(this.http, {
            url: urls__config.hostLocal + urls__config.research.get,
            err__cb: (err) => {

                alertBox.show({ title: 'Ошибка', html: err.error });
            },
            success__cb: (res) => {

                this.grid.grid.rows = Array(0);
                this.grid.grid.columns = Array(0);

                setTimeout(() => {

                    this.grid = res;
                    this.grid.grid.rows = Array(this.grid.grid.rows);
                    this.grid.grid.columns = Array(this.grid.grid.columns);

                    setTimeout(() => {

                        this.setTankInGrid();

                        alertBox.loading.hide();
                    }, 10);
                }, 10);
            }
        });
    }

    normalPrice(price) {

        return price.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
    }

    setTankInGrid() {

        const grid__view = d3
            .select('.grid__view');

        this.appendLevels(grid__view);

        Object.keys(this.grid.nodes).map((tankKey) => {

            const tank = this.grid.nodes[tankKey];
            const rowGrid = tank.row;
            const columnGrid = tank.column;
            const linesTank = tank.lines;

            const cell = grid__view
                .select('.rows')
                .select(`.row.r${rowGrid}`)
                .select(`.column.c${columnGrid}`);

            const checkCapability = this.checkCapabilityResearchTank({ tank: tank, nodes: this.grid.nodes });

            const node = cell
                .append('div')
                .classed('node', true)
                .classed('inHangar', tank.info.inHangar)
                .classed('researchTank', () => checkCapability && !tank.info.researched)
                .classed('disabled', () => !checkCapability && !tank.info.researched);

            const props = { checkCapability: checkCapability, tank: tank };

            this.setTankInfo({ node: node, buttons: true, props: props });

            this.appendArrow({ node: node, currentTank: tank });
        });
    }

    appendLevels(node) {

        const levels = node
            .select('.levels')
            .selectAll('.level__class')
            .data(this.grid.grid.levels);

        levels
            .enter()
            .append('div')
            .classed('level__class', true)
            .attr('class', function (level, idx) {
                return d3.select(this).attr('class') + ' ' + `l${idx + 1}`;
            })
            .attr('class', function (level) {
                return d3.select(this).attr('class') + ' ' + `w${level}`;
            });

        levels
            .exit()
            .remove();
    }

    setTankInfo({ node, buttons = false, props }) {

        const tank = props.tank;
        const checkCapability = props.checkCapability;

        const info = node
            .append('div')
            .classed('info', true);

        if (checkCapability && !tank.info.researched && buttons === true) {

            const btn = node.append('div')
                .classed('btnNode', true)
                .classed('practice', checkCapability);

            btn
                .classed('green', true)
                .classed('disabled', () => {

                    const countPracticeParent = this.getParentPractice({ tank: tank, nodes: this.grid.nodes }) || 0;
                    const localData = base.storage.get('user', true);

                    return ( countPracticeParent + parseInt(localData.practice) ) < tank.info.pricePractice;
                })
                .append('div')
                .classed('count', true)
                .text(tank.info.pricePractice)
                .on('click', () => {

                    const countPracticeParent = this.getParentPractice({ tank: tank, nodes: this.grid.nodes }) || 0;
                    const localData = base.storage.get('user', true);

                    if (( countPracticeParent + parseInt(localData.practice) ) < tank.info.pricePractice) {

                        return;
                    }

                    this.checkMultiParents(tank, this)
                });
        }

        info
            .append('div')
            .classed('tankImage', true)
            .attr('class', function () {
                return d3.select(this).attr('class') + ' ' + tank.info.name + '_resized';
            });

        const levelInfo = info
            .append('div')
            .classed('levelInfo', true);

        levelInfo
            .append('div')
            .classed('type', true)
            .attr('class', function () {
                return d3.select(this).attr('class') + ' ' + tank.info.type;
            });

        levelInfo
            .append('div')
            .classed('level', true)
            .attr('class', function () {
                return d3.select(this).attr('class') + ' ' + tank.info.level;
            });

        info
            .append('div')
            .classed('tankName', true)
            .classed('bottom', tank.info.inHangar)
            .text(tank.info.displayName);

        if ((!tank.info.researched && !checkCapability ) || (props.showPractice && !checkCapability) || tank.info.inHangar) {

            info
                .append('div')
                .classed('practice', true)
                .classed('top', tank.info.inHangar)
                .text(tank.info.inHangar ? tank.info.practice : tank.info.pricePractice);
        }
    }

    appendArrow({ node, currentTank }) {

        const nextTanks = (currentTank.lines !== undefined && currentTank.lines.length === 1) ? [currentTank.lines] : currentTank.lines;

        if (currentTank.lines === undefined) {

            return;
        }

        nextTanks.map((_tank) => {

            const tank = this.grid.nodes[_tank];

            const curRight = (currentTank.row === tank.row) && ((currentTank.column + 1) === tank.column);
            const curBottomRight =  (currentTank.row === (tank.row - 1)) && ((currentTank.column + 1) === tank.column);
            const curTopRight =  (currentTank.row === (tank.row + 1)) && ((currentTank.column + 1) === tank.column);
            const curBottom =  ((currentTank.row + 1) === tank.row) && (currentTank.column === tank.column);
            const curTop =  ((currentTank.row - 1) === tank.row) && (currentTank.column === tank.column);

            const arrow = node
                .append('div')
                .classed('arrow', true);

            arrow
                .classed('top', curTop)
                .classed('bottom', curBottom);

            arrow
                .append('div')
                .classed('right', curRight)
                .classed('bottomRight', curBottomRight)
                .classed('topRight', curTopRight)
                .classed('top', curTop)
                .classed('bottom', curBottom);
        });
    }

    checkCapabilityResearchTank({ tank, nodes }) {

        if (tank === undefined || tank.parents === undefined) {

            return false;
        }

        const parents = tank.parents;

        let count = 0;

        async.mapSeries(parents, (parent) => {

            if (nodes[parent].info.researched !== true) {

                count++;
            }
        });

        return (count !== parents.length);
    }

    getParentPractice({ tank, nodes }): number {

        if (tank === undefined || tank.parents === undefined) {

            return 0;
        }

        const parents = tank.parents;

        let count = 0;

        async.mapSeries(parents, (parent) => {

            count += nodes[parent].info.practice;
        });

        return count;
    }

    checkMultiParents(tank, __this) {

        alertBox.loading.show();

        if (tank.parents === undefined || tank.parents.length < 2) {

            const _tank = __this.grid.nodes[ (tank.parents === undefined) ? {} : tank.parents[0] ];

            this.preOpenTank(tank, _tank, this);

            return;
        }

        alertBox.popup.show({

            title: `Исследование ${tank.info.displayName}`,
            html: `<div class="row r1">` +
                    `<div class="column c1"></div>` +
                  `</div>` +
                  `<div class="row r2">` +
                    `<div class="column c1"></div>` +
                    `<div class="column c2">` +
                        `<div class="node currentTank"></div>` +
                    `</div>` +
                  `</div>` +
                  `<div class="row r3">` +
                    `<div class="column c1"></div>` +
                  `</div>`,
            buttons: [ ],
            props: {
                width: 450
            },
            cb: () => {

                const viewHtml = d3.select('#alert .box.popup').select('.html');

                function setCurrentTank() {

                    const currentTank = viewHtml.select('.currentTank');

                    const props = { tank: tank };

                    __this.setTankInfo({ node: currentTank, buttons: true, props: props });

                    __this.appendArrow({ node: currentTank, currentTank: tank });
                }

                function setParentTanks() {

                    let grid = [];

                    function set() {

                        async.mapSeries(grid, (_node) => {

                            const _tank = __this.grid.nodes[ tank.parents[grid.indexOf(_node)] ];

                            const cell = viewHtml
                                .select(_node)
                                .select('.column.c1');

                            const node = cell
                                .append('div')
                                .classed('node', true)
                                .on('click', () => this.preOpenTank(tank, _tank, this));

                            const props = { tank: _tank };

                            __this.setTankInfo({ node: node, buttons: true, props: props });

                            __this.appendArrow({ node: node, currentTank: _tank });
                        });
                    }

                    switch (tank.parents.length) {
                        case 1: {
                            grid = [ '.row.r2' ];
                            set();
                            break;
                        }
                        case 2: {
                            grid = [ '.row.r1', '.row.r3' ];
                            set();
                            break;
                        }
                        case 3: {
                            grid = [ '.row.r1', '.row.r2', '.row.r3' ];
                            set();
                            break;
                        }
                    }
                }

                setCurrentTank();
                setParentTanks();
            }
        });
    }

    preOpenTank(tank, parents, __this) {

        alertBox.loading.show();

        alertBox.show({
            title: 'Подтверждение исследования',
            html: `Исследовать ${tank.info.displayName} за <span class="ico silverColor">${tank.info.pricePractice} <span class="ico whiteStar"></span></span>` +
            ` (из них <span class="ico silverColor">${ tank.info.pricePractice - tank.info.practice } <span class="ico goldStar"></span></span>)?`,
            buttons: [
                {
                    title: 'Нет',
                    classed: 'default',
                    on: alertBox.hide
                },
                {
                    title: 'Да',
                    classed: 'action',
                    on: () => __this.openTank(tank, parents, __this)
                }
            ],
            props: {
                width: 400
            }
        });
    }

    openTank(tank, parents, __this) {

        alertBox.hide();

        alertBox.loading.show();

        req.post(__this.http, {
            url: urls__config.hostLocal + urls__config.research.open,
            body: {
                tank: tank.info._id,
                tankParent: parents
            },
            err__cb: (err) => {

                alertBox.show({ title: 'Ошибка', html: err.error });
            },
            success__cb: (res) => {

                __this.game.getData();

                __this.getData();
            }
        })
    }
}
