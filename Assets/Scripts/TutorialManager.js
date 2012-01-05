#pragma strict

// for customizing control each level
// ex: create dynamic object, lock/unlock objects per level progress, etc
// each level to have each of
public class TutorialLevelController
{

}

//#if UNITY_FLASH
//public var checkPoints : ArrayList = new ArrayList();
//#else
//public var checkPoints : List.<CheckPoint> = new List.<CheckPoint>();
//#endif

private var _checkPoints : ArrayList = new ArrayList();
public var checkPoints : CheckPoint[];
public var isSequential : boolean = true;
private var _currentCheckPoint : int  = 0 ;
//public var checkPointPrefab : CheckPoint;


function Awake()
{
	Debug.Log("check points:" + checkPoints.Length);
}

function Start () {
	Debug.Log(checkPoints.Length);
	// deactivate all checkpoints;
	if (isSequential)
	{
		for (var cp : CheckPoint in checkPoints)
		{
			DeactivateCheckPoint(cp);
		}
		if (checkPoints.Length>0)
			ActivateCheckPoint(checkPoints[_currentCheckPoint]);
	} else
	{
		for (var cp : CheckPoint in checkPoints)
		{
			ActivateCheckPoint(cp);
		}
	}
}

function Update () {
	
}

function DeactivateCheckPoint(cp : CheckPoint)
{
	cp.gameObject.active = false;
}

function ActivateCheckPoint(cp : CheckPoint)
{
	cp.gameObject.active = true;
}

public function ReachCheckPoint(cp : CheckPoint)
{
	if (isSequential)
	{
		if (cp == checkPoints[_currentCheckPoint])
		{
			DeactivateCheckPoint(cp);
			_currentCheckPoint++;
			if (_currentCheckPoint >= checkPoints.Length)
			{
				_currentCheckPoint = -1;
			} else
			{
				ActivateCheckPoint(checkPoints[_currentCheckPoint]);
			}
		}
	} else
	{
		DeactivateCheckPoint(cp);
	}
}

function GetIndexOfCheckPoint (point : CheckPoint) {
	for (var i : int = 0; i < checkPoints.Length; i++) {
		if (checkPoints[i] == point)
			return i;
	}
	return -1;
}

private function SyncArray()
{
	var i : int = 0;
	checkPoints = new CheckPoint[_checkPoints.Count];
	for (var cp : CheckPoint in _checkPoints)
	{
		checkPoints[i++] = cp;
	}
}

public function RemoveCheckPointAt(index :int) : GameObject
{
	var go : GameObject = (checkPoints[index] as CheckPoint).gameObject;
	Debug.Log(_checkPoints.Count);
	_checkPoints.RemoveAt (index);
	DestroyImmediate (go);
	SyncArray();
}

public function ClearCheckPoints()
{
	_checkPoints.Clear();
	checkPoints = null;
}

public function InsertCheckPointAt(index : int) : GameObject
{
	//var go : GameObject  = new GameObject ("CheckPoint");
	var go : GameObject = GameObject.CreatePrimitive(PrimitiveType.Plane);
	go.name = "Check Point";
	var mCollider : MeshCollider = (go.GetComponent(MeshCollider));
	DestroyImmediate(mCollider);
	go.transform.localScale = Vector3(0.2,0.2,0.2);
	go.transform.localRotation = Quaternion.AngleAxis(45,Vector3.right);

	var boxCollider : BoxCollider = go.AddComponent(BoxCollider);
	boxCollider.size = Vector3(10,10,10);
	
	go.renderer.material = Resources.Load("info-gui") as Material;
	
	var cp = go.AddComponent(CheckPoint);

	// add visual
	//var meshFilter : MeshFilter = go.AddComponent(MeshFilter);
	//go.AddComponent(MeshRenderer);
	//go.renderer.material = Resources.Load("info-gui") as Material;
	//
	
	boxCollider.isTrigger = true;
	
	//var cp = go.GetComponent(CheckPoint);
	//var cp = Instantiate(checkPointPrefab,Vector3.zero,Quaternion.identity);
	cp.transform.parent = transform;
	cp.tutorial = this;
	// add default 1 popup to checkpoint
	var ggo  = new GameObject("PopupMessage",PopupMessage);
	ggo.transform.parent = cp.gameObject.transform;
	cp.AddPopup(ggo.GetComponent.<PopupMessage>());
	
	//	
	var count : int = 0;
	if (checkPoints) count =  checkPoints.Length;
	
	if (count >= 0) {
		cp.transform.localPosition = Vector3.zero;
		//checkPoints.Add(cp);
		_checkPoints.Insert(index,cp);
	}
//	else {
//		var prevIndex : int = index - 1;
//		if (prevIndex < 0)
//			prevIndex += count;
//		Debug.Log(prevIndex + "----" + index);
//		cp.transform.position = (
//			(checkPoints[prevIndex] as CheckPoint).transform.position
//			+ (checkPoints[index] as CheckPoint).transform.position
//		) * 0.5;
//	
//		Debug.Log("Index:"+ index);
//		checkPoints.Insert(index, cp);
//	}
	SyncArray();
	return cp.gameObject;
}