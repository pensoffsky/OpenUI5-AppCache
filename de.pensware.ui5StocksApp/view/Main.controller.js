sap.ui.define(["sap/ui/core/mvc/Controller",
				"sap/m/MessageToast",
				"jquery.sap.global", 
				"jquery.sap.storage",
				"sap/m/List"
			  ],
	function(Controller, MessageToast, jQuery, jQueryStorage) {
	"use strict";
	
	return Controller.extend("de.pensware.ui5StocksApp.view.Main", {
		
		// /////////////////////////////////////////////////////////////////////////////
		// /// Initialization
		// /////////////////////////////////////////////////////////////////////////////
		
		constructor : function (oStockQuotesAPI, oStorage) {
			//depenency injection
			//not doing any work in the constructor
			this._oStockQuotesAPI = oStockQuotesAPI;
			this._oStorage = oStorage;
		},
		
		//TODO define the object that makes a symbol somehow
		
		/**
		 * create and set the local jsonmodel and restore the symbols from
		 * local storage.
		 */
		onInit : function(){
			this._createAndSetLocalUIModel();
			this._restoreSymbols(this._oStorage, this._localUIModel);
		},
		
		/**
		 * trigger an initial refresh of the stock data.
		 */
		onAfterRendering : function(){
			this._refreshStock(this._oStockQuotesAPI);
		},
		
		// /////////////////////////////////////////////////////////////////////////////
		// /// Private Methods
		// /////////////////////////////////////////////////////////////////////////////
		
		/**
		 * create the local json model and set it to the view
		 */
		_createAndSetLocalUIModel : function () {
			this._localUIModel = new sap.ui.model.json.JSONModel();
			this._localUIModel.setData({
				symbols: [{symbol: "test", price: "489"}, {symbol: "MSFT", price: ""}],
				newSymbol: "",
				aMessages: [],
				listMode: sap.m.ListMode.None
			});
			this.getView().setModel(this._localUIModel, "localUIModel");
		},
		
		_saveSymbols : function(oStorage, aSymbols) {
			oStorage.put("aSymbols", aSymbols);
		},
		
		_restoreSymbols : function(oStorage, oLocalUIModel) {
			var aSymbols = oStorage.get("aSymbols");
			if (!aSymbols) {
				aSymbols = [{symbol: "SAP"}];
			}
			oLocalUIModel.setProperty("/symbols", aSymbols);
		},
		
		_refreshStock : function (oFinanceAPI) {
			var that = this;
			var aSymbols = [];
			var aSymbolObjects = this._localUIModel.getProperty("/symbols");
			for (var i = 0; i < aSymbolObjects.length; i++) {
				aSymbols.push(aSymbolObjects[i].symbol);
			}
			var jqxhr = oFinanceAPI.fetchData(aSymbols, function onSuccess(oQueryRes) {
				console.log(oQueryRes);
				that._showSuccessMessage("stock data fetched");
				that.getView().byId("idPullToRefresh").hide();
				that._clearMessage();
				
				var aQueryRes = that._oStockQuotesAPI.queryResToArray(oQueryRes);
				for (var i = 0; i < aQueryRes.length; i++) {
					that._fillQuote(aQueryRes[i], aSymbolObjects);
				}
				
				that._localUIModel.updateBindings(true);
				that._saveSymbols(that._oStorage, 
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
		
		_showSuccessMessage : function(sMessage) {
			MessageToast.show(sMessage, {
				duration: 1000
			});
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

		_addNewSymbol : function (sNewSymbol, aSymbols) {
			aSymbols.push({symbol: sNewSymbol, price: ""});
			this._localUIModel.setProperty("/symbols", aSymbols);
			this._localUIModel.setProperty("/newSymbol", "");
		},

		_deleteSymbol : function () {
			
		},

		// /////////////////////////////////////////////////////////////////////////////
		// /// Event Handler
		// /////////////////////////////////////////////////////////////////////////////

		onToggleListMode : function () {
			var sCurrentMode = this._localUIModel.getProperty("/listMode");
			if (sCurrentMode === sap.m.ListMode.None) {
				this._localUIModel.setProperty("/listMode", sap.m.ListMode.Delete);
			} else {
				this._localUIModel.setProperty("/listMode", sap.m.ListMode.None);
			}
		},

		onTriggerRefresh : function() {
			this._refreshStock(this._oStockQuotesAPI);
		},
		
		onAddSymbol : function() {
			var sNewSymbol = this._localUIModel.getProperty("/newSymbol");
			var aSymbols = this._localUIModel.getProperty("/symbols");
			
			this._addNewSymbol(sNewSymbol, aSymbols);
			this._saveSymbols(this._oStorage, aSymbols);
			this._refreshStock(this._oStockQuotesAPI);
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
			
			this._saveSymbols(this._oStorage, 
				this._localUIModel.getProperty("/symbols"));
		}
	});
});