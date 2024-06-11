/*
 * Copyright (C) 2014 yuSing.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */

'use strict';

import * as monkeypatch from "./lib/monkeypatch_prototypes/monkeypatch.mjs";
import * as monkeypatch_DOM from "./lib/monkeypatch_prototypes/monkeypatch_DOM.mjs";
['consoleColors', 'stringify', 'is', 'defer'].forEach( patch => monkeypatch[patch]());
['consoleHtmlTag'].forEach(patch => monkeypatch_DOM[patch]());
if (`undefined` == typeof globalThis.browser) globalThis.browser = chrome;

let selectBehave, mouseOverWait, selectedBehaviors = {mouseOverWait: 500}

function setLocalText (name) {
  document.getElementById(name).innerHTML = browser.i18n.getMessage(name)
}

function localization () {
  const localTexts = ['optionTitle', 'labelWhen', 'optMouseOver', 'optDblClick', 'optFocus', 'optCtrl', 'labelWait', 'labelPreview']
  localTexts.forEach(setLocalText)
}

function loadSetting () {
  browser.storage.sync.get(data => {
    if ('selectedBehaviors' in data) {
      selectedBehaviors = data.selectedBehaviors
      Object.entries(selectedBehaviors).forEach(([key,value]) => {
        let attribute = value.is('Boolean') ? 'checked' : 'value';
        let option = document.getElementById(key);
        option[attribute] = value;
      })
      if (!selectedBehaviors.optMouseOver) {
        document.getElementById('divWait').style.display = 'none'
      }
    }
  })
}

function saveSetting () {
  selectedBehaviors.mouseOverWait = mouseOverWait.value
  browser.storage.sync.set({
    selectedBehaviors: selectedBehaviors,
  })
  window.location.reload()
}

document.addEventListener('DOMContentLoaded', () => {
  // selectBehave = document.getElementById('selectBehave')
  mouseOverWait = document.getElementById('mouseOverWait')

  // selectBehave.addEventListener('change', saveSetting, false)
  mouseOverWait.addEventListener('blur', saveSetting, false)

  let checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
  checkboxes.forEach(box => {
    box.addEventListener('click', e => {
      selectedBehaviors[box.id] = box.checked;
    });
    box.addEventListener('change', saveSetting, false);
  })

  document.getElementById('passwordTest').addEventListener('keydown', e => {
    if (e.key === "Enter")  window.location.reload()
  }, false)

  localization()
  loadSetting()
}, false)
