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

#if UNITY_FLASH
public static var uniqueKey:int = 0;
public var myKey:int;
function Awake() {
	myKey = uniqueKey++;
}
#endif

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

private function GetID(observer:DetectionAI):Object{
	#if UNITY_FLASH
		return observer.myKey;
	#else
		return observer.gameObject.GetInstanceID();
	#endif
}

function AddObserver(observer:DetectionAI){
	var key:Object = GetID(observer);
	if (!observers.ContainsKey(key)){
		observers.Add(key, observer);
	}
}

function RemoveObserver(observer:DetectionAI){
	var key:Object = GetID(observer);
	if (observers.ContainsKey(key))
		observers.Remove(key);
}

function OnDestroy(){
	for (var i:Object in observers.Values){
		Debug.Log("dead remove");
		(i as DetectionAI).RemoveEnemy(this);
	}
}
