'use strict';
/*jslint browser: true*/

import gsap from "gsap";

function animate(params) {
    const tl = new gsap.timeline();
    tl.staggerFrom(document.querySelectorAll('.skill_wrap>.barA img.bar'), 0.5, {width:0},0.5);// w/o English
}
animate();