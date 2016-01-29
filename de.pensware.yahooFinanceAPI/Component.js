sap.ui.core.Component.extend("de.pensware.yahooFinanceAPI.Component", {
   metadata : {
        stereotype : "component",
        "abstract": false,
        version : "1.0",
        includes : [], 
        dependencies : {
            libs : [],
            components : [],
            ui5version : ""
                },
                properties: {
                    config : "any"
            },
        library: "sap.ui.core"
        // config: {
        //                 "sap.samples.config1": {
        //                      "Key1-1": "Value1-1",
        //                      "Key1-2": "value1-2"
        //                 },            
        //                "sap.samples.config2": {
        //                     "Key3-1": "Value3-1",
        //                     "Key3-2": "Value3-2"
        //               }
        //         }
    },
    
    init: function(){
        console.log("component de.pensware.yahooFinanceAPI initialized");
    },
    
    getStockQuotesAPI : function() {
        jQuery.sap.require("de.pensware.yahooFinanceAPI.js.stockQuotesAPI");
        var oStockQuotesAPI = new js.stockQuotesAPI();
        return oStockQuotesAPI;
    },
});