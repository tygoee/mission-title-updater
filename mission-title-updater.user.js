// ==UserScript==
// @name         Mission title updater
// @author       tygoee
// @version      1.0.1
// @description  Updates mission title
// @namespace    http://tampermonkey.net/
// @match        https://www.operacni-stredisko.cz/*
// @match        https://policie.operacni-stredisko.cz/*
// @match        https://www.alarmcentral-spil.dk/*
// @match        https://politi.alarmcentral-spil.dk/*
// @match        https://www.leitstellenspiel.de/*
// @match        https://polizei.leitstellenspiel.de/*
// @match        https://www.missionchief-australia.com/*
// @match        https://police.missionchief-australia.com/*
// @match        https://www.missionchief.co.uk/*
// @match        https://police.missionchief.co.uk/*
// @match        https://www.missionchief.com/*
// @match        https://police.missionchief.com/*
// @match        https://www.centro-de-mando.es/*
// @match        https://www.centro-de-mando.mx/*
// @match        https://www.hatakeskuspeli.com/*
// @match        https://poliisi.hatakeskuspeli.com/*
// @match        https://www.operateur112.fr/*
// @match        https://police.operateur112.fr/*
// @match        https://www.operatore112.it/*
// @match        https://polizia.operatore112.it/*
// @match        https://www.missionchief-japan.com/*
// @match        https://www.missionchief-korea.com/*
// @match        https://www.nodsentralspillet.com/*
// @match        https://politiet.nodsentralspillet.com/*
// @match        https://www.meldkamerspel.com/*
// @match        https://politie.meldkamerspel.com/*
// @match        https://www.operatorratunkowy.pl/*
// @match        https://policja.operatorratunkowy.pl/*
// @match        https://www.operador193.com/*
// @match        https://www.jogo-operador112.com/*
// @match        https://policia.jogo-operador112.com/*
// @match        https://www.jocdispecerat112.com/*
// @match        https://www.dispetcher-112.com/*
// @match        https://www.dispecerske-centrum.com/*
// @match        https://www.larmcentralen-spelet.se/*
// @match        https://polis.larmcentralen-spelet.se/*
// @match        https://www.112-merkez.com/*
// @match        https://www.dyspetcher101-game.com/*
// @grant        none
// ==/UserScript==

const mission_names = {
    "0": "Brandende afvalbak",
    // paste the mission list here
};

// For testing/debugging
const mission_ids = new Proxy({}, {
    get: (target, prop) => prop
});

(function () {
    'use strict';

    function missionId(mission_type_id, overlay_index) {
        // Overlay index can be both null and 'null'
        if (overlay_index && overlay_index != 'null') {
            return `${mission_type_id}-${overlay_index}`;
        } else {
            return mission_type_id;
        }
    }

    // Updates mission title in missions page (/missions)
    function missionUpdate() {
        const mission_info = document.getElementById('mission_general_info');
        const mission_type_id = mission_info.getAttribute('data-mission-type');
        const overlay_index = mission_info.getAttribute('data-overlay-index');
        const mission_id = missionId(mission_type_id, overlay_index);

        const title = document.getElementById('missionH1');

        // Only the second text node selected to keep icons and mission claim rewards
        const textNode = Array.from(title.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
        if (mission_names[mission_id]) textNode.textContent = ' ' + mission_names[mission_id];
    }

    function sidebarMissionUpdate() {
        const sidebarEntries = document.getElementsByClassName('missionSideBarEntry');
        for (const sidebarEntry of sidebarEntries) {
            const mission_type_id = sidebarEntry.getAttribute('mission_type_id')
            const overlay_index = sidebarEntry.getAttribute('data-overlay-index');
            const mission_id = missionId(mission_type_id, overlay_index);

            const title = document.getElementById(`mission_caption_${sidebarEntry.getAttribute('mission_id')}`);
            // Only the first child node, to keep location in the title
            if (mission_names[mission_id]) title.firstChild.textContent = mission_names[mission_id] + ', ';
        }
    }

    function tooltipMissionUpdate(layer, content) {
        if (!layer instanceof L.Marker) return;
        const tooltip = layer._tooltip
        if (!tooltip) return;

        content.innerHTML = tooltip._content;
        const mission_address = content.querySelectorAll('[id^="mission_address_"]');
        if (!mission_address.length) return; // not a mission
        const mission = mission_address[0].id.split('_').pop();

        const sidebarEntry = document.getElementById(`mission_${mission}`);
        const mission_type_id = sidebarEntry.getAttribute('mission_type_id')
        const overlay_index = sidebarEntry.getAttribute('data-overlay-index');
        const mission_id = missionId(mission_type_id, overlay_index);

        if (mission_names[mission_id]) content.firstChild.textContent = mission_names[mission_id] + ', ';
        tooltip._content = content.innerHTML;
    }

    function setupSidebarObserver() {
        sidebarMissionUpdate(); // initial run

        // Update all missions when sidebar is changed (could be made more efficient)
        const observer = new MutationObserver(sidebarMissionUpdate);
        document.querySelectorAll('[id^="mission_list"]').forEach(mission => {
            observer.observe(mission, {
                childList: true
            });
        });
    }

    function setupTooltipObserver() {
        const content = document.createElement('div');
        map.eachLayer(layer => tooltipMissionUpdate(layer, content)); // initial run

        map.on("layeradd", event => tooltipMissionUpdate(event.layer, content));
    }

    if (location.pathname.startsWith('/missions/')) missionUpdate();

    if (location.pathname != '/') return;
    setupSidebarObserver();
    setupTooltipObserver();
})();