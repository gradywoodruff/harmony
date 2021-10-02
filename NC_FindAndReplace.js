/* ---------------------------------------------------------------------------------
 * NC_Find_And_Replace.js
 *
 * Original:
 * Jason Schleifer / 26 October 2018
 * Latest Revision: v2.0 - 25 Nov 2018, 10:04 AM
 *
 * Modified:
 * J Grady Woodruff IV / 2 October 2021
 * Latest Revision: v3.0 - 2 Nov 2021
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

/**
 * @return {void}
 */
function NC_FindAndReplace() {
  var DEFAULT_GROUP = "ASD"
  var DEFAULT_ELEMENT = "asdf"

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
      widgets: {}
    }
  }

  var getNodeParts = function (selNode) {
    var nodeNamePath = selNode.split("/")
    var nodeName = nodeNamePath[nodeNamePath.length - 1]
    var nodeType = node.type(selNode)

    /// Clean node name for parsing
    if (nodeType == "PEG") {
      nodeName = nodeName.replace("-P", "")
    }

    var nodeParts = nodeName.split("-")
    /// If name is separated by a `-` it
    /// means the node name contains a
    /// Group and Element name
    switch (nodeParts.length) {
      case 0:
        break

      case 1:
        /// Check if Element name is the same
        /// in each selected node
        addField("element")
        if (
          !fields["element"].value ||
          fields["element"].value === nodeParts[0]
        ) {
          fields["element"].value = nodeParts[0]
          if (nodeParts[0] === DEFAULT_ELEMENT) {
            fields["element"].isDefault = true
          }
        } else {
          fields["element"].value = null
          fields["element"].isDefault = false
        }
        break

      default:
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
        break
    }
  }

  var buildDynamicUi = function () {
    var isDefault = false
    var n = selection.numberOfNodesSelected()

    for (var i = 0; i < n; ++i) {
      getNodeParts(selection.selectedNode(i))
    }

    var fieldPosition = 0
    for (field in fields) {
      var fieldName = field.charAt(0).toUpperCase() + field.slice(1)
      var findFieldValue = fields[field].value

      if (fields[field].isDefault) {
        isDefault = true
      } else {
        fields[field].widgets.findLabel = new QLabel()
        fields[field].widgets.findEdit = new QLineEdit()

        fields[field].widgets.findLabel.text =
          "Find " + fieldName + " Name:"
        fields[field].widgets.findEdit.text = findFieldValue

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

      fields[field].widgets.replaceLabel.text =
        replaceInstruction + " " + fieldName + " Name:"

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

    for (var field in fields) {
      if (isDefault) {
        fields[field].widgets.replaceEdit.setFocus(true)
      } else {
        fields[field].widgets.findEdit.setFocus(true)
      }
      break
    }
  }

  var findAndReplace = function () {
    var _find = []
    var _replace = []
    for (field in fields) {
      var replaceValue = fields[field].widgets.replaceEdit.text
      if (!replaceValue || replaceValue === "") {
        continue
      }

      var findValue
      if (fields[field].isDefault) {
        if (field === "group") {
          findValue = DEFAULT_GROUP
        } else if (field === "element") {
          findValue = DEFAULT_ELEMENT
        }
      } else {
        findValue = fields[field].widgets.findEdit.text
      }

      _find.push(findValue)
      _replace.push(replaceValue)
    }

    var n = selection.numberOfNodesSelected()
    for (var i = 0; i < n; ++i) {
      var selNode = selection.selectedNode(i)
      var nodeNamePath = selNode.split("/")
      var nodeName = nodeNamePath[nodeNamePath.length - 1]
      var newNodeName = nodeName.replace(
        _find.join("-"),
        _replace.join("-")
      )
      var columnId = node.linkedColumn(selNode, "DRAWING.ELEMENT")
      var elementKey = column.getElementIdOfDrawing(columnId)

      node.rename(selNode, newNodeName)
      column.rename(columnId, newNodeName)
      element.renameById(elementKey, newNodeName)
    }

    myUi.close()
  }

  buildDynamicUi()
  buttonSubmit.clicked.connect(myUi, findAndReplace)
  buttonCancel.clicked.connect(myUi, myUi.close)
}
