sap.ui.define(["sap/ui/core/mvc/Controller",
				"jquery.sap.global", 
				"jQuery.sap.storage"],
	function(Controller, jQuery, jQueryStorage) {
	"use strict";
	
	return Controller.extend("view.Main", {
		onInit : function(oEvent){
			this._localUIModel = new sap.ui.model.json.JSONModel();
			this._localUIModel.setData({
				symbols: [{symbol: "test", price: "489"}, {symbol: "MSFT", price: ""}],
				newSymbol: ""
			});
			this._restoreSymbols(this._getStorage(), this._localUIModel);
			
			this.getView().setModel(this._localUIModel, "localUIModel");
			
			//initialize the yahooFinanceAPI component
			var oYahooFinanceAPI = sap.ui.component( {name: "yahooFinanceAPI" } )
			this._oStockQuotesAPI = oYahooFinanceAPI.getStockQuotesAPI();
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
			this._oStockQuotesAPI.fetchData(aSymbols, function onSuccess(oQueryRes) {
				console.log(oQueryRes);
				
				//TODO handle single result
				for (var i = 0; i < oQueryRes.query.results.quote.length; i++) {
					var sPrice = oQueryRes.query.results.quote[i].LastTradePriceOnly;
					var sCurrency = oQueryRes.query.results.quote[i].Currency;
					var sSymbol = oQueryRes.query.results.quote[i].Symbol;
					var sLastTradeDate = oQueryRes.query.results.quote[i].LastTradeDate;
					var sLastTradeTime = oQueryRes.query.results.quote[i].LastTradeTime;
					var sName = oQueryRes.query.results.quote[i].Name;
					
					for (var j = 0; j < aSymbolObjects.length; j++) {
						if(aSymbolObjects[j].symbol === sSymbol){
							aSymbolObjects[j].price = sPrice;
							aSymbolObjects[j].currency = sCurrency;
							aSymbolObjects[j].name = sName;
							aSymbolObjects[j].lastTradeDateTime = sLastTradeDate + " " + sLastTradeTime;
						}
					}
				}
				
				that._localUIModel.updateBindings(true);
				that._saveSymbols(that._getStorage(), 
					that._localUIModel.getProperty("/symbols"));
			});
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