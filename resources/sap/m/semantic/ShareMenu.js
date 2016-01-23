/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Metadata','sap/m/Button','sap/m/OverflowToolbarLayoutData','sap/ui/core/IconPool'],function(q,M,B,O,I){"use strict";var S=M.createClass("sap.m.semantic.ShareMenu",{constructor:function(a){if(!a){q.sap.log.error("missing argumment: constructor expects an actionsheet reference",this);return;}this._oActionSheet=a;this._setMode(S._Mode.initial);}});S._Mode={initial:"initial",button:"button",actionSheet:"actionSheet"};S.prototype.getBaseButton=function(){return this._oBaseButton;};S.prototype.getAggregation=function(n){if(n==="content"){return this.getContent();}};S.prototype.addAggregation=function(n,b,s){if(n==="content"){return this.addContent(b,s);}};S.prototype.insertAggregation=function(n,b,i,s){if(n==="content"){return this.insertContent(b,i,s);}};S.prototype.indexOfAggregation=function(n,b){if(n==="content"){return this.indexOfContent(b);}};S.prototype.removeAggregation=function(n,b,s){if(n==="content"){return this.removeContent(b,s);}};S.prototype.removeAllAggregation=function(n,s){if(n==="content"){return this.removeAllContent(s);}};S.prototype.getContent=function(){if(this._getMode()===S._Mode.initial){return[];}else if(this._getMode()===S._Mode.button){return[this._oBaseButton];}else{return this._oActionSheet.getAggregation("buttons");}};S.prototype.addContent=function(b,s){if(this._getMode()===S._Mode.initial){this._setMode(S._Mode.button,s,b);return this;}if(this._getMode()===S._Mode.button){this._setMode(S._Mode.actionSheet,s);}this._oActionSheet.addButton(b,s);return this;};S.prototype.insertContent=function(b,i,s){if(this._getMode()===S._Mode.initial){this._setMode(S._Mode.button,s,b);return this;}if(this._getMode()===S._Mode.button){this._setMode(S._Mode.actionSheet,s);}this._oActionSheet.insertButton(b,i,s);return this;};S.prototype.indexOfContent=function(b){if((this._getMode()===S._Mode.button)&&(b===this._oBaseButton)){return 0;}if(this._getMode()===S._Mode.actionSheet){return this._oActionSheet.indexOfAggregation("buttons",b);}return-1;};S.prototype.removeContent=function(b,s){var r;if(this._getMode()===S._Mode.actionSheet){r=this._oActionSheet.removeButton(b,s);if(r){if(this._oActionSheet.getAggregation("buttons").length===1){this._setMode(S._Mode.button,s);}}return r;}if(this._getMode()===S._Mode.button){var l=this._oBaseButton;this._setMode(S._Mode.initial,s);return l;}return r;};S.prototype.removeAllContent=function(s){var r;if(this._getMode()===S._Mode.actionSheet){r=this._oActionSheet.removeAllButtons(s);}else if(this._getMode()===S._Mode.button){r=[this._oBaseButton];}this._setMode(S._Mode.initial,s);return r;};S.prototype.destroy=function(s){this._oActionSheet.destroy(s);if(this._oShareMenuBtn){this._oShareMenuBtn.destroy(s);this._oShareMenuBtn=null;}};S.prototype._setBaseButton=function(b,s){if(this._oBaseButton===b){return this;}var o=this._oBaseButton;this._oBaseButton=b;if(o){var p=o.getParent(),P=o.sParentAggregationName;if(p){p.removeAggregation(P,o,s);p.addAggregation(P,this._oBaseButton,s);}}return this;};S.prototype._getMode=function(){return this._mode;};S.prototype._setMode=function(m,s,b){if(!S._Mode[m]){q.sap.log.error("unknown shareMenu mode "+m,this);return this;}if(this._mode===m){return this;}if(S._Mode.initial===m){this._setBaseButton(this._getShareMenuButton().applySettings({visible:false}));this._mode=S._Mode.initial;return this;}if(m===S._Mode.button){if(this._mode===S._Mode.initial){this._setBaseButton(b);}else if(this._mode===S._Mode.actionSheet){var l=this._oActionSheet.getAggregation("buttons")[0];this._oActionSheet.removeButton(l,s);this._setBaseButton(l);}this._mode=S._Mode.button;return this;}if(m===S._Mode.actionSheet){var o=this._oBaseButton;this._setBaseButton(this._getShareMenuButton().applySettings({visible:true}));if(o){this._oActionSheet.addButton(o,s);}this._mode=S._Mode.actionSheet;}return this;};S.prototype._getShareMenuButton=function(){if(!this._oShareMenuBtn){var t=this;this._oShareMenuBtn=new sap.m.Button(this._oActionSheet.getParent().getId()+"-shareButton",{icon:I.getIconURI("action"),tooltip:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SEMANTIC_CONTROL_ACTION_SHARE"),layoutData:new O({moveToOverflow:false,stayInOverflow:false}),press:function(){t._oActionSheet.openBy(t._oShareMenuBtn);}});this._oShareMenuBtn.addEventDelegate({onAfterRendering:function(){t._oShareMenuBtn.$().attr("aria-haspopup",true);}});}return this._oShareMenuBtn;};return S;},false);
