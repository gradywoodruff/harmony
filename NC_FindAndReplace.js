/* ---------------------------------------------------------------------------------
 * NC_Find_And_Replace.js
 *
 * Jason Schleifer / 26 October 2018
 * Latest Revision: v2.0 - 25 Nov 2018, 10:04 AM
 * License: GPL v3
 *
 * Description:
 * -----------
 * Finds and replaces text in the selected nodes.
 *
 * Usage:
 * ------
 * Select a series of nodes you want to replace the text of. Choose the function NC_FindAndReplace.
 *
 * Requirements:
 * -------------
 * NC_Utils.js
 *
 * Updates:
 * --------
 * v2.0 - added use of NC_Utils.js
 *
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 *
 * Acknowledgement:
 * ----------------
 * This script wouldn't have been possible without the help from eAthis
 * https://forums.toonboom.com/harmony/support-and-troubleshooting/how-set-focus-lineedit-qtscript
 */

include("NC_Utils.js")

var DEFAULT_GROUP = "ASD"
var DEFAULT_ELEMENT = "asdf"

/**
 *
 * @return {void}
 */
function NC_FindAndReplace() {
  var myUi = NC_CreateWidget()
  var fields = {}

  /// Buttons
  var buttonSubmit = new QPushButton()
  var buttonCancel = new QPushButton()
  buttonCancel.text = "Cancel"

  var addField = function (fieldName) {
    if (fieldName in fields) {
      return
    }

    fields[fieldName] = {
      value: null,
      isDefault: false,
      position: null,
      widgets: {}
    }
  }

  var getNodeParts = function (nodeName) {
    var nodeParts = nodeName.split("-")
    /// If name is separated by a `-` it
    /// means the node name contains a
    /// Group and Element name
    if (nodeParts.length > 1) {
      /// Check for Node Group
      var isGroupName = nodeParts[0] === nodeParts[0].toUpperCase()
      if (isGroupName) {
        /// Check if Group name is the same
        /// in each selected node
        addField("group")
        if (
          !fields["group"].value ||
          fields["group"].value === nodeParts[0]
        ) {
          fields["group"].value = nodeParts[0]
          if (nodeParts[0] === DEFAULT_GROUP) {
            fields["group"].isDefault = true
          }
        } else {
          fields["group"].value = null
          fields["group"].isDefault = false
        }
      }

      /// Check if Element name is the same
      /// in each selected node
      addField("element")
      if (
        !fields["element"].value ||
        fields["element"].value === nodeParts[1]
      ) {
        fields["element"].value = nodeParts[1]
        if (nodeParts[1] === DEFAULT_ELEMENT) {
          fields["element"].isDefault = true
        }
      } else {
        fields["element"].value = null
        fields["element"].isDefault = false
      }
    }
  }

  var buildDynamicUi = function () {
    var isDefault = false
    var n = selection.numberOfNodesSelected()

    for (var i = 0; i < n; ++i) {
      var selNode = selection.selectedNode(i)
      var nodeNamePath = selNode.split("/")
      var nodeName = nodeNamePath[nodeNamePath.length - 1]

      getNodeParts(nodeName)
    }

    var fieldLength = Object.keys(fields).length
    var labelsWithFieldNames = fieldLength > 1
    var fieldPosition = 0
    for (field in fields) {
      var fieldName = field.charAt(0).toUpperCase() + field.slice(1)
      var findFieldValue = fields[field].value

      if (fields[field].isDefault) {
        isDefault = true
      } else {
        fields[field].widgets.findLabel = new QLabel()
        fields[field].widgets.findEdit = new QLineEdit()

        var findFieldLabel = labelsWithFieldNames
          ? "Find " + fieldName + ":"
          : "Find:"

        fields[field].widgets.findLabel.text = findFieldLabel

        // fields[field].position = fieldPosition
        myUi.gridLayout.addWidget(
          fields[field].widgets.findLabel,
          fieldPosition,
          0
        )
        myUi.gridLayout.addWidget(
          fields[field].widgets.findEdit,
          fieldPosition,
          1
        )
        fieldPosition++
      }

      fields[field].widgets.replaceLabel = new QLabel()
      fields[field].widgets.replaceEdit = new QLineEdit()

      var replaceInstruction = fields[field].isDefault
        ? "New"
        : "Replace"
      var replaceFieldWidgetLabel = labelsWithFieldNames
        ? replaceInstruction + " " + fieldName + ":"
        : replaceInstruction + ":"

      fields[field].widgets.replaceLabel.text = replaceFieldWidgetLabel

      myUi.gridLayout.addWidget(
        fields[field].widgets.replaceLabel,
        fieldPosition,
        0
      )
      myUi.gridLayout.addWidget(
        fields[field].widgets.replaceEdit,
        fieldPosition,
        1
      )
      fieldPosition++
    }

    buttonSubmit.text = isDefault ? "Create" : "Replace"

    myUi.gridLayout.addWidget(buttonSubmit, fieldPosition, 1)
    myUi.gridLayout.addWidget(buttonCancel, fieldPosition, 0)

    myUi.show()
    // replaceLE.setFocus(true)
  }

  // var findAndReplace = function () {
  //   var _find = findLE.text
  //   var _replace = replaceLE.text
  //   var n = selection.numberOfNodesSelected()

  //   for (var i = 0; i < n; ++i) {
  //     var selNode = selection.selectedNode(i)
  //     var nodeNamePath = selNode.split("/")
  //     var nodeName = nodeNamePath[nodeNamePath.length - 1]

  //     var newNodeName = nodeName.replace(_find, _replace)
  //     var columnId = node.linkedColumn(selNode, "DRAWING.ELEMENT")
  //     var elementKey = column.getElementIdOfDrawing(columnId)

  //     node.rename(selNode, newNodeName)
  //     column.rename(columnId, newNodeName)
  //     element.renameById(elementKey, newNodeName)
  //   }

  //   myUi.close()
  // }

  buildDynamicUi()
  // buttonSubmit.clicked.connect(myUi, findAndReplace)
  buttonCancel.clicked.connect(myUi, myUi.close)
}
