sap.ui.define(["sap/ui/base/Object"], function(BaseObject) {
	"use strict";
	
	return BaseObject.extend("js.stockQuotesAPI", {
		
		fetchData : function(aSymbols, fSuccess) {
			// var aSymbols = ["YHOO","AAPL","GOOG","MSFT"];
			var sSymbols = '"' + aSymbols.join('","') + '"';
			var url = 'https://query.yahooapis.com/v1/public/yql';
			var data = encodeURIComponent('select * from yahoo.finance.quotes where symbol in (' + sSymbols + ')');
			$.getJSON(url, 'q=' + data + "&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json", fSuccess);
		}
		
	});
});