#pragma strict

@CustomEditor (StaticObjectScriptDummy)
class StaticObjectScriptDummyEditor extends Editor {
    function OnSceneGUI() {
    	var go:StaticObjectScriptDummy = target as StaticObjectScriptDummy;
		if (go!=null){
			var ggo:GameObject = go.gameObject;
			ggo.DestroyImmediate(go);
	    	ggo.AddComponent(StaticObjectScript);
		}
    }
}