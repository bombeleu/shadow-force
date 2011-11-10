#pragma strict
@script RequireComponent (Collider)

function OnTriggerEnter (other : Collider) : void
{
	//Debug.Log("noise!");
	var viObj:Visibility = other.gameObject.GetComponent.<Visibility>();
	if (viObj){
		viObj.visibilityType = VisibilityType.Always;
		viObj.SetVisible(true);
	}
}
function OnTriggerExit (other : Collider) : void
{
	//Debug.Log("no noise!");
	var viObj:Visibility = other.gameObject.GetComponent.<Visibility>();
	if (viObj){
		viObj.visibilityType = VisibilityType.TeamShare;
	}
}
