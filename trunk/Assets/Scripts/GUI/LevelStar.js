#pragma strict

@script RequireComponent (Collider)
private var mainMenu : MainMenu;

function Awake(){
	mainMenu = GameObject.FindObjectOfType(MainMenu);
}

function OnTriggerEnter (other : Collider) {
    if (other.gameObject.CompareTag("Player")){
    	mainMenu.GainStar();
    	DestroyObject(gameObject);
    }
}
