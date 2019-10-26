
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// This component handles all indexCijfers actions that are triggered from MaatMaanLoon calculations


// indexCijfers div's are based on te following structure
//  <tr title="refper">
//    <td class="textlabel">CBS Indexcijfer aanvang referteperiode</td>
//    <td title="result" class="indexcijfer">131,9 (2000)</td>
//    <td title="Year" class="dropdownlist"></td>
//    <td title="Month" class="dropdownlist"></td>
//  </tr>




// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoClaculation constructor
uwvBravo.IndexCijfers = function (options) {
    this.options = options || {}; // options is always an object literal
    this.parentContainerName = options.parentContainerName || undefined;
    this.validate = options.validateIndexCijfersDatum || false;
    this.parentObject = options.parentObject || undefined;
    //Enums
    this.IndexCijfersTypeEnum = { 'AanvangReferteperiode': 1, 'Huidige': 2 }

    //#region Custom Events buttons actions 
    //this.Event = document.createEvent("CustomEvent");
    //this.Event.initCustomEvent("Event", true, true, this);
    //#endregion

}

uwvBravo.IndexCijfers.prototype = function () {


    var validateSelectedIndexcijfers = function (indexCijferTableId) {
        var isValide = true;
        if (indexCijferTableId) {
            var indexCijferTableElement = $("#" + indexCijferTableId);
            var pattern = "indexcijfers-";
            var ikvKey = indexCijferTableId.substr(indexCijferTableId.indexOf(pattern) + pattern.length, indexCijferTableId.length);

            if (ikvKey) {

                var refdate = undefined;
                var curdate = undefined;

                // fetch values and create a date
                var selectedRefMonth = $(indexCijferTableElement).find("#" + ikvKey + "__IndexCbsCijferViewModel_MonthEersteSv").val();
                var selectedRefYear = $(indexCijferTableElement).find("#" + ikvKey + "__IndexCbsCijferViewModel_YearEersteSv").val();
                // Validate input
                if ((selectedRefMonth !== "") || (selectedRefYear !== "")) {
                    refdate = new Date(selectedRefYear, selectedRefMonth - 1, 1);
                }

                // fetch values and create a date
                var selectedCurMonth = $(indexCijferTableElement).find("#" + ikvKey + "__IndexCbsCijferViewModel_MonthVanHeden").val();
                var selectedCurYear = $(indexCijferTableElement).find("#" + ikvKey + "__IndexCbsCijferViewModel_YearVanHeden").val();

                if ((selectedCurMonth !== "") || (selectedCurYear !== "")) {
                    curdate = new Date(selectedCurYear, selectedCurMonth - 1, 1);
                }

                if (refdate && curdate) {
                    //Validate
                    if (curdate <= refdate) {
                        //Change border to indicate
                        $(indexCijferTableElement).parent("div").addClass("accentBorderColor");
                        isValide = false;
                    } else {
                        $(indexCijferTableElement).parent("div").removeClass("accentBorderColor");
                    }
                }
            }

        }
        return isValide;

    }


	var valideerIndexcijfersSelecties = function () {

		var isValide = false;

		//valideer index controll
		$("#" + this.parentContainerName + " > tbody > tr.parentRow").each(function () {
			// fetch loonheffingsnr

			var indexCijferTable = $(this).find("table[id^='indexcijfers-']").length != 0 ? $(this).find("table[id^='indexcijfers-']")[0].id : undefined;

			if (indexCijferTable != undefined) {
				isValide = validateSelectedIndexcijfers(indexCijferTable);
			}

		});

		//if (isValide) {
		//    $("button[name='btnBepaalIndexcijfers']").prop("disabled", true);
		//    $("button[name='btnSaveIkvSet']").prop("disabled", true);
		//} else {
		//    $("button[name='btnBepaalIndexcijfers']").prop("disabled", false);
		//    $("button[name='btnSaveIkvSet']").prop("disabled", false);
		//}
	};


    //binf change events on dropdown index cijfers
    var bindIndexCijfersDropDownChangeEvent = function () {

        var thiz = this;

        $("#" + this.parentContainerName).find("table[id^='indexcijfers-']  > tbody > tr > td").change(function () {

            var parentTableId = $(this).closest("table").attr("id");

            var elementIdSplitted = parentTableId.split("-");
            if (elementIdSplitted.length <= 0) return false;

            var elementIkvParentListId = elementIdSplitted[elementIdSplitted.length - 1];

            var parentRow = $(this).closest("tr");
            var indexTitle = parentRow ? $(parentRow)[0].title : undefined;

            var indexCijferType = indexTitle ? thiz.IndexCijfersTypeEnum[indexTitle] : undefined;

            var triggerTitle = $(this)[0].title;
            var selectedValue = $(this).find("option:selected").val();

            var selectedYear = 0;

            var indexContainer = $(this).siblings("td[title^='index']")[0];

            switch (triggerTitle) {
                case "Month":
                    var selectedMonth = selectedValue;
                    selectedYear = $(this).prev("td").find("option:selected").val();
                    getIndexCijfer(indexCijferType, selectedYear, selectedMonth, indexContainer, elementIkvParentListId);
                    break;
                case "Year":
                    indexContainer.innerHTML = "0,0 (0)";
                    var targetMonthList = $(this).next("td").find("select");
                    selectedYear = selectedValue;
                    getIndexCijferMonthList(selectedYear, targetMonthList);
                    break;
                default:
            }

            if (parentTableId && thiz.validate) validateSelectedIndexcijfers(parentTableId);

        });

    }


    //Parse the table indexCijfers for associated indexcijfers items
    var getIndexCijfers = function (container) {

        var thiz = this;
        var cbsIndices = [];

        $(container).find("table[id^='indexcijfers-']  > tbody > tr ").each(function () {

            var yearContainer = $(this).find("td[title='Year'] > select > option:selected");
            var year = yearContainer ? parseNumber(yearContainer.val()) : undefined;

            var monthContainer = $(this).find("td[title='Month'] > select > option:selected");
            var month = monthContainer ? parseNumber(monthContainer.val()) : undefined;

            //check if year and month are not selected
            if (year !== "" && month !== "") {

                //Get indexCijfer type from associated row
                var indexTitle = $(this).closest("tr") ? $(this).closest("tr")[0].title : undefined;
                var indexCijferType = indexTitle ? thiz.IndexCijfersTypeEnum[indexTitle] : undefined;

                var indexCijfer = 0;
                var baseYear = 0;
                var indexContainer = $(this).find("td[title^='index']")[0];

                if (indexContainer) {
                    var indexCijferStartTextArray = indexContainer.innerHTML.trim().split(/\s+/);
                    indexCijfer = parseNumber(indexCijferStartTextArray[0]);
                    baseYear = parseNumber(indexCijferStartTextArray[1].replace(/[()]/g, ""));
                }

                var cbsIndex = {
                    CbsIndexType: indexCijferType,
                    Index: indexCijfer,
                    Month: month,
                    Year: year,
                    IndexBaseYear: baseYear
                }

                cbsIndices.push(cbsIndex);
            }
        });

        return cbsIndices;
    }


    //Get IndexCijfer based on year and month
    function getIndexCijfer(type, year, month, resultElement, ikvIndex) {

        if ((month === "") || (year === "") || (resultElement === undefined)) {
            return false;
        }
        var postData = { month: month, year: year, indexCijferType: type };
        var url = "../Services/GetIndexCijfer";

        return $.get(url, postData,
            function (result) {
                if (result != null && result !== "") {
                    if (typeof (result) == "object") {
                        resultElement.innerHTML = result.indexLabel;

                        if (type === 1) {
                            $("#" + ikvIndex + "__IndexCbsCijferViewModel_IndexCijferEersteSv").val(result.index);
                            $("#" + ikvIndex + "__IndexCbsCijferViewModel_IndexBaseYearEersteSv")
                                .val(result.indexBaseYear);
                        } else {
                            $("#" + ikvIndex + "__IndexCbsCijferViewModel_IndexCijferVanHeden").val(result.index);
                            $("#" + ikvIndex + "__IndexCbsCijferViewModel_IndexBaseYearVanHeden")
                                .val(result.indexBaseYear);
                        }
                    }
                } 
                    
            });
    }


    //get month list based on year
    function getIndexCijferMonthList(selectedYear, targetList, selectedMonth) {

        if ((selectedYear === "") || (targetList === undefined)) {
            return false;
        }

        var postData = { year: selectedYear };
        var url = "../Services/GetIndexCijferMonthList";

        return $.get(url, postData,
            function (result) {
                if (result !== "") {
                    targetList.empty();
                    //add empty entre
                    targetList.append($("<option>").text(""));
                    //add result
                    $.each(result,
                        function (index, value) {
                            targetList.append($("<option>").text(value));
                        });

                    if (selectedMonth) {
                        targetList.val(selectedMonth);
                        //trigger the onchange event to get the index
                        targetList.trigger("change");
                    }

                }
            });

    }

    //#region selecteer IndexCijfers
    var bepaalIndexcijfers = function () {
        var aanvRef;
        var ikvKey; 

        if (this.parentObject != undefined) {
            if (this.parentObject.selectedRowsCount() != undefined && this.parentObject.selectedRowsCount() == 0) {
                $.messager.show({
                    msg: "Er is nog geen selectie gemaakt",
                    timeout: 2000,
                    showType: "slide"
                });
                return false;
            }
        }

        //get the werkgeverIKV parent tables inside current form
        $("#" + this.parentContainerName).find("table[id^='iko_']").each(function () {

            //get only the first checked row
            var firstSelectedIko = $(this).find("tbody").find("tr").has("input[type=checkbox]:checked").first()[0];

            if (firstSelectedIko) {

                //split id from 'iko_' prefix to get the key
                ikvKey = $(firstSelectedIko).closest("table")[0].id.slice(4);

                //Get the lblBDate column value based of date format "dd-MM-yyyy"
                var fromDate = $(firstSelectedIko).find("input[name*=BeginDate]");
                if (fromDate) {
                    var fromDateSplitted = fromDate[0].value.split("-");
                    if (fromDateSplitted.length == 3) {
                        aanvRef = new Date(fromDateSplitted[2], fromDateSplitted[1] - 1, fromDateSplitted[0]);

                        //parse date to month and year
                        var selectedMonth = aanvRef.getMonth() + 1;
                        var selectedYear = aanvRef.getFullYear();

                        //get ikv parent
                        var elementIdSplitted = fromDate[0].id.split("__");
                        if (elementIdSplitted.length > 0) {
                            var elementIkvParentListId = elementIdSplitted[0];

                            var yearAanvRefPerList = $("#" + elementIkvParentListId + "__IndexCbsCijferViewModel_YearEersteSv");
                            //check if founded year in years list exists 
                            if ($(yearAanvRefPerList).find("option:contains('" + selectedYear + "')").length) {
                                //select year
                                $(yearAanvRefPerList).val(selectedYear).valid();

                                var targetMonthList = $("#" + elementIkvParentListId + "__IndexCbsCijferViewModel_MonthEersteSv");

                                $.when(getIndexCijferMonthList(selectedYear, targetMonthList, selectedMonth)
                                ).then(function () { targetMonthList.valid(); });
                            }
                        }

                    }
                }
            }


        });
    };
    //#endregion


    //#region initialisation component
    var initIndexCijfers = function () {
        bindIndexCijfersDropDownChangeEvent.call(this);

        if (this.validate) valideerIndexcijfersSelecties.call(this);
    }

    var initialize = function () {
        initIndexCijfers.call(this);

    };

    //#endregion initialisation component


    //#region public members
    return {
        initialize: initialize,
        bepaalIndexcijfers: bepaalIndexcijfers,
        getIndexCijfers: getIndexCijfers
    };

    //#endregion public members
}();