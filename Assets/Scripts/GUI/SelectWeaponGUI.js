#pragma strict
@script RequireComponent (UIController)

class SelectWeaponGUI extends ScreenGUI{
	public var availableWeapons: Weapon[];

	@HideInInspector
	public var selectedWeapons : int[];
	
	@HideInInspector
	public var finished : boolean;
	
	private var nWeapons : int;
	
	function Awake()
	{
		nWeapons = 0;
		selectedWeapons = new int[2];
		finished = false;
	}
	
	function DrawGUI() {
		GUILayout.Label("Choose 2 weapons");
	
		if (GUILayout.Button("MachineGun"))
		{
			ChooseWeapon(0);
		}
		if (GUILayout.Button("BoltGun"))
		{
			ChooseWeapon(1);
		}
		if (GUILayout.Button("GrenadeLaunch"))
		{
			ChooseWeapon(2);
		}
		if (GUILayout.Button("StickyCam"))
		{
			ChooseWeapon(3);
		}
		if (GUILayout.Button("ShotGun"))
		{
			ChooseWeapon(4);
		}
		if (GUILayout.Button("Turret"))
		{
			ChooseWeapon(5);
		}
		if (GUILayout.Button("SmokeGrenade"))
		{
			ChooseWeapon(6);
		}	
	}
	function ChooseWeapon(weaponID : int)
	{
		if (nWeapons == 0)
		{
			selectedWeapons[0] = weaponID;
		} else if (weaponID != selectedWeapons[0])
		{
			selectedWeapons[1] = weaponID;
		} else
		{
			return;
		}
		nWeapons++;
		if (nWeapons >= 2)
		{
			finished = true;
			GetComponent(UIController).SetCurrentGUI(GetComponent(ConnectionGUI));
		}
	}
}