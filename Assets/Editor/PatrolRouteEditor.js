#pragma strict

@CustomEditor(PatrolRoute)
class PatrolRouteEditor extends Editor {
	function OnInspectorGUI () {
		var route : PatrolRoute = target as PatrolRoute;
		
		GUILayout.Label (route.patrolPoints.Count+" Patrol Points in Route");
		
		route.pingPong = EditorGUILayout.Toggle ("Ping Pong", route.pingPong);
		if (GUI.changed) {
			SceneView.RepaintAll ();
		}
		
		if (GUILayout.Button("Reverse Direction")) {
			route.patrolPoints.Reverse ();
			SceneView.RepaintAll ();
		}
		
		if (GUILayout.Button(isAddPoint?"Right click to Add, click here to Stop":"Add Patrol Point")) {
			//Selection.activeGameObject = route.InsertPatrolPointAt (route.patrolPoints.Count);
			isAddPoint = !isAddPoint;
		}
	}
	private var isAddPoint:boolean = false;
	function OnSceneGUI () {
		var route : PatrolRoute = target as PatrolRoute;
		DrawPatrolRoute (route);
		var e:Event = Event.current;
		if (isAddPoint){
			if (e.type == EventType.MouseDown && e.current.button == 1){
				var hitInfo:RaycastHit;
				var ray:Ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
				Physics.Raycast(ray.origin, ray.direction, hitInfo);
				if (hitInfo.transform){
					//Debug.Log('hit!');
					//Debug.Log(hitInfo.point);
					var po:GameObject = route.InsertPatrolPointAt (route.patrolPoints.Count);
					po.transform.position = hitInfo.point;
					//Selection.activeGameObject = po;
				}
				e.Use();
			}
			/*if (e.type == EventType.MouseUp && e.current.button == 1){
				isAddPoint = false;
				e.Use();
			}*/
		}
	}
	
	static function DrawPatrolRoute (route : PatrolRoute) {
		if (route.patrolPoints.Count == 0)
			return;
		
		var lastPoint : Vector3 = route.patrolPoints[0].transform.position;
		
		var loopCount = route.patrolPoints.Count;
		
		
		//handle to move patrol point
		for (var j:int = 0; j<route.patrolPoints.Count; j++){
			route.patrolPoints[j].transform.position = Handles.PositionHandle(route.patrolPoints[j].transform.position,
				Quaternion.identity);
		}

		
		if (route.pingPong)
			loopCount--;
		
		for (var i : int = 0; i < loopCount; i++) {
			if (!route.patrolPoints[i])
				break;
			
			
			var newPoint = route.patrolPoints[(i + 1) % route.patrolPoints.Count].transform.position;
			if (newPoint != lastPoint) {
				Handles.color = Color (0.5, 0.5, 1.0);
				DrawPatrolArrow (lastPoint, newPoint);
				if (route.pingPong) {
					Handles.color = Color (1.0, 1.0, 1.0, 0.2);
					DrawPatrolArrow (newPoint, lastPoint);
				}
			}
			lastPoint = newPoint;
		}
	}
	
	static function DrawPatrolArrow (a : Vector3, b : Vector3) {
		var directionRotation : Quaternion = Quaternion.LookRotation(b - a);
		Handles.ConeCap (0, (a + b) * 0.5 - directionRotation * Vector3.forward * 0.5, directionRotation, 0.7);
	}
}
