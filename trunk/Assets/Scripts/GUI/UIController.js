#pragma strict
@script RequireComponent (SelectWeaponGUI)
@script RequireComponent (ConnectionGUI)

private var connectionGUI : ConnectionGUI;
private var selectWeaponGUI : SelectWeaponGUI;

enum GUIState {
	None,
	SelectWeapon,
	Connection
};

public var state : GUIState = GUIState.SelectWeapon;

function Start() {
	connectionGUI = GetComponent.<ConnectionGUI>();
	selectWeaponGUI = GetComponent.<SelectWeaponGUI>();
}

function OnGUI() {
	switch (state)
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
	}
}