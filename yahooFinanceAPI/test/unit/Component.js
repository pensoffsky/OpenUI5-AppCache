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
			var oYahooFinanceAPI = sap.ui.component( {name: "yahooFinanceAPI" } )
			
			// Assert
			assert.ok(oYahooFinanceAPI, "component initialized");
			assert.ok(oYahooFinanceAPI.getStockQuotesAPI(), "stockQuotesAPI initialized");
		});
	}
);