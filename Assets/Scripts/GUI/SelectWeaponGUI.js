public var selectedWeapons : GameObject[];
private var nWeapons : int;
public var availableWeapons: GameObject[];
public var finished : boolean;
function Start()
{
	nWeapons = 0;
	selectedWeapons = new GameObject[2];
	finished = false;
}

function Update () {
}

function DrawGUI() {
	GUILayout.Label("Choose 2 weapons");

	if (GUILayout.Button("MachineGun"))
	{
		ChooseWeapon(availableWeapons[0]);
	}
	if (GUILayout.Button("BoltGun"))
	{
		ChooseWeapon(availableWeapons[1]);
	}
	if (GUILayout.Button("GrenadeLaunch"))
	{
		ChooseWeapon(availableWeapons[2]);
	}
	if (GUILayout.Button("StickyCam"))
	{
		ChooseWeapon(availableWeapons[3]);
	}
	if (GUILayout.Button("ShotGun"))
	{
		ChooseWeapon(availableWeapons[4]);
	}
	
}
function ChooseWeapon(weapon : GameObject)
{
	if (nWeapons == 0)
	{
		selectedWeapons[0] = weapon;
	} else if (weapon != selectedWeapons[0])
	{
		selectedWeapons[1] = weapon;
	} else
	{
		return;
	}
	nWeapons++;
	if (nWeapons >= 2)
	{
		finished = true;
	}
}
