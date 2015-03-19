/*
 * Fuel UX Checkbox
 * https://github.com/ExactTarget/fuelux
 *
 * Copyright (c) 2014 ExactTarget
 * Licensed under the BSD New license.
 */

// -- BEGIN UMD WRAPPER PREFACE --

// For more information on UMD visit:
// https://github.com/umdjs/umd/blob/master/jqueryPlugin.js

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// if AMD loader is available, register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// OR use browser globals if AMD is not present
		factory(jQuery);
	}
}(function ($) {
	// -- END UMD WRAPPER PREFACE --

	// -- BEGIN MODULE CODE HERE --

	var old = $.fn.checkbox;

	// CHECKBOX CONSTRUCTOR AND PROTOTYPE

	// issues:
	// 1. control initialized on checkbox, but other methods invoked on label (where id selector is)
	// 2. proxying external onchange event before state has been synced
	// 3. multiple triggers on "onchange" event of input as well as "onclick" event of label.  since input is nested within label, this is problematic
	// 4. simplified toggle logic by just simulating "click" event on label
	// 5. isChecked function returns input.prop('checked') rather than the internal state
	// 6. state was being maintained in 4 ways: attribute, prop, class, and internal state variable - simplified this (state on label is controlled by class, state on checkbox controlled by prop)
	// 7. TODO: should we trigger a change event?  should we trigger checked/unchecked too

	var Checkbox = function (element, options) {
		this.options = $.extend({}, $.fn.checkbox.defaults, options);

		if(element.tagName.toLowerCase() !== 'label') {
			console.log('initialize checkbox on the label that wraps the checkbox');
			return;
		}

		// cache elements
		this.$label = $(element);
		this.$chk = this.$label.find('input[type="checkbox"]');
		this.$container = $(element).parent('.checkbox'); // the container div

		// determine if a toggle container is specified
		var containerSelector = this.$chk.attr('data-toggle');
		this.$toggleContainer = $(containerSelector);

		// handle internal events
		this.$chk.on('change', $.proxy(this.itemchecked, this));

		// set default state
		this.setInitialState();
	};

	Checkbox.prototype = {

		constructor: Checkbox,

		setInitialState: function() {
			var $chk = this.$chk;
			var $lbl = this.$label;

			// get current state of input
			var checked = $chk.prop('checked');
			var disabled = $chk.prop('disabled');

			// sync label class with input state
			this.setCheckedState($chk, checked);
			this.setDisabledState($chk, disabled);
		},

		setCheckedState: function(element, checked) {
			var $chk = element;
			var $lbl = this.$label;
			var $container = this.$toggleContainer;

			if(checked) {
				$chk.prop('checked', true);
				$lbl.addClass('checked');
				$container.removeClass('hide hidden');
				$lbl.trigger('checked.fu.checkbox');
			}
			else {
				$chk.prop('checked', false);
				$lbl.removeClass('checked');
				$container.addClass('hidden');
				$lbl.trigger('unchecked.fu.checkbox');
			}

			// TODO: trigger generic changed event?  pass the checked state as an argument?
			// noticed we aren't documenting this event anyway and are recommending developers
			// use jQuery to listen to the onchange event on the native input??
		},

		setDisabledState: function(element, disabled) {
			var $chk = element;
			var $lbl = this.$label;

			if(disabled) {
				this.$chk.prop('disabled', true);
				$lbl.addClass('disabled');
				$lbl.trigger('disabled.fu.checkbox');
			}
			else {
				this.$chk.prop('disabled', false);
				$lbl.removeClass('disabled');
				$lbl.trigger('enabled.fu.checkbox');
			}
		},

		itemchecked: function (evt) {
			var $chk = $(evt.target);
			var checked = $chk.prop('checked');

			this.setCheckedState($chk, checked);
		},

		toggle: function () {
			this.$label[0].click();
		},

		check: function () {
			this.setCheckedState(this.$chk, true);
		},

		uncheck: function () {
			this.setCheckedState(this.$chk, false);
		},

		isChecked: function () {
			var checked = this.$chk.prop('checked');
			return checked;
		},

		enable: function () {
			this.setDisabledState(this.$chk, false);
		},

		disable: function () {
			this.setDisabledState(this.$chk, true);
		},

		destroy: function () {
			this.$container.remove();
			// remove any external bindings
			// [none]
			// empty elements to return to original markup
			// [none]
			return this.$container[0].outerHTML;
		}
	};


	// CHECKBOX PLUGIN DEFINITION

	$.fn.checkbox = function (option) {
		var args = Array.prototype.slice.call(arguments, 1);
		var methodReturn;

		var $set = this.each(function () {
			var $this = $(this);
			var data = $this.data('fu.checkbox');
			var options = typeof option === 'object' && option;

			if (!data) {
				$this.data('fu.checkbox', (data = new Checkbox(this, options)));
			}

			if (typeof option === 'string') {
				methodReturn = data[option].apply(data, args);
			}
		});

		return (methodReturn === undefined) ? $set : methodReturn;
	};

	$.fn.checkbox.defaults = {};

	$.fn.checkbox.Constructor = Checkbox;

	$.fn.checkbox.noConflict = function () {
		$.fn.checkbox = old;
		return this;
	};

	// DATA-API

	$(document).on('mouseover.fu.checkbox.data-api', '[data-initialize=checkbox]', function (e) {
		var $control = $(e.target);//.closest('.checkbox').find('[type=checkbox]');
		if (!$control.data('fu.checkbox')) {
			$control.checkbox($control.data());
		}
	});

	// Must be domReady for AMD compatibility
	$(function () {
		$('[data-initialize=checkbox]').each(function () {
			var $this = $(this);
			if (!$this.data('fu.checkbox')) {
				$this.checkbox($this.data());
			}
		});
	});

	// -- BEGIN UMD WRAPPER AFTERWORD --
}));
// -- END UMD WRAPPER AFTERWORD --
