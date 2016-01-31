sap.ui.require(
	[
		"ui5StocksApp/view/Main.controller",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (stockQuotesAPI) {
		"use strict";
		
		QUnit.module("Main.controller.js", {
			setup: function () {
				
			},
			teardown: function () {
				
			}
		});
		
		QUnit.test("Instantiation", function (assert) {
		    var oMainController = new de.pensware.ui5StocksApp.view.Main();
            assert.ok(oMainController, "initialized");
		});
	}
);