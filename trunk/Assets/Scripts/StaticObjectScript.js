#pragma strict
//@script ExecuteInEditMode()

public var editorSupport:boolean = false;

public var visualPart:MeshFilter;
public var colliderPart:BoxCollider;//TODO: capsule?
public var repeat:boolean = false;
public var maxSizeRatio:float = 1.25;
public var customMode:boolean = false;

public var visualPrefab:MeshFilter;
private var curVisPrefab:MeshFilter;

private var box:BoxCollider;
private var meshExtents:Vector3;
private var realScale:Vector3 = Vector3.one;
private var visStartScale:Vector3;
private var visStartCenter:Vector3;
//private var visStartRotation:Quaternion;
private var physStartExtents:Vector3;

private var wallLen:float;
private var repeatedObjs:Array;

@HideInInspector
public var startPos:Vector3;
@HideInInspector
public var endPos:Vector3;
@HideInInspector
public var sizeHandle:Vector3 = Vector3.one;

private function createVisual(){
	if (visualPart!=null){
		GameObject.DestroyImmediate(visualPart.gameObject);
		if (repeatedObjs!=null){
			clearRepeatedObjs();
		}
	}
	curVisPrefab = visualPrefab;
	visualPart = Instantiate(curVisPrefab, Vector3.zero, Quaternion.identity);
	visualPart.transform.parent = transform;
	visualPart.transform.localPosition = Vector3.zero;
	visualPart.transform.localRotation = Quaternion.identity;
	visualPart.transform.localScale = Vector3.one;

	//remove the default MeshCollider
	var collider:Collider = visualPart.GetComponent(Collider);
	if (collider) GameObject.DestroyImmediate(collider);
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
	if ((!customMode) && (colliderPart==null)){
		var go:GameObject = new GameObject();
		go.AddComponent(BoxCollider);
		go.name = "PhysicPart";
		colliderPart = go.GetComponent(BoxCollider);
		colliderPart.transform.parent = transform;
		colliderPart.transform.localRotation = Quaternion.identity;
	}
	colliderPart.transform.localPosition = visStartCenter;//readjust position
	box = colliderPart as BoxCollider;
	if (box){ 
		if (customMode)
			physStartExtents = box.extents;
		else
			physStartExtents = meshExtents;
		
	}
}

private var init:boolean = false;
function Init(){
	if (init) return;
	
	if ((!customMode) && visualPrefab){
		createVisual();
	}
	
	initVisual();
	initPhysics();

	//box.extents = meshExtents;
	repeatedObjs = new Array();	
	
	//multiple time init
	Reactivate();
	Adjust();
	init = true;
}

function Reactivate(){
	startPos = transform.position - (init?fLen*0.5:wallLen) * transform.right;
	endPos = transform.position + (init?fLen*0.5:wallLen) * transform.right;
	if (init){//reactivate
		startPos -= transform.up*(meshExtents.y- visStartCenter.y)*sizeHandle.y;
		endPos -= transform.up*(meshExtents.y- visStartCenter.y)*sizeHandle.y;
	//Debug.Log("shift "+meshExtents.y);
	}else{//placement on the ground
		startPos.y = 0.5;
		endPos.y = 0.5;
	}
}

private var fLen:float;
function Adjust(){
	if (curVisPrefab != visualPrefab){//prefab change!
		Debug.Log("prefab change");
		init = false;
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
		var num:int = Mathf.CeilToInt( fLen / (wallLen*2* maxSizeRatio ) );
		var realLen:float = fLen / num;
		visualPart.transform.localScale = Vector3.one;
		visualPart.renderer.enabled = false;
		while (repeatedObjs.Count < num){
			var go:GameObject = Instantiate(visualPart.gameObject, Vector3.zero, Quaternion.identity);
			go.renderer.enabled = true;
			go.transform.parent = transform;
			go.transform.localRotation = Quaternion.identity;//visStartRotation;
			repeatedObjs.Push(go);
		}
		while (repeatedObjs.Count > num){
			GameObject.DestroyImmediate(repeatedObjs.Pop() as GameObject);
		}
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
	var box:BoxCollider = colliderPart as BoxCollider;
	if (box){
		box.extents = Vector3.Scale(realScale, physStartExtents);
	}
	//TODO: implement for capsule collider! (which can only partially scale!)
}

private function clearRepeatedObjs(){
	while (repeatedObjs.Count > 0){
		GameObject.DestroyImmediate(repeatedObjs.Pop());
	}
}