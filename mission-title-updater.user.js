// ==UserScript==
// @name         Mission title updater
// @author       tygoee
// @version      1.0.2
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

const missionNames = {
    "0": "Brandende afvalbak",
    // paste the mission list here
};

// For testing/debugging
const missionIds = new Proxy({}, {
    get: (target, prop) => prop
});

(function () {
    'use strict';

    function getMissionKey(missionTypeId, overlayIndex) {
        // Overlay index can be both null and 'null'
        if (overlayIndex && overlayIndex != 'null') {
            return `${missionTypeId}-${overlayIndex}`;
        } else {
            return missionTypeId;
        }
    }

    // Updates mission title in missions page (/missions)
    function missionUpdate() {
        const missionInfo = document.getElementById('mission_general_info');
        const missionTypeId = missionInfo.getAttribute('data-mission-type');
        const overlayIndex = missionInfo.getAttribute('data-overlay-index');
        const missionKey = getMissionKey(missionTypeId, overlayIndex);

        const title = document.getElementById('missionH1');

        // Only the text node selected to keep icons and mission claim rewards
        const textNode = Array.from(title.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (missionNames[missionKey]) textNode.textContent = ' ' + missionNames[missionKey];

        const oldCaption = title.getElementsByTagName('s');
        if (oldCaption[0]) oldCaption[0].remove();
    }

    function sidebarMissionUpdate() {
        const sidebarEntries = document.getElementsByClassName('missionSideBarEntry');
        for (const sidebarEntry of sidebarEntries) {
            const missionTypeId = sidebarEntry.getAttribute('mission_type_id');
            const overlayIndex = sidebarEntry.getAttribute('data-overlay-index');
            const missionKey = getMissionKey(missionTypeId, overlayIndex);

            const missionId = sidebarEntry.getAttribute('mission_id')
            const title = document.getElementById(`mission_caption_${missionId}`);

            // Only the text node, to keep location in the title
            // Not the first child, in case of old captions with mission expansions (<s>mission</s> mission)
            const textNode = Array.from(title.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            if (missionNames[missionKey]) textNode.textContent = missionNames[missionKey] + ', ';

            const oldCaption = document.getElementById(`mission_old_caption_${missionId}`);
            if (oldCaption) oldCaption.remove();
        }
    }

    function tooltipMissionUpdate(layer, content) {
        if (!layer instanceof L.Marker) return;
        const tooltip = layer._tooltip;
        if (!tooltip) return;

        content.innerHTML = tooltip._content;
        const missionId = content.querySelectorAll('[id^="mission_address_"]');
        if (!missionId.length) return; // not a mission
        const mission = missionId[0].id.split('_').pop();

        const sidebarEntry = document.getElementById(`mission_${mission}`);
        const missionTypeId = sidebarEntry.getAttribute('mission_type_id');
        const overlayIndex = sidebarEntry.getAttribute('data-overlay-index');
        const missionKey = getMissionKey(missionTypeId, overlayIndex);

        if (missionNames[missionKey]) content.firstChild.textContent = missionNames[missionKey] + ', ';
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