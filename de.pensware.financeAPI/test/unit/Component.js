//https://sapui5.netweaver.ondemand.com/docs/guide/708002929ea548fd9433954a9275eb5f.html
//https://api.qunitjs.com/category/assert/
//http://sinonjs.org/docs/

sap.ui.require(
	[
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function () {
		"use strict";
		
		QUnit.module("component", {
			setup: function () {
				
			},
			teardown: function () {
				
			}
		});
		
		QUnit.test("Instantiation", function (assert) {
			var ofinanceAPI = sap.ui.component( {name: "de.pensware.financeAPI" } )
			
			// Assert
			assert.ok(ofinanceAPI, "component initialized");
			assert.ok(ofinanceAPI.getStockQuotesAPI(), "stockQuotesAPI initialized");
		});
	}
);