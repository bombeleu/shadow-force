#pragma strict

@CustomEditor(CheckPoint)
class CheckPointEditor extends Editor {
	function OnInspectorGUI () {
		var point : CheckPoint = target as CheckPoint;
		var tutorial : TutorialManager = point.transform.parent.GetComponent.<TutorialManager>();
		var thisIndex : int = tutorial.GetIndexOfCheckPoint (point);
		GUILayout.Label("Position : " + tutorial.GetIndexOfCheckPoint(point));
		if (GUILayout.Button ("Remove This Check Point")) {
			tutorial.RemoveCheckPointAt (thisIndex);
			var newSelectionIndex : int = Mathf.Clamp (thisIndex, 0, tutorial.checkPoints.Length - 1);
			Selection.activeGameObject = (tutorial.checkPoints[newSelectionIndex] as CheckPoint).gameObject;
		}
		if (GUILayout.Button ("Insert Check Point Before")) {
			Selection.activeGameObject = tutorial.InsertCheckPointAt (thisIndex);
		}
		if (GUILayout.Button ("Insert Check Point After")) {
			Selection.activeGameObject = tutorial.InsertCheckPointAt (thisIndex + 1);
		}
		
		GUILayout.Label("Only support 1 popup message for now !");
	}
	
}