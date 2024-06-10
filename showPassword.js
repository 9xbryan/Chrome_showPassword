(function (win) {
  'use strict'

  let selectedBehaviors = {mouseOverWait: 500}
  let hasLoadSetting = false

  function optMouseOver (tar) {
    let isMouseOver = false

    tar.addEventListener('mouseover', () => {
      isMouseOver = true
      setTimeout(() => {
        if (isMouseOver) {
          tar.type = 'text'
        }
      }, selectedBehaviors.mouseOverWait)
    }, false)

    tar.addEventListener('mouseout', () => {
      isMouseOver = false
      tar.type = 'password'
    }, false)

    tar.addEventListener('blur', () => {
      tar.type = 'password'
    }, false)

    tar.addEventListener('keydown', e => {
      if (e.key === "Enter") {
        tar.type = 'password'
      }
    }, false)
  }

  function optDblClick (tar) {
    tar.addEventListener('dblclick', () => {
      if (tar.type === 'password') {
        tar.type = 'text'
      } else {
        tar.type = 'password'
      }
    }, false)

    tar.addEventListener('blur', () => {
      tar.type = 'password'
    }, false)

    tar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        tar.type = 'password'
      }
    }, false)
  }

  function optFocus (tar) {
    tar.addEventListener('focus', () => {
      tar.type = 'text'
    }, false)

    tar.addEventListener('blur', () => {
      tar.type = 'password'
    }, false)

    tar.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        tar.type = 'password'
      }
    }, false)
  }

  function optCtrl (tar) {
    let isHide = true
    let notPressCtrl = true
    let onlyCtrl = true

    tar.addEventListener('blur', () => {
      tar.type = 'password'
      isHide = true
      notPressCtrl = true
      onlyCtrl = true
    }, false)

    tar.addEventListener('keyup', e => {
      if (e.key === 'Control') {
        if (onlyCtrl) {
          isHide = !isHide
        } else {
          isHide = false
        }

        if (isHide) {
          tar.type = 'password'
        } else {
          tar.type = 'text'
        }
        notPressCtrl = true
        onlyCtrl = true
      }
    }, false)

    tar.addEventListener('keydown', e => {
      if (e.key === "Enter") {
        tar.type = 'password'
        isHide = true
        notPressCtrl = true
        onlyCtrl = true
      } else if (e.key === 'Control') {
        if (notPressCtrl) {
          tar.type = 'text'
          notPressCtrl = false
          onlyCtrl = true
        }
      } else {
        onlyCtrl = notPressCtrl
      }
    }, false)
  }

  const actionsArr = {optMouseOver, optDblClick, optFocus, optCtrl}
  const doc = win.document
  const modified = new WeakSet()

  function modifyAllInputs () {
    const passwordInputs = doc.querySelectorAll('input[type=password]')
    passwordInputs.forEach(input => {
      if (!modified.has(input)) {
        Object.entries(selectedBehaviors).forEach(([key,value]) => {
        if (value.is('Boolean') && value) actionsArr[key](input)
      })
        modified.add(input)
      }
    })
  }

  function modifyWeb () {
    if (hasLoadSetting) {
      modifyAllInputs()
    } else {
    // loadSetting
      chrome.storage.sync.get(data => {
        if ('selectedBehaviors' in data) {
          selectedBehaviors = data.selectedBehaviors
        }
        modifyAllInputs()
        hasLoadSetting = true
      })
    }
  }

  modifyWeb()

  const docObserver = new MutationObserver(() => {
    // NOTE: Despite we can recursively check element from addNodes.
    // Benchmark shows that it is much fast to just use `querySelectorAll` to find password inputs
    modifyWeb()
  })

  docObserver.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    // Some website add input with text type at first, then change its type to password.
    attributes: true,
    attributeFilter: ['type']
  })
})(globalThis)
