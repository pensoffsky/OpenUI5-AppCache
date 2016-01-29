sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";
	
	return BaseObject.extend("js.stockQuotesAPI", {
		
		_sQueryBaseUrl : "https://query.yahooapis.com/v1/public/yql",
		
		fetchData : function(aSymbols, fSuccess) {
			// var aSymbols = ["YHOO","AAPL","GOOG","MSFT"];
			var sSymbols = '"' + aSymbols.join('","') + '"';
			var data = encodeURIComponent('select * from yahoo.finance.quotes where symbol in (' + sSymbols + ')');
			jQuery.getJSON(this._sQueryBaseUrl, 'q=' + data + "&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json", fSuccess);
		},
		
		queryResToArray : function (oQueryRes) {
			var aRes = [];
			if (oQueryRes.query.count === 1) {
				aRes.push(oQueryRes.query.results.quote);
			} else {
				aRes = oQueryRes.query.results.quote;
			}
			return aRes;
		}
		
	});
});