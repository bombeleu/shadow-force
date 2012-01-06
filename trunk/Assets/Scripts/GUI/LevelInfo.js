#pragma strict

public var weapon0 : Weapon;
public var weapon1 : Weapon;
public var levelTesterPrefab:GameObject;

private var testing:boolean = false;
private var selector:SelectWeaponGUI;
function Awake(){//this function is called when the level is loaded, always after SelectWeaponGUI is initialized
	Debug.Log("level is loaded!");
	
	if (MainMenu.state == MainMenu.MenuState.Single){
		var go:GameObject = Instantiate(levelTesterPrefab, Vector3.zero, Quaternion.identity);
		go.transform.parent = transform;
		selector = go.GetComponent(SelectWeaponGUI);
		testing = true;
		Debug.Log("testing mode");
		//return;
	}else
		selector = GameObject.FindObjectOfType(SelectWeaponGUI);
	if (!NetworkU.UseNet){//only for single player mode!
		for (var i:int = 0; i < selector.availableWeapons.Length; i++){
			var wp:Weapon = selector.availableWeapons[i];
			if (wp==weapon0){
				selector.selectedWeapons[0] = i;
				Debug.Log("first weapon: "+i);
			}
			if (wp==weapon1){
				selector.selectedWeapons[1] = i;
				Debug.Log("second weapon: "+i);
			}
		}
		Debug.Log("level info finished");
	}
	selector.SendMessage("OnNetworkLoadedLevel",	SendMessageOptions.DontRequireReceiver);//cause selector and instantiate are ont the same obj
}

function OnGUI(){
	if (testing)
		selector.DrawGUI();
}