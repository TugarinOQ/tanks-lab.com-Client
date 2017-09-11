import * as d3 from 'd3';

export const alertBox = {
    isShow: false,
    alert: undefined,

    loading: {

        show: () => {

            const waiting = d3
                .select('app-root');

            alertBox._create({ view: waiting });

            d3
                .select('html')
                .classed('noscroll', true);

            alertBox
                .alert
                .append('div')
                .classed('waiting', true);
        },
        hide: () => {

            alertBox.hide();
        }
    },
    popup: {
        show: (props) => {

            Object.assign({ props: {
                width: 400
            } }, props);
            Object.assign(props.props, { classed: 'popup', bg: 'black' });

            alertBox.show(props);
        },
        hide: () => {

            alertBox.hide();
        }
    },
    popupNoCloseButton: {
        show: (props) => {
            Object.assign({ props: {
                width: 400
            } }, props);
            Object.assign(props.props, { classed: 'popupNoCloseButton', bg: 'wot' });

            alertBox.show(props);
        },
        hide: () => {

            alertBox.hide();
        }
    },
    show: ({ title, html, buttons = [
        {
            title: 'OK',
            classed: 'default',
            on: alertBox.hide
        }
    ], props = <any>{
        width: 400
    }, cb = null, _this = null }) => {

        const _props = props;

        const alert = d3
            .select('app-root');

        alertBox._create({ view: alert, classed: _props.classed, bg: _props.bg });

        d3
            .select('html')
            .classed('noscroll', true);

        alertBox
            .alert
            .style('width', `${_props.width}px`);

        const body = alertBox
            .alert
            .append('div')
            .classed('body clearfix', true);

        const _body = body
            .append('div')
            .classed('body__left-bg', true)
            .append('div')
            .classed('body__right-bg', true);

        const bottom = body
            .append('div')
            .classed('bottom__left-bg', true)
            .classed('btns', buttons.length > 0)
            .append('div')
            .classed('bottom__right-bg', true)
            .classed('btns', buttons.length > 0);

        const content = _body
            .append('div')
            .classed('content', true);

        content
            .append('div')
            .classed('title', true)
            .text(title)
            .append('div')
            .classed('closeBtn', true)
            .on('click', (props.onClose) ? () => alertBox.hide(props.onClose) : alertBox.hide);

        content
            .append('div')
            .classed('body_content', true)
            .append('div')
            .classed('html', true)
            .html(html);

        const btns = bottom
            .append('div')
            .classed('_btns', true)
            .selectAll('btn')
            .data(buttons);

        btns
            .enter()
            .append('div')
            .classed('small-btn', true)
            .attr('class', function (btn) {
                return d3.select(this).attr('class') + ' ' + btn.classed;
            })
            .append('div')
            .classed('text', true)
            .on('click', (btn) => btn.on())
            .append('span')
            .text((btn) => btn.title);

        btns
            .remove()
            .exit();

        if (cb) {
            cb(_this);
        }
    },
    hide: (cb = null) => {

        d3.select('html').classed('noscroll', false);
        d3.select('#alert').remove();

        if (cb) {

            cb();
        }
    },
    _create: ({ view, classed = '', bg = '' }) => {
        if (view.select('#alert').empty()) {
            alertBox.alert = view
                .append('div')
                .attr('id', 'alert')
                .classed(bg, true)
                .append('div')
                .classed('wrapper', true)
                .append('div')
                .classed('box', true)
                .attr('class', function () {
                    return d3.select(this).attr('class') + (classed ? ` ${classed}` : '');
                });
        } else {
            alertBox.alert = view
                .select('#alert')
                .select('.box')
                .attr('class', function () {
                    return d3.select(this).attr('class') + (classed ? ` ${classed}` : '');
                })
                .html('');
        }
    }
};
