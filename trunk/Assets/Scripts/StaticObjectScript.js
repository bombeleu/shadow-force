#pragma strict
//@script ExecuteInEditMode()

public var editorSupport:boolean = true;

@HideInInspector
public var visualPart:MeshFilter;
@HideInInspector
public var colliderPart:BoxCollider;//TODO: capsule?
public var repeat:boolean = true;
public var maxSizeRatio:float = 1.25;
@HideInInspector
public var customMode:boolean = false;

public var hasCollider:boolean = true;

public var visualPrefab:MeshFilter;
@HideInInspector
public var curVisPrefab:MeshFilter;

private var box:BoxCollider;

@HideInInspector
public var meshExtents:Vector3;

private var realScale:Vector3 = Vector3.one;
@HideInInspector
public var visStartScale:Vector3;
@HideInInspector
public var visStartCenter:Vector3;
//private var visStartRotation:Quaternion;
@HideInInspector
public var physStartExtents:Vector3;

@HideInInspector
public var wallLen:float;

private var repeatedObjs:Array;
@HideInInspector
public var serializedRepObjs:GameObject[];//for saving purpose

@HideInInspector
public var startPos:Vector3;
@HideInInspector
public var endPos:Vector3;
@HideInInspector
public var sizeHandle:Vector3 = Vector3.one;

private static var VIS_PART_NAME:String = "VisualPart";
private static var PHYS_PART_NAME:String = "PhysicalPart";
private static var REPEATED_PART_NAME:String = "RepeatedPart";

/*
private function transform.Find(name:String):GameObject{
	for (var t:Transform in transform){
		if (t.gameObject.name.Equals(name)) return t.gameObject;
		Debug.Log("scane name: "+t.gameObject.name);
	}
	return null;
}*/

private function createVisual(){
	/*
	var visFind:Transform = transform.Find(VIS_PART_NAME);
	if (visFind!=null)
		visualPart = visFind.GetComponent(MeshFilter);*/
		
	var pos:Vector3 = Vector3.zero;
	var scale:Vector3 = Vector3.one;
	var quat:Quaternion = Quaternion.identity;
		
	if (visualPart!=null){
		pos = visualPart.transform.localPosition;
		scale = visualPart.transform.localScale;
		quat = visualPart.transform.localRotation;
		GameObject.DestroyImmediate(visualPart.gameObject);
		if (repeatedObjs!=null){
			clearRepeatedObjs();
		}
	}

	visualPart = Instantiate(visualPrefab, Vector3.zero, Quaternion.identity);
	visualPart.gameObject.isStatic = true;
	visualPart.name = VIS_PART_NAME;
	visualPart.transform.parent = transform;
	visualPart.transform.localPosition = pos;
	visualPart.transform.localRotation = quat;
	visualPart.transform.localScale = scale;

	curVisPrefab = visualPrefab;

	//remove the default MeshCollider
	var collider:Collider = visualPart.GetComponent(Collider);
	if (collider) GameObject.DestroyImmediate(collider);
	var anim:Animation = visualPart.GetComponent(Animation);
	if (anim) GameObject.DestroyImmediate(anim);
}

private function initVisual(){
	if (visualPart==null) return;
	if (editorSupport)//so that prefab can adjust itself!
		visualPart.gameObject.AddComponent(SelectionRedirect).target = transform;
	
	visStartScale = visualPart.transform.localScale;
	/*visStartRotation = visualPart.transform.localRotation;*/
	visStartCenter = Vector3.Scale(visualPart.sharedMesh.bounds.center, visStartScale);
		
	meshExtents =  Vector3.Scale(visualPart.sharedMesh.bounds.extents, visStartScale);
	wallLen = meshExtents.x;
}


private function initPhysics(){	
	/*var physFind:Transform = transform.Find(PHYS_PART_NAME);
	if (physFind!=null)
		colliderPart = physFind.GetComponent(BoxCollider);*/
	if ((!customMode) && (colliderPart==null)){
		var go:GameObject = new GameObject();
		go.isStatic = true;
		go.layer = gameObject.layer;
		if (go.layer == LineOfSight.BLOCKER_LAYER){
			go.tag = "Blocker";
		}
		go.AddComponent(BoxCollider);
		go.name = PHYS_PART_NAME;
		colliderPart = go.GetComponent(BoxCollider);
		colliderPart.transform.parent = transform;
		colliderPart.transform.localRotation = Quaternion.identity;
	}
	colliderPart.transform.localPosition = Vector3(0, visStartCenter.y*sizeHandle.y,0);//readjust position
	
	if (customMode){//exist PhysicalPart
		if (colliderPart) physStartExtents = colliderPart.extents;
	}else{
		physStartExtents = meshExtents;
	}
}

@HideInInspector
public var repeatedContainer:GameObject;

