/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.ComboBox.
sap.ui.define(['jquery.sap.global', './ComboBoxBase', './ComboBoxBaseRenderer','./ComboBoxRenderer', './SelectList', './library'],
	function(jQuery, ComboBoxBase, ComboBoxBaseRenderer, ComboBoxRenderer, SelectList, library) {
		"use strict";

		/**
		 * Constructor for a new ComboBox.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ComboBox control provides a list box with items and a text field allowing the user to either type a value directly into the control or choose from the list of existing items.
		 * @extends sap.m.ComboBoxBase
		 *
		 * @author SAP SE
		 * @version 1.30.8
		 *
		 * @constructor
		 * @public
		 * @since 1.22
		 * @alias sap.m.ComboBox
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ComboBox = ComboBoxBase.extend("sap.m.ComboBox", /** @lends sap.m.ComboBox.prototype */ { metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Key of the selected item. If the key has no corresponding item, no changes will apply. If duplicate keys exist, the first item matching the key is used.
				 */
				selectedKey: { type: "string", group: "Data", defaultValue: "" },

				/**
				 * Identifier of the selected item. If the identifier has no corresponding item, no changes will apply.
				 */
				selectedItemId: { type: "string", group: "Misc", defaultValue: "" }
			},
			associations: {

				/**
				 * Sets or retrieves the selected item from the aggregation named items.
				 */
				selectedItem: { type: "sap.ui.core.Item", multiple: false }
			},
			events: {

				/**
				 * Occurs when the user changes the selected item.
				 */
				selectionChange: {
					parameters: {

						/**
						 * The selected item.
						 */
						selectedItem: { type: "sap.ui.core.Item" }
					}
				}
			}
		}});

		/* =========================================================== */
		/* Private methods and properties                              */
		/* =========================================================== */

		/* ----------------------------------------------------------- */
		/* Private methods                                             */
		/* ----------------------------------------------------------- */

		function fnHandleKeyboardNavigation(oItem) {
			var oDomRef = this.getFocusDomRef(),
				iSelectionStart = oDomRef.selectionStart,
				iSelectionEnd = oDomRef.selectionEnd,
				bIsTextSelected = iSelectionStart !== iSelectionEnd,
				sTypedValue = oDomRef.value.substring(0, oDomRef.selectionStart),
				oSelectedItem = this.getSelectedItem();

			if (oItem && (oItem !== oSelectedItem)) {
				this.updateDomValue(oItem.getText());
				this.setSelection(oItem);
				this.fireSelectionChange({ selectedItem: oItem });

				oItem = this.getSelectedItem();	// note: update the selected item after the change event is fired (the selection may change)

				if (!jQuery.sap.startsWithIgnoreCase(oItem.getText(), sTypedValue) || !bIsTextSelected) {
					iSelectionStart = 0;
				}

				this.selectText(iSelectionStart, oDomRef.value.length);
			}

			this.scrollToItem(oItem);
		}

		function fnSelectTextIfFocused(iStart, iEnd) {
			if (document.activeElement === this.getFocusDomRef()) {
				this.selectText(iStart, iEnd);
			}
		}

		/**
		 * Handles the virtual focus of items.
		 *
		 * @param {sap.ui.core.Item | null} vItem
		 * @private
		 * @since 1.32
		 */
		ComboBox.prototype._handleAriaActiveDescendant = function(vItem) {
			var oDomRef = this.getFocusDomRef(),
				sActivedescendant = "aria-activedescendant";

			if (oDomRef) {

				// the aria-activedescendant attribute is set when the list is rendered
				if (vItem && vItem.getDomRef() && this.isOpen()) {
					oDomRef.setAttribute(sActivedescendant, vItem.getId());
				} else {
					oDomRef.removeAttribute(sActivedescendant);
				}
			}
		};

		ComboBox.prototype._callMethodInControl = function(sFunctionName, aArgs) {
			var oList = this.getList();

			if (aArgs[0] === "items") {

				if (oList) {
					return SelectList.prototype[sFunctionName].apply(oList, aArgs);
				}
			} else {
				return ComboBoxBase.prototype[sFunctionName].apply(this, aArgs);
			}
		};

		ComboBox.prototype._setItemVisibility = function(oItem, bVisible) {
			var $OItem = oItem && oItem.$(),
				CSS_CLASS = "sapMSelectListItemInvisible";

			if (bVisible) {
				oItem.bVisible = true;
				$OItem.length && $OItem.removeClass(CSS_CLASS);
			} else {
				oItem.bVisible = false;
				$OItem.length && $OItem.addClass(CSS_CLASS);
			}
		};

		/**
		 * Sets the selected item by its index.
		 *
		 * @param {int} iIndex
		 * @private
		 */
		ComboBox.prototype.setSelectedIndex = function(iIndex, _aItems /* only for internal usage */) {
			var oItem;
			_aItems = _aItems || this.getItems();

			// constrain the new index
			iIndex = (iIndex > _aItems.length - 1) ? _aItems.length - 1 : Math.max(0, iIndex);
			oItem = _aItems[iIndex];

			if (oItem) {

				this.setSelection(oItem);
			}
		};

		/* ----------------------------------------------------------- */
		/* Popover                                                     */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance type of <code>sap.m.Popover</code>.
		 *
		 * @returns {sap.m.Popover}
		 * @private
		 */
		ComboBox.prototype._createPopover = function() {

			// initialize Popover
			var oPicker = new sap.m.Popover({
				showHeader: false,
				placement: sap.m.PlacementType.Vertical,
				offsetX: 0,
				offsetY: 0,
				initialFocus: this,
				bounce: false
			});

			this._decoratePopover(oPicker);
			return oPicker;
		};

		/**
		 * Decorate a Popover instance by adding some private methods.
		 *
		 * @param {sap.m.Popover}
		 * @private
		 */
		ComboBox.prototype._decoratePopover = function(oPopover) {
			var that = this;

			// adding additional capabilities to the Popover
			oPopover._removeArrow = function() {
				this._marginTop = 0;
				this._marginLeft = 0;
				this._marginRight = 0;
				this._marginBottom = 0;
				this._arrowOffset = 0;
				this._offsets = ["0 0", "0 0", "0 0", "0 0"];
			};

			oPopover._setPosition = function() {
				this._myPositions = ["begin bottom", "begin center", "begin top", "end center"];
				this._atPositions = ["begin top", "end center", "begin bottom", "begin center"];
			};

			oPopover._setArrowPosition = function() {};

			oPopover.open = function() {
				return this.openBy(that);
			};
		};

		/**
		 * Required adaptations after rendering of the Popover.
		 *
		 * @private
		 */
		ComboBox.prototype.onAfterRenderingPopover = function() {
			var oPopover = this.getPicker();

			// remove the Popover arrow
			oPopover._removeArrow();

			// position adaptations
			oPopover._setPosition();
		};

		/**
		 * Synchronize the width of the picker pop-up with the width of the input field.
		 *
		 * @private
		 * @since 1.30
		 */
		ComboBox.prototype._synchronizePickerWidth = function() {
			var oDomRef = this.getDomRef();

			if (oDomRef) {
				this.getPicker().setContentWidth((oDomRef.offsetWidth / parseFloat(sap.m.BaseFontSize)) + "rem");
			}
		};

		/* ----------------------------------------------------------- */
		/* Dialog                                                      */
		/* ----------------------------------------------------------- */

		/**
		 * Creates an instance type of <code>sap.m.Dialog</code>.
		 *
		 * @returns {sap.m.Dialog}
		 * @private
		 */
		ComboBox.prototype._createDialog = function() {
			var CSS_CLASS = sap.m.ComboBoxBaseRenderer.CSS_CLASS;

			// initialize Dialog
			var oDialog = new sap.m.Dialog({
				stretchOnPhone: true,
				customHeader: new sap.m.Bar({
					contentLeft: new sap.m.InputBase({
						value: this.getSelectedItem().getText(),
						width: "100%",
						editable: false
					}).addStyleClass(CSS_CLASS + "Input")
				}).addStyleClass(CSS_CLASS + "Bar")
			});

			oDialog.getAggregation("customHeader").attachBrowserEvent("tap", function() {
				oDialog.close();
			}, this);

			return oDialog;
		};

		/**
		 * Called before the Dialog is opened.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeOpenDialog = function() {
			var oHeader = this.getPicker().getCustomHeader();
			oHeader.getContentLeft()[0].setValue(this.getSelectedItem().getText());
		};

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Required adaptations before rendering.
		 *
		 * @private
		 */
		ComboBox.prototype.onBeforeRendering = function() {
			ComboBoxBase.prototype.onBeforeRendering.apply(this, arguments);
			this.synchronizeSelection();
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handle the input event on the control's input field.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.oninput = function(oEvent) {
			ComboBoxBase.prototype.oninput.apply(this, arguments);

			// note: input event can be buggy
			// @see sap.m.InputBase#oninput
			if (oEvent.isMarked("invalid")) {
				return;
			}

			var oSelectedItem = this.getSelectedItem(),
				aItems = this.getItems(),
				oInputDomRef = oEvent.target,
				sValue = oInputDomRef.value,
				bFirst = true,
				bVisibleItems = false,
				oItem,
				bMatch,
				i = 0;

			for (; i < aItems.length; i++) {

				// the item match with the value
				oItem = aItems[i];
				bMatch = jQuery.sap.startsWithIgnoreCase(oItem.getText(), sValue);

				if (sValue === "") {
					bMatch = true;
				}

				this._setItemVisibility(oItem, bMatch);

				if (bMatch && !bVisibleItems) {
					bVisibleItems = true;
				}

				// first match of the value
				if (bFirst && bMatch && sValue !== "") {
					bFirst = false;

					if (this._bDoTypeAhead) {
						this.updateDomValue(oItem.getText());
					}

					this.setSelection(oItem);

					if (oSelectedItem !== this.getSelectedItem()) {
						this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
					}

					if (this._bDoTypeAhead) {

						if (sap.ui.Device.os.blackberry || sap.ui.Device.os.android) {

							// note: timeout required for a BlackBerry bug
							setTimeout(fnSelectTextIfFocused.bind(this, sValue.length, this.getValue().length), 0);
						} else {
							this.selectText(sValue.length, 9999999);
						}
					}

					this.scrollToItem(this.getSelectedItem());
				}
			}

			if (sValue === "" || !bVisibleItems) {
				this.setSelection(null);

				if (oSelectedItem !== this.getSelectedItem()) {
					this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
				}
			}

			// open the picker on input
			if (bVisibleItems) {
				this.open();
			} else {
				this.isOpen() ? this.close() : this.clearFilter();
			}
		};

		/**
		 * Handle the selection change event on the List.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @private
		 */
		ComboBox.prototype.onSelectionChange = function(oControlEvent) {
			var oItem = oControlEvent.getParameter("selectedItem"),
				sValue;

			this.close();
			this.updateDomValue(oItem.getText());
			this.setSelection(oItem);
			this.fireSelectionChange({ selectedItem: this.getSelectedItem() });
			sValue = this.getValue();

			if (sap.ui.Device.system.desktop) {

				// deselect the text and move the text cursor at the endmost position (only ie)
				jQuery.sap.delayedCall(0, this, "selectText", [sValue.length, sValue.length]);
			}
		};

		/* ----------------------------------------------------------- */
		/* Keyboard handling                                           */
		/* ----------------------------------------------------------- */

		/**
		 * Handle the keydown event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onkeydown = function(oEvent) {
			ComboBoxBase.prototype.onkeydown.apply(this, arguments);

			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			var mKeyCode = jQuery.sap.KeyCodes;
			this._bDoTypeAhead = (oEvent.which !== mKeyCode.BACKSPACE) && (oEvent.which !== mKeyCode.DELETE);
		};

		/**
		 * Handle cut event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.oncut = function(oEvent) {
			ComboBoxBase.prototype.oncut.apply(this, arguments);
			this._bDoTypeAhead = false;
		};

		/**
		 * Handle when enter is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapenter = function(oEvent) {
			ComboBoxBase.prototype.onsapenter.apply(this, arguments);

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			var sValue = this.getValue();
			this.setValue(sValue);

			// no text selection
			this.selectText(sValue.length, sValue.length);

			if (this.isOpen()) {
				this.close();
			}
		};

		/**
		 * Handle when keyboard DOWN arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapdown = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			var oNextSelectableItem,
				aSelectableItems = this.getSelectableItems();

			oNextSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) + 1];
			fnHandleKeyboardNavigation.call(this, oNextSelectableItem);
		};

		/**
		 * Handle when keyboard UP arrow is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapup = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when arrow keys are pressed
			oEvent.preventDefault();

			var oPrevSelectableItem,
				aSelectableItems = this.getSelectableItems();

			oPrevSelectableItem = aSelectableItems[aSelectableItems.indexOf(this.getSelectedItem()) - 1];
			fnHandleKeyboardNavigation.call(this, oPrevSelectableItem);
		};

		/**
		 * Handle Home key pressed.
		 * Select the first selectable item and update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsaphome = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when Home key is pressed
			oEvent.preventDefault();

			var oFirstSelectableItem = this.getSelectableItems()[0];
			fnHandleKeyboardNavigation.call(this, oFirstSelectableItem);
		};

		/**
		 * Handle End key pressed.
		 * Select the last selectable item and update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapend = function(oEvent) {

			// a non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when End key is pressed
			oEvent.preventDefault();

			var oLastSelectableItem = this.findLastEnabledItem(this.getSelectableItems());
			fnHandleKeyboardNavigation.call(this, oLastSelectableItem);
		};

		/**
		 * Handle when page down key is pressed.
		 *
		 * Select the last visible item. If the last visible item is already selected,
		 * scroll one page down and select the then last visible item.
		 * If the last item is selected, do nothing.
		 * Update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappagedown = function(oEvent) {

			// non editable or disabled ComboBox, the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				iIndex = aSelectableItems.indexOf(this.getSelectedItem()) + 10,
				oItem;

			// constrain the index
			iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
			oItem = aSelectableItems[iIndex];
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle when page up key is pressed.
		 *
		 * Select the first visible item. If the first visible item is already selected,
		 * scroll one page up and select the then first visible item.
		 * If the first item is selected, do nothing.
		 * Update the input field accordingly.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsappageup = function(oEvent) {

			// a non editable or disabled ComboBox the selection cannot be modified
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();

			// note: prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			var aSelectableItems = this.getSelectableItems(),
				iIndex = aSelectableItems.indexOf(this.getSelectedItem()) - 10,
				oItem;

			// constrain the index
			iIndex = (iIndex > aSelectableItems.length - 1) ? aSelectableItems.length - 1 : Math.max(0, iIndex);
			oItem = aSelectableItems[iIndex];
			fnHandleKeyboardNavigation.call(this, oItem);
		};

		/**
		 * Handle the focusin event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onfocusin = function(oEvent) {

			// the arrow is receiving focus
			if (oEvent.target === this.getOpenArea()) {

				// the value state message can not be opened if click on the open area
				this.bCanNotOpenMessage = true;

				// avoid the text-editing mode pop-up to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (sap.ui.Device.system.desktop) {

					// force the focus to stay in the input field
					this.focus();
				}

			// probably the input field is receiving focus
			} else {

				// avoid the text-editing mode pop-up to be open on mobile,
				// text-editing mode disturbs the usability experience (it blocks the UI in some devices)
				// note: This occurs only in some specific mobile devices
				if (sap.ui.Device.system.desktop) {
					setTimeout(function() {
						if (document.activeElement === this.getFocusDomRef()) {
							this.selectText(0, this.getValue().length);
						}
					}.bind(this), 0);
				}

				// open the message pop-up
				if (!this.isOpen() && !this.bCanNotOpenMessage) {
					this.openValueStateMessage();
				}

				this.bCanNotOpenMessage = false;
			}

			this.$().addClass("sapMFocus");
		};

		/**
		 * Handle the focus leave event.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		ComboBox.prototype.onsapfocusleave = function(oEvent) {
			ComboBoxBase.prototype.onsapfocusleave.apply(this, arguments);
			var oPicker = this.getAggregation("picker");

			if (!oEvent.relatedControlId || !oPicker) {
				return;
			}

			var oControl = sap.ui.getCore().byId(oEvent.relatedControlId),
				oFocusDomRef = oControl && oControl.getFocusDomRef();

			if (jQuery.sap.containsOrEquals(oPicker.getFocusDomRef(), oFocusDomRef)) {

				if (sap.ui.Device.system.desktop) {

					// force the focus to stay in the input field
					this.focus();
				}
			}
		};

		/* =========================================================== */
		/* API methods                                                 */
		/* =========================================================== */

		/**
		 * Update and synchronize "selectedItem" association, "selectedItemId", "selectedKey" properties and
		 * the "selectedItem" in the List.
		 *
		 * @param {sap.ui.core.Item | null} vItem
		 */
		ComboBox.prototype.setSelection = function(vItem) {
			var oList = this.getList(),
				sKey;

			if (oList) {
				oList.setSelection(vItem);
			}

			this.setAssociation("selectedItem", vItem, true);
			this.setProperty("selectedItemId", (vItem instanceof sap.ui.core.Item) ? vItem.getId() : vItem, true);

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			sKey = vItem ? vItem.getKey() : "";
			this.setProperty("selectedKey", sKey, true);
			this._handleAriaActiveDescendant(vItem);
		};

		/**
		 * Determines whether the "selectedItem" association and "selectedKey" property are synchronized.
		 *
		 * @returns {boolean}
		 * @since 1.24.0
		 */
		ComboBox.prototype.isSelectionSynchronized = function() {
			var vItem = this.getSelectedItem();
			return this.getSelectedKey() === (vItem && vItem.getKey());
		};

		/**
		 * Synchronize selected item and key.
		 *
		 * @protected
		 */
		ComboBox.prototype.synchronizeSelection = function() {

			if (this.isSelectionSynchronized()) {
				return;
			}

			var sKey = this.getSelectedKey(),
				vItem = this.getItemByKey("" + sKey);	// find the first item with the given key

			// if there is an item that match with the "selectedKey" property and
			// the "selectedKey" property does not have the default value
			if (vItem && (sKey !== "")) {

				// update and synchronize "selectedItem" association and
				// "selectedKey" property
				this.setAssociation("selectedItem", vItem, true);
				this.setProperty("selectedItemId", vItem.getId(), true);

				// update the value if it has not changed
				if (this._sValue === this.getValue()) {
					this.setValue(vItem.getText());
				}
			}
		};

		/**
		 * Determines whether the list is filtered out from the input field.
		 *
		 * @returns {boolean} Whether the list is filtered out.
		 * @since 1.26.0
		 */
		ComboBox.prototype.isFiltered = function() {
			var oList = this.getList();
			return oList && (oList.getVisibleItems().length !== oList.getItems().length);
		};

		/**
		 * Check whether an item is visible or not.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.Item} oItem
		 * @returns {boolean} Whether the item is visible.
		 * @since 1.32.0
		 */
		ComboBox.prototype.isItemVisible = function(oItem) {
			return oItem && (oItem.bVisible === undefined || oItem.bVisible);
		};

		/**
		 * Creates a picker popup container where the selection should take place.
		 * To be overwritten by subclasses.
		 *
		 * @param {string} sPickerType
		 * @returns {sap.m.Popover | sap.m.Dialog} The picker pop-up to be used.
		 * @protected
		 */
		ComboBox.prototype.createPicker = function(sPickerType) {
			var oPicker = this.getAggregation("picker"),
				CSS_CLASS = ComboBoxBaseRenderer.CSS_CLASS;

			if (oPicker) {
				return oPicker;
			}

			oPicker = this["_create" + sPickerType]();

			// define a parent-child relationship between the control's and the picker popup
			this.setAggregation("picker", oPicker, true);

			// configuration
			oPicker.setHorizontalScrolling(false)
					.addStyleClass(CSS_CLASS + "Picker")
					.addStyleClass(CSS_CLASS + "Picker-CTX")
					.attachBeforeOpen(this.onBeforeOpen, this)
					.attachAfterOpen(this.onAfterOpen, this)
					.attachBeforeClose(this.onBeforeClose, this)
					.attachAfterClose(this.onAfterClose, this)
					.addEventDelegate({
						onBeforeRendering: this.onBeforeRenderingPicker,
						onAfterRendering: this.onAfterRenderingPicker
					}, this)
					.addContent(this.createList());

			return oPicker;
		};

		/**
		 * Create an instance type of <code>sap.m.List</code>.
		 *
		 * @returns {sap.m.List}
		 */
		ComboBox.prototype.createList = function() {

			this._oList = new SelectList({
				width: "100%"
			}).addEventDelegate({
				ontap: function(oEvent) {
					this.close();
				}
			}, this)
			.attachSelectionChange(this.onSelectionChange, this);

			return this._oList;
		};

		/*
		 * This hook method is called before the control's picker pop-up is rendered.
		 *
		 */
		ComboBox.prototype.onBeforeRenderingPicker = function() {
			var fnOnBeforeRenderingPickerType = this["onBeforeRendering" + this.getPickerType()];
			fnOnBeforeRenderingPickerType && fnOnBeforeRenderingPickerType.call(this);
		};

		/*
		 * This hook method is called after the control's picker pop-up is rendered.
		 *
		 */
		ComboBox.prototype.onAfterRenderingPicker = function() {
			var fnOnAfterRenderingPickerType = this["onAfterRendering" + this.getPickerType()];
			fnOnAfterRenderingPickerType && fnOnAfterRenderingPickerType.call(this);
		};

		/*
		 * This event handler will be called before the control's picker pop-up is opened.
		 *
		 * @protected
		 */
		ComboBox.prototype.onBeforeOpen = function() {
			var fnPickerTypeBeforeOpen = this["onBeforeOpen" + this.getPickerType()],
				oDomRef = this.getFocusDomRef();

			// add the active state to the control field
			this.addStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "Pressed");

			if (oDomRef) {

				// expose a parent/child contextual relationship to assistive technologies
				// note: the "aria-owns" attribute is set when the list is visible and in view
				oDomRef.setAttribute("aria-owns", this.getList().getId());
			}

			// call the hook to add additional content to the List
			this.addContent();

			sap.ui.Device.resize.attachHandler(this._synchronizePickerWidth, this);
			fnPickerTypeBeforeOpen && fnPickerTypeBeforeOpen.call(this);
		};

		/**
		 * This event handler will be called before the control's picker popover is opened.
		 *
		 */
		ComboBox.prototype.onBeforeOpenPopover = function() {
			this._synchronizePickerWidth();
		};

		/**
		 * This event handler will be called after the control's picker pop-up is opened.
		 *
		 */
		ComboBox.prototype.onAfterOpen = function() {
			var oDomRef = this.getFocusDomRef(),
				oItem = this.getSelectedItem();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "true");

				// note: the "aria-activedescendant" attribute is set when the currently active descendant is visible and in view
				oItem && oDomRef.setAttribute("aria-activedescendant", oItem.getId());
			}
		};

		/**
		 * This event handler will be called before the picker pop-up is closed.
		 *
		 */
		ComboBox.prototype.onBeforeClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {

				// note: the "aria-owns" attribute is removed when the list is not visible and in view
				oDomRef.removeAttribute("aria-owns");

				// the "aria-activedescendant" attribute is removed when the currently active descendant is not visible
				oDomRef.removeAttribute("aria-activedescendant");
			}

			// remove the active state of the control's field
			this.removeStyleClass(sap.m.ComboBoxBaseRenderer.CSS_CLASS + "Pressed");
			sap.ui.Device.resize.detachHandler(this._synchronizePickerWidth, this);
		};

		/**
		 * This event handler will be called after the picker pop-up is closed.
		 *
		 */
		ComboBox.prototype.onAfterClose = function() {
			var oDomRef = this.getFocusDomRef();

			if (oDomRef) {
				oDomRef.setAttribute("aria-expanded", "false");
			}

			// if the focus is back to the input after close the picker, the message should be open
			if (document.activeElement === oDomRef) {
				this.openValueStateMessage();
			}

			// clear the filter to make all items visible
			// note: to prevent flickering, the filter is cleared
			// after the close animation is completed
			this.clearFilter();
		};

		/**
		 * Check whether an item is selected or not.
		 *
		 * @param {sap.ui.core.Item} vItem
		 * @returns {boolean} Whether the item is selected.
		 * @since 1.24.0
		 */
		ComboBox.prototype.isItemSelected = function(vItem) {
			return vItem && (vItem.getId() === this.getAssociation("selectedItem"));
		};

		/**
		 * Retrieves the default selected item from the aggregation named <code>items</code>.
		 *
		 * @returns {null}
		 * @protected
		 */
		ComboBox.prototype.getDefaultSelectedItem = function() {
			return null;
		};

		/*
		 * Clear the selection.
		 *
		 * @protected
		 */
		ComboBox.prototype.clearSelection = function() {
			this.setSelection(null);
		};

		/**
		 * Handle properties changes of items in the aggregation named <code>items</code>.
		 *
		 * @param {sap.ui.base.Event} oControlEvent
		 * @since 1.28
		 */
		ComboBox.prototype.onItemChange = function(oControlEvent) {
			var sSelectedItemId = this.getAssociation("selectedItem"),
				sNewValue = oControlEvent.getParameter("newValue"),
				sProperty = oControlEvent.getParameter("name");

			// if the selected item has changed, synchronization is needed
			if (sSelectedItemId === oControlEvent.getParameter("id")) {

				switch (sProperty) {
					case "text":
						this.setValue(sNewValue);
						break;

					case "key":
						this.setSelectedKey(sNewValue);
						break;

					// no default
				}
			}
		};

		/**
		 * Sets the start and end positions of the current text selection.
		 *
		 * @param {integer} iSelectionStart The index into the text at which the first selected character is located.
		 * @param {integer} iSelectionEnd The index into the text at which the last selected character is located.
		 * @protected
		 * @since 1.22.1
		 */
		ComboBox.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
			ComboBoxBase.prototype.selectText.apply(this, arguments);
			this.textSelectionStart = iSelectionStart;
			this.textSelectionEnd = iSelectionEnd;
			return this;
		};

		ComboBox.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			this._callMethodInControl("addAggregation", arguments);

			if (sAggregationName === "items" && !bSuppressInvalidate && !this.isInvalidateSuppressed()) {
				this.invalidate(oObject);
			}

			return this;
		};

		ComboBox.prototype.getAggregation = function() {
			return this._callMethodInControl("getAggregation", arguments);
		};

		ComboBox.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {

				// propagate the value of the "selectedItem" association to the list
				SelectList.prototype.setAssociation.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.setAssociation.apply(this, arguments);
		};

		ComboBox.prototype.indexOfAggregation = function() {
			return this._callMethodInControl("indexOfAggregation", arguments);
		};

		ComboBox.prototype.insertAggregation = function() {
			this._callMethodInControl("insertAggregation", arguments);
			return this;
		};

		ComboBox.prototype.removeAggregation = function() {
			return this._callMethodInControl("removeAggregation", arguments);
		};

		ComboBox.prototype.removeAllAggregation = function() {
			return this._callMethodInControl("removeAllAggregation", arguments);
		};

		ComboBox.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			this._callMethodInControl("destroyAggregation", arguments);
			return this;
		};

		ComboBox.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {
			var oList = this.getList();

			if ((sPropertyName === "selectedKey") || (sPropertyName === "selectedItemId")) {

				// propagate the value of the "selectedKey" or "selectedItemId" properties to the list
				oList && SelectList.prototype.setProperty.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.setProperty.apply(this, arguments);
		};

		ComboBox.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
			var oList = this.getList();

			if (oList && (sAssociationName === "selectedItem")) {
				SelectList.prototype.removeAllAssociation.apply(oList, arguments);
			}

			return ComboBoxBase.prototype.removeAllAssociation.apply(this, arguments);
		};

		ComboBox.prototype.clone = function(sIdSuffix) {
			var oComboBoxClone = ComboBoxBase.prototype.clone.apply(this, arguments),
				oList = this.getList();

			if (!this.isBound("items") && oList) {
				for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
					oComboBoxClone.addItem(aItems[i].clone());
				}

				oComboBoxClone.setSelectedIndex(this.indexOfItem(this.getSelectedItem()));
			}

			return oComboBoxClone;
		};

		/* ----------------------------------------------------------- */
		/* public methods                                              */
		/* ----------------------------------------------------------- */

		ComboBox.prototype.findAggregatedObjects = function() {
			var oList = this.getList();

			if (oList) {

				// note: currently there is only one aggregation
				return SelectList.prototype.findAggregatedObjects.apply(oList, arguments);
			}

			return [];
		};

		/**
		 * Gets aggregation <code>items</code>.<br>
		 *
		 * <b>Note</b>: This is the default aggregation.
		 * @return {sap.ui.core.Item[]}
		 * @public
		 */
		ComboBox.prototype.getItems = function() {
			var oList = this.getList();
			return oList ? oList.getItems() : [];
		};

		/**
		 * Setter for association <code>selectedItem</code>.
		 *
		 * @param {string | sap.ui.core.Item | null} vItem new value for association <code>selectedItem</code>
		 *    Id of an sap.ui.core.Item which becomes the new target of this <code>selectedItem</code> association.
		 *    Alternatively, an sap.ui.core.Item instance may be given or null.
		 *    If the value of null is provided the first enabled item will be selected (if any).
		 *
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItem = function(vItem) {

			if (typeof vItem === "string") {
				vItem = sap.ui.getCore().byId(vItem);
			}

			if (!(vItem instanceof sap.ui.core.Item) && vItem !== null) {
				jQuery.sap.log.warning('Warning: setSelectedItem() "vItem" has to be an instance of sap.ui.core.Item, a valid sap.ui.core.Item id, or null on', this);
				return this;
			}

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);

			// set the input value
			if (vItem) {
				this.setValue(vItem.getText());
				/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
				/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText());
			} else {
				this.setValue("");
			}

			return this;
		};

		/**
		 * Setter for property <code>selectedItemId</code>.
		 *
		 * @param {string | undefined} vItem New value for property <code>selectedItemId</code>.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedItemId = function(vItem) {
			vItem = this.validateProperty("selectedItemId", vItem);

			if (!vItem) {
				vItem = this.getDefaultSelectedItem();
			}

			this.setSelection(vItem);
			vItem = this.getSelectedItem();

			// set the input value
			if (vItem) {
				this.setValue(vItem.getText());
				/*eslint-disable no-cond-assign */
			} else if (vItem = this.getDefaultSelectedItem()) {
				/*eslint-enable no-cond-assign */
				this.setValue(vItem.getText());
			} else {
				this.setValue("");
			}

			return this;
		};

		/**
		 * Setter for property <code>selectedKey</code>.
		 *
		 * @param {string} sKey New value for property <code>selectedKey</code>.
		 * @returns {sap.m.ComboBox} <code>this</code> to allow method chaining.
		 * @public
		 */
		ComboBox.prototype.setSelectedKey = function(sKey) {
			sKey = this.validateProperty("selectedKey", sKey);
			var oItem = this.getItemByKey(sKey);

			if (oItem || (sKey === "")) {

				if (!oItem && sKey === "") {
					oItem = this.getDefaultSelectedItem();
				}

				this.setSelection(oItem);

				// set the input value
				if (oItem) {
					this.setValue(oItem.getText());
					/*eslint-disable no-cond-assign */
				} else if (oItem = this.getDefaultSelectedItem()) {
					/*eslint-enable no-cond-assign */
					this.setValue(oItem.getText());
				} else {
					this.setValue("");
				}

				return this;
			}

			this._sValue = this.getValue();
			return this.setProperty("selectedKey", sKey);
		};

		/**
		 * Retrieves the selected item object from the aggregation named <code>items</code>.
		 *
		 * @returns {sap.ui.core.Item | null} The current target of the <code>selectedItem</code> association, or null.
		 * @public
		 */
		ComboBox.prototype.getSelectedItem = function() {
			var vSelectedItem = this.getAssociation("selectedItem");
			return (vSelectedItem === null) ? null : sap.ui.getCore().byId(vSelectedItem) || null;
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param {int | string | sap.ui.core.Item} vItem The item to remove or its index or id.
		 * @returns {sap.ui.core.Item} The removed item or null.
		 * @public
		 */
		ComboBox.prototype.removeItem = function(vItem) {
			vItem = ComboBoxBase.prototype.removeItem.apply(this, arguments);
			var oItem;

			if (this.isBound("items") && !this.bDataUpdated) {
				return vItem;
			}

			var sValue = this.getValue();

			if (this.getItems().length === 0) {
				this.clearSelection();
			} else if (this.isItemSelected(vItem)) {
				oItem = this.getDefaultSelectedItem();
				this.setSelection(oItem);
				this.setValue(sValue);
			}

			return vItem;
		};

		return ComboBox;

	}, /* bExport= */ true);