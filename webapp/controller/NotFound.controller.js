sap.ui.define([
		"jblesson03/WorklistLesson3/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("jblesson03.WorklistLesson3.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);