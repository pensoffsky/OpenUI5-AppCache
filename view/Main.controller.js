sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
	"use strict";
	
	return Controller.extend("view.Main", {
		onInit : function(oEvent){
			//initialize the yahooFinanceAPI component
			var oYahooFinanceAPI = sap.ui.component( {name: "yahooFinanceAPI" } )
			this._oStockQuotesAPI = oYahooFinanceAPI.getStockQuotesAPI();
		},

		onDoSomething : function(oEvent) {
			//TODO use promise
			this._oStockQuotesAPI.fetchData();
		}
	});
});