#pragma strict

@CustomEditor (SelectionRedirect)
class SelectionRedirectEditor extends Editor {
    function OnSceneGUI   () {
    	var go:SelectionRedirect = target as SelectionRedirect;
    	if (go.target) Selection.activeTransform = go.target;
    }
}