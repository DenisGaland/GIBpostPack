sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, oDataModel, BusyIndicator, MessageBox, MessageToast, ResourceModel) {
	"use strict";

	return Controller.extend("GIBpostPack.controller.View1", {

		onInit: function() {
			var oView = this.getView();
			var i18nModel = new ResourceModel({
				bundleName: "GIBpostPack.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("trnr").focus();
			});
		},

		trnrsearch: function(evt) {
			var oView = this.getView();
			if (evt.getSource().getValue() !== '') {
				var config = this.getOwnerComponent().getManifest();
				var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
				var oData = new oDataModel(sServiceUrl, true);
				var query = "/StoreReceiptSet(Zinhalt='" + evt.getSource().getValue() + "',Action='3')";
				var trnr = evt.getSource().getValue();
				BusyIndicator.show();
				oData.read(query, null, null, true, function(response) {
						BusyIndicator.hide();
						if (response.Message === 'OK'|| response.Action === 'b') {
							oView.byId("trnr").setEnabled(false);
							oView.byId("page").bindElement({
								path: "/StoreReceiptSet(Zinhalt='" + trnr + "',Action='3')",
								model: "ECOMBPOST"
							});
							oView.byId("formButton").setVisible(true);
							if (response.Action === 'b') {
								MessageBox.information(response.Message, {
									title: "Information",
									my: "center top",
									at: "center top",
									onClose: function() {
										jQuery.sap.delayedCall(500, this, function() {
											oView.byId("trnr").focus();
										});
									}
								});
							}
						} else {
							oView.byId("trnr").setValue("");
							var path = $.sap.getModulePath("GRBpostPack", "/audio");
							var aud = new Audio(path + "/MOREINFO.png");
							aud.play();
							MessageBox.error(response.Message, {
								title: "Error",
								my: "center top",
								at: "center top",
								onClose: function() {
									jQuery.sap.delayedCall(500, this, function() {
										oView.byId("trnr").focus();
									});
								}
							});
						}
					},
					function(error) {
						BusyIndicator.hide();
						var path = $.sap.getModulePath("GRBpostPack", "/audio");
						var aud = new Audio(path + "/MOREINFO.png");
						aud.play();
						MessageBox.error(JSON.parse(error.response.body).error.message.value, {
							title: "Error"
						});
					});
			}
		},

		clear: function() {
			var oView = this.getView();
			oView.byId("trnr").setValue("");
			oView.byId("trnr").setEnabled(true);
			oView.byId("formButton").setVisible(false);
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("trnr").focus();
			});
			oView.byId("page").bindElement({
				path: "/StoreReceiptSet(Zinhalt='0000000001',Action='3')",
				model: "ECOMBPOST"
			});
		},

		save: function() {
			var oController = this;
			var oView = this.getView();
			var msg = oView.getModel("i18n").getResourceBundle().getText("ConfirmSave");
			MessageBox.confirm(msg, {
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/StoreReceiptSet(Zinhalt='" + oView.byId("trnr").getValue() + "',Action='4')";
						BusyIndicator.show();
						oData.read(query, null, null, true, function(response) {
								BusyIndicator.hide();
								if (response.Message === 'OK') {
									msg = oView.getModel("i18n").getResourceBundle().getText("OrderFinalized");
									MessageToast.show(msg, {
										my: "center top",
										at: "center top"
									});
									jQuery.sap.delayedCall(500, this, function() {
										oView.byId("trnr").focus();
									});
								} else {
									var path = $.sap.getModulePath("GRBpostPack", "/audio");
									var aud = new Audio(path + "/MOREINFO.png");
									aud.play();
									MessageBox.error(response.Message, {
										title: "Error",
										onClose: function() {
											jQuery.sap.delayedCall(500, this, function() {
												oView.byId("trnr").focus();
											});
										}
									});
								}
								oView.byId("trnr").setValue("");
								oView.byId("trnr").setEnabled(true);
								oView.byId("page").bindElement({
									path: "/StoreReceiptSet(Zinhalt='0000000001',Action='3')",
									model: "ECOMBPOST"
								});
								oView.byId("formButton").setVisible(false);
							},
							function(error) {
								BusyIndicator.hide();
								var path = $.sap.getModulePath("GRBpostPack", "/audio");
								var aud = new Audio(path + "/MOREINFO.png");
								aud.play();
								MessageBox.error(JSON.parse(error.response.body).error.message.value, {
									title: "Error"
								});
							});
					}
				}
			});
		}

	});
});