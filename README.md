# OpenUI5-AppCache

This project demonstrates how to develop an offline enabled [OpenUI5](http://openui5.org/) stock application using the [AppCache API](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache) and [LocalStorage](https://developer.mozilla.org/de/docs/Web/API/Window/localStorage).

You can try it out here: 
https://pensoffsky.github.io/OpenUI5-AppCache/index.html

# Features
The app is able to run offline on all current browsers. It implements a very basic stock application. The last fetched data is persisted in the browser and even in airplane mode the app is reachable and will display the last fetched stock quotes.

# Concepts
## AppCache for UI5 & app resources
The [manifest.appcache](https://github.com/pensoffsky/OpenUI5-AppCache/blob/gh-pages/manifest.appcache) file defines which resources shall be stored in the browser for offline usage.
    
```
    CACHE MANIFEST
    resources/sap-ui-core.js
    resources/sap/m/library-preload.json
    resources/sap/ui/core/library-preload.json
    resources/sap/ui/thirdparty/jquery-mobile-custom.js
    resources/sap/ui/core/themes/sap_bluecrystal/library.css
    resources/sap/m/themes/sap_bluecrystal/library.css
    resources/sap/ui/core/messagebundle_en.properties
    resources/sap/m/messagebundle_en.properties
    resources/jquery.sap.storage.js
    resources/sap/ui/core/themes/base/fonts/SAP-icons.ttf  
    resources/sap/ui/core/themes/sap_bluecrystal/library-parameters.json
    resources/sap/m/themes/sap_bluecrystal/library-parameters.json

    resources/sap/ui/thirdparty/unorm.js
    resources/sap/ui/thirdparty/unormdata.js
    resources/sap/ui/core/themes/base/fonts/SAP-icons.eot


    de.pensware.ui5StocksApp/Component.js
    de.pensware.ui5StocksApp/manifest.json
    de.pensware.ui5StocksApp/view/Main.view.xml
    de.pensware.ui5StocksApp/view/Main.controller.js

    de.pensware.financeAPI/Component.js
    de.pensware.financeAPI/js/stockQuotesAPI.js

    NETWORK:
    *
```

Everything below CACHE MANIFEST defines all the OpenUI5 and app resources needed to run the app. All these files are fetched on the first start of the app and are then available for offline usage. **NETWORK: *** means that every network request not specified in CACHE MANIFEST will be sent directly to the network. 


## Component based design
The code related to fetching the stock quotes from yahoo is encapsulated into a [faceless component](http://help.sap.com/saphelp_nw74/helpdata/en/95/8ead51e2e94ab8bcdc90fb7e9d53d0/content.htm).
This [financeAPI component](https://github.com/pensoffsky/OpenUI5-AppCache/tree/gh-pages/de.pensware.financeAPI) is loaded with the following code:
```
var ofinanceAPI = sap.ui.component( {name: "de.pensware.financeAPI" } )
var oStockQuotesAPI = ofinanceAPI.getStockQuotesAPI();
```

## LocalStorage to persist data
Stock symbols and fetched data from yahoo finance api are stored in local storage for offline usage.

##Model View Controller + light weight ViewModel
The Main.view.xml is XML format. The Main.controller.js instantiates a JSONModel and sets it with the name "localUIModel" to the view. 
```
_createAndSetLocalUIModel : function () {
	this._localUIModel = new sap.ui.model.json.JSONModel();
	this._localUIModel.setData({
		symbols: [{symbol: "test", price: "489"}, {symbol: "MSFT", price: ""}],
		newSymbol: "",
		aMessages: [],
		listMode: sap.m.ListMode.None
	});
	this.getView().setModel(this._localUIModel, "localUIModel");
}
```

Every input the user makes or data the app wants to display is written into this model. This way the Main.controller.js makes no assumptions on how the data is displayed and the Main.view.xml can be changed without having to change javascript code.

This also makes the controller testable. An event handler like onToggleListMode is only modifying the "localUIModel" and that can be tested very easily.
```
onToggleListMode : function () {
	var sCurrentMode = this._localUIModel.getProperty("/listMode");
	if (sCurrentMode === sap.m.ListMode.None) {
		this._localUIModel.setProperty("/listMode", sap.m.ListMode.Delete);
	} else {
		this._localUIModel.setProperty("/listMode", sap.m.ListMode.None);
	}
}
```

The test:
```
QUnit.test("onToggleListMode function", function (assert) {
	var oLocalUIModelData = this._oCntrllr._localUIModel.getData();
	//initial mode is sap.m.ListMode.None
	assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.None);
	
	this._oCntrllr.onToggleListMode();
	assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.Delete);
	
	this._oCntrllr.onToggleListMode();
	assert.equal(oLocalUIModelData.listMode, sap.m.ListMode.None);
});
```

## Injecting dependencies into controller for better testability
The stockquotes API object and the storage object are injected into the Main.controller.
This way the Main.controller can be instantiated with a mock version of the stockquotes API object for easy [unit testing](https://github.com/pensoffsky/OpenUI5-AppCache/blob/gh-pages/de.pensware.ui5StocksApp%2Ftest%2Funit%2Fview%2FMainController.js).
```
var oStockQuotesAPI = {
	fetchData: function () {
		return {
			fail: function () {}
		}
	}
};
var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
this._oCntrllr = new de.pensware.ui5StocksApp.view.Main(oStockQuotesAPI, oStorage);
```
