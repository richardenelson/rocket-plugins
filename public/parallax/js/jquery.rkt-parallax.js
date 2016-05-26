/**
 * @title Rocket Parallax Image
 * @description Simple background image parallax effect.
 * @version 0.0.2
 * @author Richard Nelson
 * @email sc2071@gmail.com
 */

(function( $ ) {

	"use strict";


	/*************************************************
	 * PROTOTYPE
	 *************************************************/
	var RocketParallaxSingleton = (function() {
		console.log( "new RocketParallaxSingleton" );


		/*************************************************
		 * PRIVATE
		 *************************************************/

		// ----- PRIVATE VARS ----- //
		var instance;


		/*************************************************
		 * PUBLIC
		 *************************************************/

		// ----- PUBLIC FUNCTIONS ----- //
		function destroyInstance() {
			console.log( "RocketParallaxSingleton: destroyInstance" );

			instance = undefined;

		}

		function getInstance() {
			console.log( "RocketParallaxSingleton: getInstance" );

			if ( !instance ) {

				instance = new RocketParallaxManager();

			}

			return instance;

		}


		/*************************************************
		 * RETURN
		 *************************************************/
		return {
		 	destroyInstance: destroyInstance,
		 	getInstance: getInstance
		}


	}());

	/*************************************************
	 * PROTOTYPE
	 *************************************************/
	var RocketParallaxManager = function() {
		console.log( "new RocketParallaxManager" );


		/*************************************************
		 * PRIVATE
		 *************************************************/

		// ----- PRIVATE VARS ----- //
		var $window;

		var enabled;

		var images;

		var docTop;
		var docBottom;

		var windowHeight;
		var windowTop;

		var resizeTimer;
		var scrollTimer;


		// ----- PRIVATE CONSTANTS ----- //
		var RESIZE_DELAY = 250;


		// ----- PRIVATE FUNCTIONS ----- //
		function init() {
			console.log( "RocketParallaxManager: init" );

			images = [];

			$window = $( window );

			windowHeight = $window.height();
			windowTop = $window.scrollTop();

			docTop = $( document ).scrollTop();
			docBottom = docTop + windowHeight;

		}

		function clearResizeTimer() {
			//console.log( "RocketParallaxManager: clearResizeTimer" );

			if ( resizeTimer ) {

				clearTimeout( resizeTimer );
				resizeTimer = undefined;

			}

		}

		function manageBounds() {
			console.log( "RocketParallaxManager: manageBounds" );

			windowHeight = $( window ).height();

			var i = 0;
			var length = images.length;

			for ( i; i < length; i++ ) {

				images[i].updateBounds( windowHeight );

			};

		}

		function managePositions() {
			console.log( "RocketParallaxManager: managePositions" );

			docTop = $( document ).scrollTop();
			docBottom = docTop + windowHeight;

			var i = 0;
			var length = images.length;

			for ( i; i < length; i++ ) {

				images[i].updatePosition( docTop, docBottom );

			};

		}


		// ----- PRIVATE EVENT LISTENERS ----- //
		function onResize( e ) {
			//console.log( "RocketParallaxManager: onResize" );

			clearResizeTimer();
			resizeTimer = setTimeout( onResizeTimeout, RESIZE_DELAY );

		}

		function onResizeTimeout() {
			//console.log( "RocketParallaxManager: onResizeTimeout" );

			clearResizeTimer();
			manageBounds();
			managePositions();

		}

		function onScroll( e ) {
			//console.log( "RocketParallaxManager: onScroll" );

			requestAnimationFrame( managePositions );

		}


		/*************************************************
		 * PUBLIC
		 *************************************************/

		// ----- PUBLIC VARS ----- //

		// ----- PUBLIC CONSTANTS ----- //

		// ----- PUBLIC FUNCTIONS ----- //
		function add( elem, options ) {
			console.log( "RocketParallaxManager: add" );

			var bleed = ( options ) ? options.bleed : undefined;

			var image = new RocketParallaxImage( elem, docTop, docBottom, windowHeight, bleed );
			images.push( image );

		}

		function destroy() {
			console.log( "RocketParallaxManager: destroy" );

			disable();

			var i = 0;
			var length = images.length;

			for ( i; i < length; i++ ) {

				images[i].destroy();

			};

		}

		function disable() {
			console.log( "RocketParallaxManager: disable" );

			enabled = false;

			clearResizeTimer();

			$window.off( "resize", onResize );
			$window.off( "scroll", onScroll );

		}

		function enable() {
			console.log( "RocketParallaxManager: enable" );

			enabled = true;

			$window.on( "resize", onResize );
			$window.on( "scroll", onScroll );

		}

		function execute( func, options ) {
			console.log( "RocketParallaxManager: execute -> " + func );

			this[ func ].call( this, options );

		}


		// ----- PUBLIC EVENT LISTENERS ----- //


		/*************************************************
		 * CALL
		 *************************************************/
		init();


		/*************************************************
		 * RETURN
		 *************************************************/
		return {
			add: add,
		 	destroy: destroy,
		 	disable: disable,
		 	enable: enable,
		 	execute: execute
		}

	}


	/*************************************************
	 * PROTOTYPE
	 *************************************************/
	var RocketParallaxImage = function( elem, docTop, docBottom, windowHeight, bleed ) {
		console.log( "new RocketParallaxImage" );


		/*************************************************
		 * PRIVATE
		 *************************************************/

		// ----- PRIVATE VARS ----- //
		var $container;
		var $image;

		var containerWidth;
		var containerHeight;
		var containerTop;
		var containerBottom;
		var containerRange;

		var isLoaded;

		var imageBleed;
		var imagePercentY;

		var minBleed;
		var naturalWidth;
		var naturalHeight;


		// ----- PRIVATE FUNCTIONS ----- //
		function init( elem, docTop, docBottom, windowHeight, bleed ) {
			console.log( "RocketParallaxImage: init", docTop, docBottom, windowHeight, bleed );

			// Vars
			$image = $( elem );
			$container = $image.parent();
			minBleed = bleed || parseInt( $image.data( "bleed" ) ) || 100;
			naturalWidth = $image[0].naturalWidth;
			naturalHeight = $image[0].naturalHeight;
			isLoaded = ( naturalWidth && naturalHeight );
			imagePercentY = 1;

			// Update Bounds and Position
			updateBounds( windowHeight );
			updatePosition( docTop, docBottom );

			// Update Image if Loaded
			if ( isLoaded ) {

				updateImage();
				updateTransform();

			} else {

				loadImage();

			}

		}

		function loadImage() {
			console.log( "RocketParallaxImage: loadImage" );

			var img = new Image();
			img.onload = onLoad;
			img.src = $image.attr( "src" );

		}

		function updateImage() {
			console.log( "RocketParallaxImage: updateImage" );

			// Vars
			var fillWidth = containerWidth;
			var fillHeight = containerHeight + minBleed * 2;

			var nWidth;
			var nHeight;
			var nX;
			var nY;

			// Fill Width, Crop Height
			if ( naturalWidth / naturalHeight < fillWidth / fillHeight ) {

				nWidth = fillWidth;
				nHeight = fillWidth * naturalHeight / naturalWidth;

				nX = 0;
				nY = 0;

			// Fill Height, Crop Width
			} else {

				nWidth = fillHeight * naturalWidth / naturalHeight;
				nHeight = fillHeight;

				nX = -( nWidth - fillWidth ) / 2;
				nY = 0;

			}

			// Set Image Bleed
			imageBleed = ( nHeight - containerHeight ) / 2;

			// Set CSS
			$image.css( {
				width: nWidth,
				height: nHeight,
				left: nX,
				top: nY
			} );

			//console.info( "Container:", containerWidth, containerHeight );
			//console.info( "Fill:", fillWidth, fillHeight );
			//console.info( "Natural:", naturalWidth, naturalHeight );
			//console.info( "New Dimensions:", nWidth, nHeight );

		}

		function updateTransform() {
			console.log( "RocketParallaxImage: updateTransform" );

			if ( isLoaded ) {

				var imageTop = -imageBleed * 2 * imagePercentY;
				$image.css( { transform: "translate3d( 0px, " + imageTop + "px, 0px )" } );

				//console.info( "Image Percent Y:", imagePercentY, " - Image Top:", imageTop );

			}

		}


		// ----- PRIVATE EVENT LISTENERS ----- //
		function onLoad() {
			console.log( "RocketParallaxImage: onLoad" );

			isLoaded = true;

			naturalWidth = $image[0].naturalWidth;
			naturalHeight = $image[0].naturalHeight;

			updateImage();
			updateTransform();

		}


		/*************************************************
		 * PUBLIC
		 *************************************************/

		// ----- PUBLIC VARS ----- //

		// ----- PUBLIC CONSTANTS ----- //

		// ----- PUBLIC FUNCTIONS ----- //
		function destroy() {
			console.log( "RocketParallaxImage: destroy" );

			$image.css( {
				width: "",
				height: "",
				left: "",
				top: "",
				transform: ""
			} );

		}

		function execute( func, options ) {
			console.log( "RocketParallaxImage: execute -> " + func );

			this[ func ].call( this, options );

		}

		function updateBounds( windowHeight ) {
			console.log( "RocketParallaxImage: updateBounds", windowHeight );

			containerWidth = $container.outerWidth();
			containerHeight = $container.outerHeight();

			containerTop = $container.offset().top;
			containerBottom = containerTop + containerHeight;

			containerRange = windowHeight + containerHeight;

			//console.info( containerHeight, containerTop, containerBottom, containerRange );

		}

		function updatePosition( docTop, docBottom ) {
			console.log( "RocketParallaxImage: updatePosition", docTop, docBottom );

			if ( docBottom > containerTop && docTop < containerBottom ) {

				imagePercentY = ( containerTop + containerHeight - docTop ) / containerRange;
				updateTransform();

			}

		}


		// ----- PUBLIC EVENT LISTENERS ----- //


		/*************************************************
		 * CALL
		 *************************************************/
		init( elem, docTop, docBottom, windowHeight, bleed );


		/*************************************************
		 * RETURN
		 *************************************************/
		return {
		 	destroy: destroy,
		 	execute: execute,
		 	updateBounds: updateBounds,
		 	updatePosition: updatePosition
		}

	}


	/*************************************************
	 * jQUERY PLUGIN
	 *************************************************/
	$.fn.rktParallax = function() {

		var mgr = RocketParallaxSingleton.getInstance();

		var param0 = arguments[0];
		var param1 = arguments[1];

		this.each( function() {

			if ( typeof( param0 ) !== "string" ) {

				mgr.add( this, param0 );

			} else {

				mgr.execute( param0, param1 );

				if ( param0 === "destroy" )
					RocketParallaxSingleton.destroyInstance();

			}

		} );

		return this;

	};

}( jQuery ));

