/*global location history */
sap.ui.define([
		"jblesson03/WorklistLesson3/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"jblesson03/WorklistLesson3/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/Dialog"
	], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, Dialog) {
		"use strict";

		return BaseController.extend("jblesson03.WorklistLesson3.controller.Worklist", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._aTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
				// Add the worklist page to the flp routing history
				this.addHistoryEntry({
					title: this.getResourceBundle().getText("worklistViewTitle"),
					icon: "sap-icon://table-view",
					intent: "#Worklist-display"
				}, true);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},


			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("worklistView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			},
			
			onButtonCreate : function () {
				var that = this;
				var oDialog = new Dialog({
					type: "Message",
					title: "Create",
					content: [
						new sap.m.Label({
							LabelFor: "MaterialText",
							text: "Enter MaterialText"
						}),
						new sap.m.Input("MaterialText", {
							placeholder: "Enter here",
							maxLength: 20,
							width: "100%",
							liveChange: function(oEvent){
								var sText = oEvent.getParameter('value');
								var parent = oEvent.getSource().getParent();
								parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
							}
						}),
						new sap.m.Label({
							LabelFor: "GroupID",
							text: "Enter GroupID"
						}),
						new sap.m.Input("GroupID", {
							placeholder: "Enter here",
							maxLength: 2,
							width: "100%",
							liveChange: function(oEvent){
								var sText = oEvent.getParameter('value');
								var parent = oEvent.getSource().getParent();
								parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
							}
						}),
						new sap.m.Label({
							LabelFor: "SubGroupID",
							text: "Enter SubGroupID"
						}),
						new sap.m.Input("SubGroupID", {
							placeholder: "Enter here",
							maxLength: 2,
							width: "100%",
							liveChange: function(oEvent){
								var sText = oEvent.getParameter('value');
								var parent = oEvent.getSource().getParent();
								parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
							}
						})
					],
					beginButton: new sap.m.Button({
						text: "Create",
						type: "Emphasized",
						enabled: false,
						press: function(){
							oDialog.close();
							var oText = {
								MaterialID: '',
								MaterialText: oDialog.getContent()[1].getValue(),
								Language: 'RU',
								GroupID: oDialog.getContent()[3].getValue(),
								SubGroupID: oDialog.getContent()[5].getValue(),
								Version: "A"
							};
							that.getModel().create("/zjblessons_base_Materials", oText, {
								success: function(e){
									sap.m.MessageToast.show("Item is created!");
								},
								error: function(e){
									sap.m.MessageToast.show("Error!");
								}
							});
						}
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						type: "Emphasized",
						press: function(){
							oDialog.close();
						}
					}),
					afterClose: function(){
						oDialog.destroy();
					}
				});
				oDialog.open();
			},
			
			onButtonUpdate : function(oEvent) {
				if (this.getView().byId("table").getSelectedItems().length === 0){
					sap.m.MessageToast.show("Select some item");	
				} else {
					var that = this;
					var oItem = this.getView().byId("table").getSelectedItems()[0].getBindingContext().getPath();
					var oDialog = new Dialog({
						title: "Update",
						type: "Message",
						content: [
							new sap.m.Label({
								text: "Enter new MaterialText",
								labelFor: "updateMaterialText"
							}),
							new sap.m.Input({
								placeholder: "",
								width: "100%",
								maxLenght: 20,
								liveChange: function(){
									var sText = oEvent.getParameter('value');
									var parent = oEvent.getSource().getParent();
									parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
								}
							}),
							new sap.m.Label({
								LabelFor: "GroupID",
								text: "Enter new GroupID"
							}),
							new sap.m.Input("GroupID", {
								placeholder: "",
								maxLength: 2,
								width: "100%",
								liveChange: function(){
									var sText = oEvent.getParameter('value');
									var parent = oEvent.getSource().getParent();
									parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
							}
						}),
							new sap.m.Label({
								LabelFor: "SubGroupID",
								text: "Enter new SubGroupID"
						}),
							new sap.m.Input("SubGroupID", {
								placeholder: "",
								maxLength: 2,
								width: "100%",
								liveChange: function(){
									var sText = oEvent.getParameter('value');
									var parent = oEvent.getSource().getParent();
									parent.getBeginButton().setEnabled(sText.split(" ").join("").length > 0);
							}
						})
						],
						beginButton: new sap.m.Button({
							type: "Emphasized",
							text: "Update",
							enabled: false,
							press: function(){
								that.getModel().update(oItem, {
									MaterialText: oDialog.getContent()[1].getValue(),
									GroupID: oDialog.getContent()[3].getValue(),
									SubGroupID: oDialog.getContent()[5].getValue()
								}, {
									success: function(e){
										sap.m.MessageToast.show("Successfully updated");
									},
									error: function(e){
										sap.m.MessageToast.show("Error!");
									}
								});
								oDialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: "Cancel",
							press: function(){
								oDialog.close();
							}
						}),
						afterClose: function(){
							oDialog.destroy();
						}
					});
				oDialog.open();
				}
			},
			
			onButtonDelete : function(oEvent){
				if(this.getView().byId("table").getSelectedItems().length === 0){
					sap.m.MessageToast.show("Select some item");
				} else {
					var that = this;
					var oItem = this.getView().byId("table").getSelectedItems()[0].getBindingContext().getPath();
					var oDialog = new Dialog({
						title: "Delete",
						type: "Message",
						content: new sap.m.Text({
							text: "Are you sure?"
						}),
						beginButton: new sap.m.Button({
							type: "Emphasized",
							text: "Delete",
							press: function(){
								that.getModel().remove(oItem, {
									success: function(e){
										sap.m.MessageToast.show("Successfully deleted");
									},
									error: function(e){
										sap.m.MessageToast.show("Error!");
									}
								});
								oDialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: "Cancel",
							press: function(){
								oDialog.close();
							}
						}),
						afterClose: function(){
							oDialog.destroy();
						}
					});
				oDialog.open();
				}	
			},            

			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("SubGroupText", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},
			
			onSearch1 : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("MaterialText", FilterOperator.EQ, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
			 * @private
			 */
			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);