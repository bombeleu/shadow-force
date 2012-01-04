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

public var checkPoints : System.Collections.Generic.List.<CheckPoint> = new System.Collections.Generic.List.<CheckPoint> ();
//public var checkPoints : CheckPoint[];
private var _currentCheckPoint : int  = 0 ;
public var checkPointPrefab : CheckPoint;


function Start () {
	// deactivate all checkpoints;
	for (var cp : CheckPoint in checkPoints)
	{
		DeactivateCheckPoint(cp);
	}
	if (checkPoints.Count>0)
		ActivateCheckPoint(checkPoints[_currentCheckPoint]);
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
	if (cp == checkPoints[_currentCheckPoint])
	{
		DeactivateCheckPoint(cp);
		_currentCheckPoint++;
		if (_currentCheckPoint >= checkPoints.Count)
		{
			_currentCheckPoint = -1;
		} else
		{
			ActivateCheckPoint(checkPoints[_currentCheckPoint]);
		}
	}
}

function GetIndexOfCheckPoint (point : CheckPoint) {
	for (var i : int = 0; i < checkPoints.Count; i++) {
		if (checkPoints[i] == point)
			return i;
	}
	return -1;
}

public function RemoveCheckPointAt(index :int) : GameObject
{
	var go : GameObject = checkPoints[index].gameObject;
	checkPoints.RemoveAt (index);
	DestroyImmediate (go);
}

public function InsertCheckPointAt(index : int) : GameObject
{
	//var go  = new GameObject ("CheckPoint", CheckPoint);
	var cp = Instantiate(checkPointPrefab,Vector3.zero,Quaternion.identity);
	cp.transform.parent = transform;
	cp.tutorial = this;
	// add default 1 popup to checkpoint
	var ggo  = new GameObject("PopupMessage",PopupMessage);
	ggo.transform.parent = cp.gameObject.transform;
	cp.AddPopup(ggo.GetComponent.<PopupMessage>());
	
	//
	var count : int = checkPoints.Count;
	
	if (count < 2) {
		cp.transform.localPosition = Vector3.zero;
		checkPoints.Add(cp);
	}
	else {
		var prevIndex : int = index - 1;
		if (prevIndex < 0)
			prevIndex += count;
		
		cp.transform.position = (
			checkPoints[prevIndex].transform.position
			+ checkPoints[index].transform.position
		) * 0.5;
	
		Debug.Log("Index:"+ index);
		checkPoints.Insert(index, cp);
	}
	
	return cp.gameObject;
}