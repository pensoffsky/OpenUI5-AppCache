sap.ui.define([
	"sap/ui/core/UIComponent",
	"./view/Main.controller"
], function(UIComponent, MainController) {
	"use strict";

	return UIComponent.extend("de.pensware.ui5StocksApp.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically 
		 * during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
		},
		
		createContent : function () {
			//get the financeAPI
			var ofinanceAPI = sap.ui.component( {name: "de.pensware.financeAPI" } )
			var oStockQuotesAPI = ofinanceAPI.getStockQuotesAPI();
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			
			//create the main controller (dependency injection)
			//and the main view
			var oMainController = new MainController(oStockQuotesAPI, oStorage);
			var oMainView = sap.ui.xmlview({
				viewName : "de.pensware.ui5StocksApp/view/Main",
				controller : oMainController
			});
			return oMainView;
		}
	});

});