#pragma strict

@script RequireComponent (Collider)
private var mainMenu : MainMenu;

function Awake(){
	mainMenu = GameObject.FindObjectOfType(MainMenu);
}

function OnTriggerEnter (other : Collider) {
    if (other.gameObject.CompareTag("Player")){
    	if (mainMenu) mainMenu.GainStar();
    	DestroyObject(gameObject);
    }
}
