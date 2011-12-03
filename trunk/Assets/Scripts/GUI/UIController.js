public var connectionGUI : ConnectionGUI;
public var selectWeaponGUI : SelectWeaponGUI;

enum GUIState {
	SelectWeapon,
	Connection
};

public static var guiState : GUIState = GUIState.Connection;

function Update () {

}

function OnGUI() {
	switch (guiState)
	{
		case GUIState.SelectWeapon:
			selectWeaponGUI.DrawGUI();
			break;
		case GUIState.Connection:
			connectionGUI.DrawGUI();
			break;
	}
}