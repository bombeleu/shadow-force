#pragma strict

@CustomEditor (StaticObjectScript)
class StaticObjectScriptEditor extends Editor {
	private var init:boolean = false;
	/*function OnEnable(){//potential to run on prefab and cause problem
    	var go:StaticObjectScript = target as StaticObjectScript;
    	if (!go.editorSupport) return;
    	go.Init();
		init = true;
	}*/
	private var firstTime:boolean = false;
    function OnSceneGUI() {
    	var go:StaticObjectScript = target as StaticObjectScript;
    	if (!firstTime){
    		//go.editorSupport = true;
    		
    		go.Init();
    		firstTime = true;
    	}
		if (!go.editorSupport){
			init = false;
			return;
		}
		if (!init){
			go.Reactivate();
			init = true;
		}
       	Tools.current = -1;//TODO: check the validity of this hack!
    	//DrawDefaultInspector();
    	Undo.SetSnapshotTarget(target, "Adjust object");
    	
    	go.startPos = Handles.PositionHandle(go.startPos, Quaternion.identity);
    	go.endPos = Handles.PositionHandle(go.endPos, Quaternion.identity);
    	
    	var scalePos:Vector3 = (go.startPos+go.endPos)*0.5;
    	go.sizeHandle = Handles.ScaleHandle(go.sizeHandle, scalePos, go.transform.rotation, HandleUtility.GetHandleSize(scalePos));
    	go.Adjust();
    	if (GUI.changed)
            EditorUtility.SetDirty (target);
            
        if(Input.GetMouseButtonDown(0)) {
            // Register the undos when we press the Mouse button.
            Undo.CreateSnapshot();
            Undo.RegisterSnapshot();
        }
    }
}