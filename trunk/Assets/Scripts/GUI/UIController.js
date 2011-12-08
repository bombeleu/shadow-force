#pragma strict
@script RequireComponent (MainMenu)
@script RequireComponent (SelectWeaponGUI)
//@script RequireComponent (ConnectionGUI)


private var mainMenu : MainMenu;
private var selectWeaponGUI : SelectWeaponGUI;

enum GUIState {
	None,
	SelectWeapon,
	Connection
};

public var state : GUIState = GUIState.SelectWeapon;

function Awake() {
	DontDestroyOnLoad(gameObject);
	//mainMenu = new MainMenuC();
	mainMenu = GetComponent.<MainMenu>();
	//connectionGUI = GetComponent.<ConnectionGUI>();
	selectWeaponGUI = GetComponent.<SelectWeaponGUI>();
	
	curGUI = mainMenu as ScreenGUI;
}

function OnGUI() {
	if (curGUI)
		curGUI.DrawGUI();
	/*switch (state)
	{
		case GUIState.SelectWeapon:
			selectWeaponGUI.DrawGUI();
			if (selectWeaponGUI.finished)
			{
				state = GUIState.Connection;
			}
			break;
		case GUIState.Connection:
			connectionGUI.DrawGUI();
			break;
	}*/
}
public class ScreenGUI extends MonoBehaviour{
	function DrawGUI(){};
}
private static var curGUI : ScreenGUI;
function SetCurrentGUI(gui : ScreenGUI){
	curGUI = gui;
}