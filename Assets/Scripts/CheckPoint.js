#pragma strict
@script RequireComponent (Collider)

var imgIndicator : Texture;
//var popupMsgs : PopupMessage[];
public var tutorial : TutorialManager;
public var popupMsgs : System.Collections.Generic.List.<PopupMessage> = new System.Collections.Generic.List.<PopupMessage> ();
function Awake(){
	
}

function ShowMessages()
{
	for (var p : PopupMessage in popupMsgs)
		PopupManager.Instance.AddPopupMessage(p);
}

function OnTriggerEnter (other : Collider) {
	Debug.Log("enter");
    if (other.gameObject.CompareTag("Player")){
    	tutorial.ReachCheckPoint(this);
    	ShowMessages();
    }
}

function OnDestroy()
{
	tutorial.checkPoints.RemoveAt(tutorial.GetIndexOfCheckPoint(this));
}

function OnGUI()
{
	// draw marker here
	var screenPos : Vector2 = Camera.main.WorldToScreenPoint(gameObject.transform.position );
	//GUI.DrawTexture(new Rect(screenPos.x,Screen.height - screenPos.y,50,50),imgIndicator);
	GUI.Label(new Rect(screenPos.x,Screen.height - screenPos.y,50,50),"CP");
}

function OnDrawGizmos()
{
	Gizmos.color = Color (1.0, 0f, 0f);
	Gizmos.DrawSphere(transform.position, 0.5f);
}	

public function AddPopup(po : PopupMessage)
{
	popupMsgs.Add(po);
	Debug.Log("Add popup successfully");
}