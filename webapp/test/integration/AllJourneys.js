/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"jblesson03/WorklistLesson3/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"jblesson03/WorklistLesson3/test/integration/pages/Worklist",
	"jblesson03/WorklistLesson3/test/integration/pages/Object",
	"jblesson03/WorklistLesson3/test/integration/pages/NotFound",
	"jblesson03/WorklistLesson3/test/integration/pages/Browser",
	"jblesson03/WorklistLesson3/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "jblesson03.WorklistLesson3.view."
	});

	sap.ui.require([
		"jblesson03/WorklistLesson3/test/integration/WorklistJourney",
		"jblesson03/WorklistLesson3/test/integration/ObjectJourney",
		"jblesson03/WorklistLesson3/test/integration/NavigationJourney",
		"jblesson03/WorklistLesson3/test/integration/NotFoundJourney",
		"jblesson03/WorklistLesson3/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});