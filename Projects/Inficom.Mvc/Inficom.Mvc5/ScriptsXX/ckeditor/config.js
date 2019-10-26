/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.language = 'nl';
    //config.entities_processNumerical
    //Whether to convert all remaining characters not included in the ASCII character table to their relative decimal numeric representation of HTML entity.When set to force, it will convert all entities into this format.
    //For example the phrase: 'This is Chinese: ??.' would be output as: 'This is Chinese: &#27721;&#35821;.'
    config.entities_processNumerical = true;

    //cconfig.entities_processNumerical = 'force'; // Converts from '&nbsp;' into '&#160;';
    //config.entities_processNumerical = 'force';

    //config.scayt_srcUrl = "/spellcheck/lf/scayt3/ckscayt/ckscayt.js";
    //config.wsc_customLoaderScript = "/spellcheck/lf/22/js/wsc_fck2plugin.js";
    // set up Custom Dictionary
    //CKEDITOR.config.scayt_customDictionaryIds = "1"

    // Toolbar configuration generated automatically by the editor based on config.toolbarGroups.
    // evaluate SCAYT on startup
    CKEDITOR.config.scayt_autoStartup = true;
    // evaluate GRAYT on startup
    CKEDITOR.config.grayt_autoStartup = true;
    // set up max suggestion count in context menu
    // all other words will be present in "More Suggestions" sub menu
    CKEDITOR.config.scayt_maxSuggestions = 4;

    // enable/disable the "More Suggestions" sub-menu in the context menu.
    // The possible values are "on" or "off".
    CKEDITOR.config.scayt_moreSuggestions = 'off';
    // customize the display of SCAYT context menu commands ("Add Word", "Ignore"
    // and "Ignore All"). It must be a string with one or more of the following
    // words separated by a pipe ("|"):
    // "off": disables all options.
    // "all": enables all options.
    // "ignore": enables the "Ignore" option.
    // "ignoreall": enables the "Ignore All" option.
    // "add": enables the "Add Word" option.
    CKEDITOR.config.scayt_contextCommands = 'add|ignoreall';
    // set the visibility of the SCAYT tabs in the settings dialog and toolbar
    // button. The value must contain a "1" (enabled) or "0" (disabled) number for
    // each of the following entries, in this precise order, separated by a
    // comma (","): "Options", "Languages" and "Dictionary".
    CKEDITOR.config.scayt_uiTabs = '1,0,1';
    // Define order of placing of SCAYT context menu items by groups.
    // It must be a string with one or more of the following
    // words separated by a pipe ("|"):
    // 'suggest' - main suggestion word list
    // 'moresuggest' - more suggestions word list
    // 'control' - SCAYT commands, such as 'Ignore' and 'Add Word'
    CKEDITOR.config.scayt_contextMenuItemsOrder = 'moresuggest|control|suggest';
    // Define minimum length of the words that will be collected from editor for spell-checking.
    // 'value' - any positive number
    CKEDITOR.config.scayt_minWordLength = 4;
    // Specify the names of tags that will be skipped while spell checking.
    CKEDITOR.config.scayt_elementsToIgnore = 'del,pre';
    // Disable SCAYT options storage in localStorage.
    // Possible values are:
    // "options" - disable all options storage, except "lang"
    // "ignore-all-caps-words" - disable ignore-all-caps-words option storage
    // "ignore-domain-names" - disable ignore-domain-names option storage
    // "ignore-words-with-mixed-cases" - disable ignore-words-with-mixed-cases option storage
    // "ignore-words-with-numbers" - disable ignore-words-with-numbers option storage
    // "lang" - disable spellcheck language storage
    // "all" - disable storage of the all options
    CKEDITOR.config.scayt_disableOptionsStorage = ['lang', 'ignore-all-caps-words', 'ignore-words-with-mixed-cases']
    // enable/disable ignore-words-with-numbers option. Should be used in conjunction with scayt_disableOptionsStorage parameter  because optionStorage has higher priority then defined value by default.
    CKEDITOR.config.scayt_ignoreWordsWithNumbers = true;
    // enable/disable ignore-domain-names option. Should be used in conjunction with scayt_disableOptionsStorage parameter  because optionStorage has higher priority then defined value by default.
    CKEDITOR.config.scayt_ignoreDomainNames = true;
    // enable/disable ignore-words-with-mixed-cases option. Should be used in conjunction with scayt_disableOptionsStorage parameter  because optionStorage has higher priority then defined value by default.
    CKEDITOR.config.scayt_ignoreWordsWithMixedCases = true;
    // enable/disable ignore-all-caps-words option. Should be used in conjunction with scayt_disableOptionsStorage parameter  because optionStorage has higher priority then defined value by default.
    CKEDITOR.config.scayt_ignoreAllCapsWords = true;
    // The parameter turns on/off SCAYT initiation when Inline CKEditor is not focused.
    // SCAYT markup is taken place (SCAYT instance is not destroyed) in both Inline CKEditor's states, focused and unfocused.

    CKEDITOR.config.scayt_inlineModeImmediateMarkup = false;

    // Toolbar configuration generated automatically by the editor based on config.toolbarGroups.
    config.toolbar = [{
        name: 'document',
        groups: ['mode', 'document', 'doctools'],
        items: ['NewPage']
    }, {
        name: 'clipboard',
        groups: ['clipboard', 'undo'],
        items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
    }, {
        name: 'editing',
        groups: ['find', 'selection', 'spellchecker'],
        items: ['Scayt']

    }, {
        name: 'basicstyles',
        groups: ['basicstyles', 'cleanup'],
        items: ['Bold', 'Italic', 'Underline', 'RemoveFormat']
    }, {
        name: 'paragraph',
        groups: ['list', 'align'],
        items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent']

    }, {
        name: 'insert',
        items: ['SpecialChar', 'Symbol']
    }, {
        name: 'bravo',
        //items: ['variableHistory', '-', 'personalLibrary', '-', 'AutoCorrect']
        items: ['variableHistory', '-', 'personalLibrary']
    }
    ];
        
    config.scayt_sLang = 'nl_NL';
    config.extraPlugins = 'dialog,variableHistory,personalLibrary,placeholder,preview,widget,lineutils,clipboard,dialogui,pastefromword,autocorrect,menubutton,button,floatpanel,menu,panel,sharedspace,textmatch,autocomplete';
    config.skin = 'office2013';
    config.contentsLangDirection = 'ui';
    config.font_names = 'Verdana';
    config.font_defaultLabel = 'Verdana';
    config.fontSize_defaultLabel = '18px';

    // Extend ACF rules to allow border-spacing style.
    //extraAllowedContent: 'table{border-spacing}';


    //xml-elements 
    config.protectedSource.push(/<%[\s\S]*?%>/g);
    //todo: delete cdata tag from textarea
    //config.protectedSource.push(/<%[\s\S]*?%\!\[CDATA\[.*?\]\]>/g);


    //set to false for PROD / GAT
    //config.title = CKEDITOR_TITLE;

    config.fillEmptyBlocks = false; // Prevent filler nodes in all empty blocks.

    //Whether an editable element should have focus when the editor is loading for the first time.
    //config.startupFocus = true;


};
