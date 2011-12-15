#pragma strict
@script RequireComponent (Team) //only need Team if visibilityType is TeamShare

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
private var observers:Hashtable = new Hashtable();

function AddObserver(observer:AutoShoot){
	var key:Object = observer.gameObject.GetInstanceID();
	if (!observers.ContainsKey(key)){
		observers.Add(key, observer);
	}
}

function RemoveObserver(observer:AutoShoot){
	var key:Object = observer.gameObject.GetInstanceID();
	if (observers.ContainsKey(key))
		observers.Remove(key);
}

function OnDestroy(){
	for (var i:Object in observers.Values){
		Debug.Log("dead remove");
		(i as AutoShoot).RemoveEnemy(this);
	}
}
