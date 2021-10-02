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

  var buildDynamicUi = function () {
    var n = selection.numberOfNodesSelected()

    for (var i = 0; i < n; ++i) {
      var selNode = selection.selectedNode(i)
      var nodeNamePath = selNode.split("/")
      var nodeName = nodeNamePath[nodeNamePath.length - 1]

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
          if (!nodeGroup || nodeGroup === nodeParts[0]) {
            nodeGroup = nodeParts[0]
          } else {
            nodeGroup = null
          }
        }

        /// Check if Element name is the same
        /// in each selected node
        if (!nodeElement || nodeElement === nodeParts[1]) {
          nodeElement = nodeParts[1]
        } else {
          nodeElement = null
        }
      }
    }

    myUi.show()
    replaceLE.setFocus(true)
  }

  var findAndReplace = function () {
    var _find = findLE.text
    var _replace = replaceLE.text
    var n = selection.numberOfNodesSelected()

    for (var i = 0; i < n; ++i) {
      var selNode = selection.selectedNode(i)
      var nodeNamePath = selNode.split("/")
      var nodeName = nodeNamePath[nodeNamePath.length - 1]

      var newNodeName = nodeName.replace(_find, _replace)
      var columnId = node.linkedColumn(selNode, "DRAWING.ELEMENT")
      var elementKey = column.getElementIdOfDrawing(columnId)
      var newColumnName = newNodeName

      node.rename(selNode, newNodeName)
      column.rename(columnId, newNodeName)
      element.renameById(elementKey, newNodeName)
    }

    myUi.close()
  }

  buildDynamicUi()
  submit.clicked.connect(myUi, findAndReplace)
  cancel.clicked.connect(myUi, myUi.close)
}
