'use strict';
/*jslint browser: true*/

import gsap from "gsap";

function animate(params) {
    const tl = new gsap.timeline();
    const STAGGER_CONFIG = {
        duration: 0.5,
        width: 0,
        stagger: 0.1,
    };
    // w/o English
    const animatedElements = document.querySelectorAll('.skill_wrap>.barA img.bar');
    tl.from(animatedElements, STAGGER_CONFIG);
}
animate();