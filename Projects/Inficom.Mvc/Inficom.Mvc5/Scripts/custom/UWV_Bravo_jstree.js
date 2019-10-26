// Author: W. Kerkmeijer
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// The namespace , a.o., prevents polluting the global scope
// The constructor keeps track of the state
// The prototype holds the functions, both private and public, and can be extended
// The prototype reveals the public functions for use outside of the scope
// By using the '[function].call' function when calling other (private or public) functions one is able to pass the scope of the original caller of the function. So now it's safe to use 'this' inside the prototype functions and no special parameter has to be passed around to keep track of 'this'

// Afterwards, this library can be extended by defining a new prototype elsewhere (or overwrite) and then call it on the specific instance (Created with the constructor).

// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoJsTree constructor
uwvBravo.JsTree = function (jQObj, options) {
	this.jqObject = jQObj;
	this.options = options || {}; // options is always an object literal
	// Get/set the defaults:
	this.requesturl = "../WordHtmlConverter/RenderTreeview";
	this.isMainReport = options.isMainReport;
	this.selectedNodeId = options.selectedNodeId || null;
	this.selectedNodeText = options.selectedNodeText || null;
	this.selectedNodeFirstChild = options.selectedNodeFirstChild || null;
	this.pdcProcessId = options.pdcProcessId;
    this.treeState = options.treeState;
	//for now, pass info from view ('though this should be handled internally in this control to prevent runtime error if pdcProcessId is null or undefined (computed props?) )
	this.switchPurposeCheckbox = options.switchPurposeCheckbox || $('#navigationCheck_' + this.pdcProcessId);
	this.switchPurposeLabel = options.switchPurposeLabel || $('#navigationLabel_' + this.pdcProcessId);
	this.switchPurposeReadyButtonId = options.switchPurposeReadyButtonId || ('regenerateDoc_' + this.pdcProcessId); // This is the 'Klaar' button that should kick of the structure changes in the Bravo_Document component
	this.stateChanged = false;

	this.documentElement = $("#D_" + this.pdcProcessId);

	this.postData = {
		pdcProcessId: this.pdcProcessId
	}

	this.linkedDocument = options.linkedDocument || undefined; // in case of a subDocument-treeview (in modal popup) this should contain the parent Document...

	this.jsTreeRequestCompletedEvent = document.createEvent("CustomEvent"); //todo: check if still in use
	this.jsTreeRequestCompletedEvent.initCustomEvent("jsTreeRequestCompletedEvent", true, true, this);

	this.jsTreeChangeState = document.createEvent("CustomEvent");
	this.jsTreeChangeState.initCustomEvent("jsTreeChangeState", true, true, this);
};

// Create prototype
uwvBravo.JsTree.prototype = function () {
	//private members
	var initialize = function () {

        var $treeview = this.jqObject;

		var otpions = {
			"checkbox": {
				"whole_node": false,
				"three_state": false
			},
			"types": {
                "standard": {
                    "icon": false
				},
				"textblock": {
					"icon": "glyphicon glyphicon-text-size"
				},
				'selectable': {
					//'icon': ''
				},
				'default': {
                    "icon": "glyphicon glyphicon-triangle-right"
				}
			},
			'core': {
				'check_callback': true,
				'expand_selected_onload': false,
				'dblclick_toggle': false,
                "animation": 0,
                'themes': {
                    'responsive': true
                }
			},

			"ui": {
				"select_limit": 1
			},

			'plugins': ["checkbox", "types", "html_data", "themes", "ui", "crrm", "changed"]
		};

		$treeview.jstree(otpions).on('ready.jstree', function () {
			$treeview.jstree('open_all');
        });

        bindTreeChangedEvent.call(this);

	};

	var bindTreeChangedEvent = function () {
		this.jqObject.on("changed.jstree", { treeObj: this }, function (event, data) {

			if (data && (data.action === "select_node" || data.action === "deselect_node")) {
				event.data.treeObj.selectedNodeId = (data.node !== null ? data.node.id : null);
				event.data.treeObj.selectedNodeText = (data.node !== null ? data.node.text : null);
				var childNodes = data.node.children;
				event.data.treeObj.selectedNodeFirstChild = (childNodes.length > 0 ? childNodes[0] : null);

                $.extend(event.data.treeObj.postData, { selectedNodeId: event.data.treeObj.selectedNodeId });
				var scrollPosition = event.data.treeObj.jqObject.scrollTop();
                fetchData.call(event.data.treeObj, scrollPosition);

                //set autosave to false
                var parentDocument = event.data.treeObj.linkedDocument;
                if (parentDocument != undefined && parentDocument.MyAutosave != null) {
                    parentDocument.unbindAutosavedEvent();
                }
			}

		});

	};

	var fetchData = function (scrollPosition) {
		var thisTreeObj = this;
		$.ajax({
			url: thisTreeObj.requesturl,
			data: thisTreeObj.postData,
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			type: 'POST',
			cache: 'false',
			dataType: "html",
			beforeSend: function () {
			},
			success: function (newData) {
                thisTreeObj.stateChanged = true;
                thisTreeObj.jqObject.jstree('destroy');
                $.when(thisTreeObj.jqObject.html(newData)).then(function () {
                    $.when(initialize.call(thisTreeObj)).then(function () {
                        if (scrollPosition != undefined) { resizeTreeView(thisTreeObj, scrollPosition) };
                    });
                });
			}
		});

	};

	var resizeTreeView = function (treeObject, scrollPosition) {

		if (treeObject.selectedNodeId) {
			var thisNode = $(treeObject.jqObject.selector).jstree("get_node", treeObject.selectedNodeId);

			// Only open node if checked AND haschildren (and only one level deep)
			if (thisNode.data.jstree.selected === true && treeObject.selectedNodeFirstChild !== null) {
				$(treeObject.jqObject.selector).jstree(true)._open_to(treeObject.selectedNodeFirstChild);
			}
			else {
				$(treeObject.jqObject.selector).jstree(true)._open_to(treeObject.selectedNodeId);
			}

			//$(treeObject.jqObject[0]).scrollTop = scrollPosition;
			$(treeObject.jqObject[0]).animate({
				scrollTop: scrollPosition
			}, 5);

		}
	}

    var loadContent = function () {
        var thisTreeObj = this;
        $.get(thisTreeObj.requesturl, thisTreeObj.postData).done(function (data) {
            if (data !== "") {
                thisTreeObj.jqObject.html(data);
                initialize.call(thisTreeObj);
            }
        });
    }

	//public members
	return {
		initialize: initialize,
        fetchData: fetchData,
        loadContent: loadContent
	};

}();
