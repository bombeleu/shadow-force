#pragma strict

// for customizing control each level
// ex: create dynamic object, lock/unlock objects per level progress, etc
// each level to have each of
public class TutorialLevelController
{

}


public var checkPoints : CheckPoint[];
private var _currentCheckPoint : int  = 0 ;
public static var Instance : TutorialManager;

function Awake()
{
	Instance = this;
}

function Start () {
	// deactivate all checkpoints;
	for (var cp : CheckPoint in checkPoints)
	{
		DeactivateCheckPoint(cp);
	}
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
		if (_currentCheckPoint >= checkPoints.Length)
		{
			_currentCheckPoint = -1;
		} else
		{
			ActivateCheckPoint(checkPoints[_currentCheckPoint]);
		}
	}
}
