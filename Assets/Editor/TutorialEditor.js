#pragma strict

@CustomEditor(TutorialManager)
class TutorialEditor extends Editor {
	private var isAddPoint:boolean = false;
	function OnInspectorGUI () {
		var tutorial : TutorialManager = target as TutorialManager;
		
		GUILayout.Label (tutorial.checkPoints.Count + " checkpoints");
		
		if (GUI.changed) {
			SceneView.RepaintAll ();
		}
		
		if (GUILayout.Button(isAddPoint?"Right click to Add, click here to Stop":"Add Check Point")) {
			isAddPoint = !isAddPoint;
		}
		if (GUILayout.Button("Clean All")) {
			tutorial.checkPoints.Clear();
		}
		EditorGUILayout.Separator();
		
		//tutorial.checkPointPrefab = EditorGUILayout.ObjectField("CheckPointPrefab",tutorial.checkPointPrefab,CheckPoint);
	}
	
	function OnSceneGUI () {
		var tutorial : TutorialManager = target as TutorialManager;
		
		var e:Event = Event.current;
		if (isAddPoint){
			if (e.type == EventType.MouseDown && e.current.button == 1){
				var hitInfo:RaycastHit;
				var ray:Ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
				Physics.Raycast(ray.origin, ray.direction, hitInfo);
				if (hitInfo.transform){
					var po:GameObject = tutorial.InsertCheckPointAt(tutorial.checkPoints.Count);
					po.transform.position = hitInfo.point;
				}
				e.Use();
			}
			
		}
	}
}