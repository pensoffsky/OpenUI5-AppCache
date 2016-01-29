sap.ui.define(["sap/ui/core/mvc/Controller",
				"jquery.sap.global", 
				"jquery.sap.storage"],
	function(Controller, jQuery, jQueryStorage) {
	"use strict";
	
	return Controller.extend("de.pensware.ui5StocksApp.view.Main", {
		onInit : function(oEvent){
			this._localUIModel = new sap.ui.model.json.JSONModel();
			this._localUIModel.setData({
				symbols: [{symbol: "test", price: "489"}, {symbol: "MSFT", price: ""}],
				newSymbol: "",
				aMessages: []
			});
			this._restoreSymbols(this._getStorage(), this._localUIModel);
			
			this.getView().setModel(this._localUIModel, "localUIModel");
			
			//initialize the financeAPI component
			var ofinanceAPI = sap.ui.component( {name: "de.pensware.financeAPI" } )
			this._oStockQuotesAPI = ofinanceAPI.getStockQuotesAPI();
		},
		
		_getStorage : function () {
			return jQuery.sap.storage(jQuery.sap.storage.Type.local);
		},
		
		_saveSymbols : function(oStorage, aSymbols) {
			oStorage.put("aSymbols", aSymbols);
		},
		
		_restoreSymbols : function(oStorage, oLocalUIModel) {
			var aSymbols = oStorage.get("aSymbols");
			if(!aSymbols) {
				aSymbols = [];
			}
			oLocalUIModel.setProperty("/symbols", aSymbols);
		},
		
		_refreshStock : function () {
			var that = this;
			var aSymbols = [];
			var aSymbolObjects = this._localUIModel.getProperty("/symbols");
			for (var i = 0; i < aSymbolObjects.length; i++) {
				aSymbols.push(aSymbolObjects[i].symbol);
			}
			var jqxhr = this._oStockQuotesAPI.fetchData(aSymbols, function onSuccess(oQueryRes) {
				console.log(oQueryRes);
				that.getView().byId("idPullToRefresh").hide();
				that._clearMessage();
				
				var aQueryRes = that._oStockQuotesAPI.queryResToArray(oQueryRes);
				for (var i = 0; i < aQueryRes.length; i++) {
					that._fillQuote(aQueryRes[i], aSymbolObjects);
				}
				
				that._localUIModel.updateBindings(true);
				that._saveSymbols(that._getStorage(), 
					that._localUIModel.getProperty("/symbols"));
			});
			
			jqxhr.fail(function() {
				that.getView().byId("idPullToRefresh").hide();
				that._addMessage("Error: Stock data could not be fetched. Are you offline?");
			});
		},
		
		_addMessage : function(sText){
			var aMessages = [];
			this._localUIModel.setProperty("/aMessages", aMessages);
			aMessages.push({text: sText});
			this._localUIModel.setProperty("/aMessages", aMessages);
		},
		
		_clearMessage : function(){
			var aMessages = [];
			this._localUIModel.setProperty("/aMessages", aMessages);
		},

		_fillQuote : function(oQuote, aSymbols) {
			var sPrice = oQuote.LastTradePriceOnly;
			var sCurrency = oQuote.Currency;
			var sSymbol = oQuote.Symbol;
			var sLastTradeDate = oQuote.LastTradeDate;
			var sLastTradeTime = oQuote.LastTradeTime;
			var sName = oQuote.Name;
			
			for (var j = 0; j < aSymbols.length; j++) {
				if (aSymbols[j].symbol === sSymbol){
					aSymbols[j].price = sPrice;
					aSymbols[j].currency = sCurrency;
					aSymbols[j].name = sName;
					aSymbols[j].lastTradeDateTime = sLastTradeDate + " " + sLastTradeTime;
				}
			}
		},

		onMessageStripClosed : function() {
			
		},

		onTriggerRefresh : function(oEvent) {
			this._refreshStock();
		},
		
		onAddSymbol : function(oEvent) {
			//TODO check for empty name
			var sNewSymbol = this._localUIModel.getProperty("/newSymbol");
			var aSymbols = this._localUIModel.getProperty("/symbols");
			aSymbols.push({symbol: sNewSymbol, price: ""});
			this._localUIModel.setProperty("/symbols", aSymbols);
			
			this._saveSymbols(this._getStorage(), 
				this._localUIModel.getProperty("/symbols"));
				
			this._localUIModel.setProperty("/newSymbol", "");
				
			this._refreshStock();
		},
		
		onDeleteSymbol : function (oEvent) {
			var	oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				oSymbol = oItem.getBindingContext("localUIModel").getObject();
				
			// // after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
			
			var aSymbols = this._localUIModel.getProperty("/symbols");
			var iIndex = aSymbols.indexOf(oSymbol);
			if (iIndex > -1) {
			    aSymbols.splice(iIndex, 1);
			}
			this._localUIModel.setProperty("/symbols", aSymbols);
			
			this._saveSymbols(this._getStorage(), 
				this._localUIModel.getProperty("/symbols"));
		}
	});
});