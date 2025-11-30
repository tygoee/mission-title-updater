// ==UserScript==
// @name         Mission title updater
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Updates mission title
// @match        https://www.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

const mission_names = {
    "0": "Brandende afvalbak",
    // here paste the mission list
};

(function() {
    'use strict';

    function missionUpdate() {
        const mission_type_id = document.getElementById('mission_general_info').getAttribute('data-mission-type');
        const overlay_index = document.getElementById('mission_general_info').getAttribute('data-overlay-index');
        const mission_id = overlay_index ? `${mission_type_id}-${overlay_index}` : mission_type_id;

        const name = document.getElementById('missionH1');
        if (mission_names[mission_id]) name.childNodes[1].textContent = mission_names[mission_id];
    }

    function sidebarMissionUpdate() {
        const sidebarEntries = document.querySelectorAll('.missionSideBarEntry');
        for (const sidebarEntry of sidebarEntries) {
            const mission_type_id = sidebarEntry.getAttribute('mission_type_id')
            const overlay_index = sidebarEntry.getAttribute('data-overlay-index');
            const mission_id = overlay_index == 'null' || !overlay_index ? mission_type_id : `${mission_type_id}-${overlay_index}`;

            const name = document.getElementById(`mission_caption_${sidebarEntry.getAttribute('mission_id')}`);
            if (mission_names[mission_id]) name.firstChild.textContent = mission_names[mission_id] + ', ';
        }
    }

    if (location.pathname.startsWith('/missions/')) missionUpdate();

    if (location.pathname != '/') return;
    sidebarMissionUpdate();

    const observer = new MutationObserver(() => {
        sidebarMissionUpdate();
    });

    document.querySelectorAll('[id^="mission_list"]').forEach(el => {
        observer.observe(el, {
            childList: true,
        });
    });
})();