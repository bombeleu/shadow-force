#pragma strict
//@script RequireComponent (Team) //only need Team if visibilityType is TeamShare

public enum VisibilityType{
	Always,
	TeamShare
};

public enum FogType{
	NoGhost,
	Ghost
};

public var visibilityType : VisibilityType;
public var ghostType : FogType;

function Update () {
}

private var isVisible:boolean = true;
function SetVisible(visi:boolean){
	if (isVisible == visi) return;
	isVisible = visi;
	SendMessage("OnSetVisible",visi);
}

function GetVisible():boolean{
	return isVisible;
}
/*
function OnSetVisible(visi:boolean){
	var rr = gameObject.GetComponents(Renderer);
	for (var r:Renderer in rr){
		r.enabled = visi;
	}
}
*/