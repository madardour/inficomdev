//http://stackoverflow.com/questions/18956257/how-to-add-an-ajax-save-button-with-loading-gif-to-ckeditor-4-2-1-working-samp
/// Author: R. el Bali
// This is a custom Bravo plugin for ckeditor

CKEDITOR.plugins.add('variableHistory', {
    icons: 'variableHistory',
    init: function (editor) {
        editor.addCommand('variableHistorytoolbar', {
            exec: function (editor) {
                showVariableHistoryDialog(editor); // show the modal
            }
        });

        //add the save button to the toolbar
        editor.ui.addButton('variableHistory', {
            label: 'Veld Geschiedenis',
            command: 'variableHistorytoolbar'
        });


    }
});

function showVariableHistoryDialog(editor) {
    if (editor.name.length != 0) {
        editor.fire('vtBibliotheek');
        return;
    }

}

function closetoolbar(e) {

    var id = "cke_" + e.name;
    var elem;
    if (document.getElementById) {
        elem = document.getElementById(id);
    } else if (document.all) {
        elem = document.all[id];
    } else if (document.layers) {
        elem = document.layers[id];
    }
    if (elem != null && elem != undefined) { elem.style.display = 'none'; }
}