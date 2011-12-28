#pragma strict
@script RequireComponent (Collider)

var msgID : int = 0;
var imgIndicator : Texture;

function Awake(){
	
}

function OnEnable()
{
	PopupManager.Instance.AddPopupMessage(msgID);
}

function OnTriggerEnter (other : Collider) {
	Debug.Log("enter");
    if (other.gameObject.CompareTag("Player")){
    	TutorialManager.Instance.ReachCheckPoint(this);
    }
}

function OnGUI()
{
	// draw marker here
	var screenPos : Vector2 = Camera.main.WorldToScreenPoint(gameObject.transform.position );
	GUI.DrawTexture(new Rect(screenPos.x,Screen.height - screenPos.y,50,50),imgIndicator);
}