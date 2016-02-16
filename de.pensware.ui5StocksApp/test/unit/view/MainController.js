sap.ui.require(
	[
		"ui5StocksApp/view/Main.controller",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function () {
		"use strict";
		
		QUnit.module("Main.controller.js", {
			
			/**
			 * setup for the tests.
			 * create the mainController instance. stub the getView and setModel
			 * functions and initialze the controller.
			 */
			setup: function () {
				var oStockQuotesAPI = {
					fetchData: function () {
						return {
							fail: function () {}
						}
					}
				};
			
				var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
				
				this._oCntrllr = new de.pensware.ui5StocksApp.view.Main(oStockQuotesAPI, oStorage);
				sinon.stub(this._oCntrllr, "getView").returns({
					setModel : function () {
						
					}
				});
				this._oCntrllr.onInit();
			},
			
			teardown: function () {
				this._oCntrllr = null;
			}
			
		});
		
		QUnit.test("Instantiation", function (assert) {
			assert.ok(this._oCntrllr, "initialized");
			var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
			assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.None);
		});

		QUnit.test("save and restore symbols", function (assert) {
			//clear the initial symbols
			var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
			oLocalUIModelData.symbols = [];				
			
			//save and restore testsymbols
			var aSymbols = [
				{symbol: "testSymbol1", price: "123"},
				{symbol: "testSymbol2", price: "456"}
			];
			this._oCntrllr._saveSymbols(this._oCntrllr._oStorage, aSymbols);
			this._oCntrllr._restoreSymbols(this._oCntrllr._oStorage, this._oCntrllr._localUIModel);
			
			//check if restore was successful				
			assert.deepEqual(oLocalUIModelData.symbols, aSymbols);
		});
				
		QUnit.test("offline message", function (assert) {
			//clear the initial message, if there is one
			var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
			oLocalUIModelData.aMessages = [];
			
			var sMessage = "my test message";
			var sMessage2 = "my test message";
			this._oCntrllr._addMessage(sMessage);
			assert.deepEqual(oLocalUIModelData.aMessages, [{text: sMessage}]);
			
			//make sure that a second addMessage will result in only 1 message in the arrray
			this._oCntrllr._addMessage(sMessage2);
			assert.deepEqual(oLocalUIModelData.aMessages, [{text: sMessage2}]);
		});
				
		QUnit.test("fillQuote function", function (assert) {
				this._oCntrllr._fillQuote();
		});
		
		QUnit.test("onToggleListMode function", function (assert) {
			var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
			//initial mode is sap.m.ListMode.None
			assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.None);
			
			this._oCntrllr.onToggleListMode();
			assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.Delete);
			
			this._oCntrllr.onToggleListMode();
			assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.None);
		});
		
		QUnit.test("onTriggerRefresh function", function (assert) {
			this._oCntrllr.onTriggerRefresh();
		});
		
		QUnit.test("_addNewSymbol function", function (assert) {			
			this._oCntrllr._addNewSymbol();
		});
		
		QUnit.test("onAddSymbol function", function (assert) {
			var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
			oLocalUIModelData.symbols = [];
			oLocalUIModelData.newSymbol = "newSymbol1";
			
			this._oCntrllr.onAddSymbol();
			assert.deepEqual(oLocalUIModelData.symbols, [{symbol: "newSymbol1", price: ""}]);
			assert.equal(oLocalUIModelData.newSymbol, "");
		});
		
		QUnit.test("onDeleteSymbol function", function (assert) {
				this._oCntrllr.onDeleteSymbol();
		});
		
	}
);