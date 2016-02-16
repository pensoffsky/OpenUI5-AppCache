# OpenUI5-AppCache

This project demonstrates how to develop an offline capable [OpenUI5](http://openui5.org/) application using the [AppCache API](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache).

You can try it out in current Chrome, Opera or Android browsers: 
https://pensoffsky.github.io/OpenUI5-AppCache/index.html

# Features
The app is able to run offline on all current browsers. It implements a very basic stock application.

# Concepts in use
- AppCache for UI5 & App resources
    - the manifest.appcache file defines which resources shall be stored in the browser for offline usage
- Component based design
    - the code related to fetching the stock quotes from yahoo is encapsulated into a component
- QUnit tests for component and controller
    - the coding of the financeAPI component and the ui5StocksApp is tested with unit tests
- LocalStorage to persist data
    - stock symbols and fetched data from yahoo finance api are stored in local storage for offline usage
- Model View Controller + light weight ViewModel
- Injecting dependencies into controller for better testability
    - stockquotes api and the storage object are injected into the MainController so that in the unit tests a mock implementation can be used