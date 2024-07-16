'use strict';


function initialize( win ) {

	let selectedBehaviors = { mouseOverWait: 500 }
	let hasLoadSetting = false

	function optMouseOver( trg ) {
		let isMouseOver = false

		trg.addEventListener( 'mouseover', () => {
			isMouseOver = true
			setTimeout( () => {
				if ( isMouseOver ) {
					trg.type = 'text'
				}
			}, selectedBehaviors.mouseOverWait )
		}, false )

		trg.addEventListener( 'mouseout', () => {
			isMouseOver = false
			trg.type = 'password'
		}, false )

		trg.addEventListener( 'blur', () => {
			trg.type = 'password'
		}, false )

		trg.addEventListener( 'keydown', e => {
			if ( e.key === "Enter" ) {
				trg.type = 'password'
			}
		}, false )
	}

	function optDblClick( trg ) {
		trg.addEventListener( 'dblclick', () => {
			if ( trg.type === 'password' ) {
				trg.type = 'text'
			} else {
				trg.type = 'password'
			}
		}, false )

		trg.addEventListener( 'blur', () => {
			trg.type = 'password'
		}, false )

		trg.addEventListener( 'keydown', e => {
			if ( e.key === 'Enter' ) {
				trg.type = 'password'
			}
		}, false )
	}

	function optFocus( trg ) {
		trg.addEventListener( 'focus', () => {
			trg.type = 'text'
		}, false )

		trg.addEventListener( 'blur', () => {
			trg.type = 'password'
		}, false )

		trg.addEventListener( 'keydown', e => {
			if ( e.key === 'Enter' ) {
				trg.type = 'password'
			}
		}, false )
	}

	function optCtrl( trg ) {
		let isHide = true
		let notPressCtrl = true
		let onlyCtrl = true

		trg.addEventListener( 'blur', () => {
			trg.type = 'password'
			isHide = true
			notPressCtrl = true
			onlyCtrl = true
		}, false )

		trg.addEventListener( 'keyup', e => {
			if ( e.key === 'Control' ) {
				if ( onlyCtrl ) {
					isHide = !isHide
				} else {
					isHide = false
				}

				if ( isHide ) {
					trg.type = 'password'
				} else {
					trg.type = 'text'
				}
				notPressCtrl = true
				onlyCtrl = true
			}
		}, false )

		trg.addEventListener( 'keydown', e => {
			if ( e.key === "Enter" ) {
				trg.type = 'password'
				isHide = true
				notPressCtrl = true
				onlyCtrl = true
			} else if ( e.key === 'Control' ) {
				if ( notPressCtrl ) {
					trg.type = 'text'
					notPressCtrl = false
					onlyCtrl = true
				}
			} else {
				onlyCtrl = notPressCtrl
			}
		}, false )
	}

	const actionsArr = { optMouseOver, optDblClick, optFocus, optCtrl }
	const doc = win.document
	const modified = new WeakSet()

	function modifyAllInputs() {
		const passwordInputs = doc.querySelectorAll( 'input[type=password]' )
		passwordInputs.forEach( input => {
			if ( !modified.has( input ) ) {
				Object.entries( selectedBehaviors ).forEach( ( [ key, value ] ) => {
					if ( value && value.is( 'Boolean' ) ) actionsArr[ key ]( input )
				} )
				modified.add( input )
			}
		} )
	}

	function modifyWeb() {
		if ( hasLoadSetting ) modifyAllInputs()
		else {
			// loadSetting
			chrome.storage.sync.get( data => {
				if ( 'selectedBehaviors' in data ) {
					selectedBehaviors = data.selectedBehaviors
				}
				modifyAllInputs()
				hasLoadSetting = true
			} )
		}
	}

	modifyWeb()

	const docObserver = new MutationObserver( () => {
		// NOTE: Despite we can recursively check element from addNodes.
		// Benchmark shows that it is much fast to just use `querySelectorAll` to find password inputs
		modifyWeb()
	} )

	docObserver.observe( doc.documentElement, {
		childList: true,
		subtree: true,
		// Some website add input with text type at first, then change its type to password.
		attributes: true,
		attributeFilter: [ 'type' ]
	} );
}

( async function ( browser ) { //required to use "top-level" await
	const [ monkeypatch, monkeypatch_DOM ] = [
		browser.runtime.getURL( "./lib/monkeypatch_prototypes/monkeypatch.mjs" ),
		browser.runtime.getURL( "./lib/monkeypatch_prototypes/monkeypatch_DOM.mjs" )
	];


	const MONKEYPATCH = await import( monkeypatch ); //declaration import is blocked for content scripts  in chrome browser
	[ 'consoleColors', 'stringify', 'is', 'defer' ].forEach( patch => MONKEYPATCH[ patch ]() );
	const MONKEYPATCH_DOM = await import( monkeypatch_DOM );
	[ 'ShadowRootTraverse', 'eventListeners', 'preventDefault', 'keyboardEventProperties', 'patchingHTMLElements' ].forEach( patch => MONKEYPATCH_DOM[ patch ]() );


	initialize( globalThis );


} )( globalThis.browser || chrome );
