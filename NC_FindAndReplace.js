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

/**
 *
 * @return {void}
 */
function NC_FindAndReplace() {
  var myUi = NC_CreateWidget()
  var replaceLE = new QLineEdit()

  var findLELabel = new QLabel()
  findLELabel.text = "Find:"

  var findLE = new QLineEdit()
  findLE.text = "asdf"

  var replaceLELabel = new QLabel()
  replaceLELabel.text = "Replace:"

  var submit = new QPushButton()
  submit.text = "Replace"

  var cancel = new QPushButton()
  cancel.text = "Cancel"

  myUi.gridLayout.addWidget(findLELabel, 0, 0)
  myUi.gridLayout.addWidget(replaceLELabel, 1, 0)
  myUi.gridLayout.addWidget(findLE, 0, 1)
  myUi.gridLayout.addWidget(replaceLE, 1, 1)
  myUi.gridLayout.addWidget(submit, 2, 1)
  myUi.gridLayout.addWidget(cancel, 2, 0)

  myUi.show()
  replaceLE.setFocus(true)
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

  submit.clicked.connect(myUi, findAndReplace)
  cancel.clicked.connect(myUi, myUi.close)
}
