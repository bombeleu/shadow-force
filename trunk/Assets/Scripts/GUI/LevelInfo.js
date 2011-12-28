#pragma strict

public var weapon0 : Weapon;
public var weapon1 : Weapon;

function Awake(){//this function is called when the level is loaded, always after SelectWeaponGUI is initialized
	var selector:SelectWeaponGUI = GameObject.FindObjectOfType(SelectWeaponGUI);
	if (!NetworkU.UseNet){//only for single player mode!
		for (var i:int = 0; i < selector.availableWeapons.Length; i++){
			var wp:Weapon = selector.availableWeapons[i];
			if (wp==weapon0) selector.selectedWeapons[0] = i;
			if (wp==weapon1) selector.selectedWeapons[1] = i;
		}
		Debug.Log("level info finished");
	}
	selector.SendMessage("OnNetworkLoadedLevel",	SendMessageOptions.DontRequireReceiver);//cause selector and instantiate are ont the same obj
}