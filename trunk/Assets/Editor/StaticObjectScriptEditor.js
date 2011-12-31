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
    	go.startPos = Handles.PositionHandle(go.startPos, Quaternion.identity);
    	go.endPos = Handles.PositionHandle(go.endPos, Quaternion.identity);
    	go.Adjust();
    }
}