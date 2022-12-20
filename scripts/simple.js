/*jslint browser: true*/
/*global requirejs, define */
/*properties config, enforceDefine,
    jquery,
    paths, exports, shim, after, log */

require.config({
    enforceDefine: true, //for errors in IE
    baseUrl: 'support/Animation/src/minified',
    paths: {
        jquery: [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
            'http://code.jquery.com/jquery-1.11.0.min',
            //'jquery.min',
        ],
    },
    shim: {
        jquery: {exports: '$'},
    }
});

define(['jquery'], function ($) {
    $('.bar').after('<img src="images/barA.gif" class="barA"/>');
    tl = new TimelineMax()
    tl.staggerFrom($('.skill_wrap>.barA img.bar'), 0.5, {width:0},0.5);// w/o English
});
