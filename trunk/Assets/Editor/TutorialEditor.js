#pragma strict

@CustomEditor(TutorialManager)
class TutorialEditor extends Editor {
	private var isAddPoint:boolean = false;
	function OnInspectorGUI () {
		var tutorial : TutorialManager = target as TutorialManager;
		
		if (tutorial.checkPoints) GUILayout.Label (tutorial.checkPoints.Length + " checkpoints");
		
		if (GUI.changed) {
			SceneView.RepaintAll ();
		}
		
		if (GUILayout.Button(isAddPoint?"Right click to Add, click here to Stop":"Add Check Point")) {
			isAddPoint = !isAddPoint;
		}
		if (GUILayout.Button("Clean All")) {
			tutorial.ClearCheckPoints();
		}
		EditorGUILayout.Separator();
		tutorial.isSequential = EditorGUILayout.Toggle("Is Sequential",tutorial.isSequential);
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
					var po : GameObject;
					if (tutorial.checkPoints)
					{
						po = tutorial.InsertCheckPointAt(tutorial.checkPoints.Length);
					} else
					{
						po = tutorial.InsertCheckPointAt(0);
					}
					po.transform.position = hitInfo.point;
					po.transform.position.y += 0.7f;
				}
				e.Use();
			}
			
		}
	}
}