@HideInInspector
public var init:boolean = false;
function Init(){
	if (serializedRepObjs!=null){
		Debug.Log("load!");
		repeatedObjs = new Array(serializedRepObjs);
	}
	//curVisPrefab = visualPrefab;//for saved scene
	if (init) return;
	Debug.Log("init!");
	
	gameObject.isStatic = true;
	gameObject.layer = LineOfSight.BLOCKER_LAYER;
	
	if ((!customMode) && visualPrefab){
		createVisual();
	}
	
	initVisual();
	initPhysics();

	//box.extents = meshExtents;
	if (repeatedObjs==null)
		repeatedObjs = new Array();	
	/*var repFind:Transform = transform.Find(REPEATED_PART_NAME);
	if (repFind)
		repeatedContainer = repFind.gameObject;
	if (repeatedContainer!=null){
		GameObject.DestroyImmediate(repeatedContainer);	
	}*/
	
	repeatedContainer = new GameObject();
	repeatedContainer.transform.parent = transform;
	repeatedContainer.transform.localPosition = Vector3.zero;
	repeatedContainer.transform.localRotation = Quaternion.identity;
	repeatedContainer.transform.localScale = Vector3.one;
	repeatedContainer.name = REPEATED_PART_NAME;
		
	//multiple time init
	Reactivate();
	Adjust();
	init = true;
}

function Reactivate(){
	if (!init){//placement on the ground
		startPos = transform.position - (init?fLen*0.5:wallLen) * transform.right;
		endPos = transform.position + (init?fLen*0.5:wallLen) * transform.right;
		startPos.y = 0.5;
		endPos.y = 0.5;
	}
}

@HideInInspector
public var fLen:float = 0;
function Adjust(){
	if (colliderPart)
		colliderPart.gameObject.active = hasCollider;

	if (curVisPrefab != visualPrefab){//prefab change!
		Debug.Log("prefab change");
		if (curVisPrefab == null) init = false;
		//init = false;
		createVisual();
		initVisual();
		initPhysics();
		Reactivate();
		init = true;
	}
	
	if (visualPart == null) return;

	var wLen:Vector3 = (endPos-startPos);
	fLen = wLen.magnitude;
	realScale = Vector3((fLen * 0.5) / wallLen, sizeHandle.y, sizeHandle.z);
	transform.localScale = Vector3.one;
	transform.rotation = Quaternion.FromToRotation(Vector3.right, wLen);
	var up:Vector3 = transform.rotation * Vector3.up;
	transform.position = (startPos+endPos)*0.5 + up*(meshExtents.y - visStartCenter.y)*sizeHandle.y;
	//Debug.Log("up vec"+meshExtents.y +" "+ visStartCenter.y);
	if (repeat){
		var num:int = Mathf.CeilToInt( fLen*0.5 / (sizeHandle.x*wallLen* maxSizeRatio ) );
		var realLen:float = fLen / num;
		visualPart.transform.localScale = Vector3.one;
		visualPart.renderer.enabled = false;
		var change:boolean = false;
		while (repeatedObjs.Count < num){
			var go:GameObject = Instantiate(visualPart.gameObject, Vector3.zero, Quaternion.identity);
			go.renderer.enabled = true;
			go.isStatic = true;
			go.transform.parent = repeatedContainer.transform;
			go.transform.localRotation = Quaternion.identity;//visStartRotation;
			repeatedObjs.Push(go);
			change = true;
		}
		while (repeatedObjs.Count > num){
			GameObject.DestroyImmediate(repeatedObjs.Pop() as GameObject);
			change = true;
		}
		if (change) serializedRepObjs = repeatedObjs.ToBuiltin(GameObject);
		for (var i:int=0 ; i < repeatedObjs.Count; i++){
			var wallElem:GameObject = (repeatedObjs[i] as GameObject);
			wallElem.transform.localPosition = Vector3(realLen*i - fLen*0.5 + 0.5*realLen /*- visStartCenter.x*/, 0, 0);
			wallElem.transform.localScale = 
				Vector3.Scale(Vector3((realLen*0.5)/wallLen,sizeHandle.y, sizeHandle.z), visStartScale);
		}
	}else{
		clearRepeatedObjs();
		visualPart.transform.localScale = Vector3.Scale(realScale, visStartScale);
		visualPart.renderer.enabled = true;
	}
	if (colliderPart){
		colliderPart.extents = Vector3.Scale(realScale, physStartExtents);
		colliderPart.transform.localPosition = Vector3(0, visStartCenter.y*sizeHandle.y,0);//readjust position
	}
	//TODO: implement for capsule collider! (which can only partially scale!)
}

private function clearRepeatedObjs(){
	while (repeatedObjs.Count > 0){
		GameObject.DestroyImmediate(repeatedObjs.Pop());
	}
}