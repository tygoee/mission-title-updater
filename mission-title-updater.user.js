// ==UserScript==
// @name         Mission title updater
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Updates mission title
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