#pragma strict

class MaterialImpact {
	var physicMaterial : PhysicMaterial;
	var playerFootstepSounds : AudioClip[];
	var mechFootstepSounds : AudioClip[];
	var spiderFootstepSounds : AudioClip[];
	var bulletHitSounds : AudioClip[];
}

class MaterialImpactManager extends MonoBehaviour {
	var materials : MaterialImpact[];
	
	private static var dict : System.Collections.Generic.Dictionary.<PhysicMaterial, MaterialImpact>;
	private static var defaultMat : MaterialImpact;
	
	function Awake () {
		return;//TODO: enable this to get sound!
		Debug.Log("mat 1");
		defaultMat = materials[0];
		
		Debug.Log("mat 2");
		dict = new System.Collections.Generic.Dictionary.<PhysicMaterial, MaterialImpact> ();
		Debug.Log("mat 3");

		for (var i : int = 0; i < materials.Length; i++) {
			dict.Add (materials[i].physicMaterial, materials[i]);
		}
		Debug.Log("mat 4");
	}
	
	static function GetPlayerFootstepSound (mat : PhysicMaterial) : AudioClip {
		var imp : MaterialImpact = GetMaterialImpact (mat);
		return GetRandomSoundFromArray(imp.playerFootstepSounds);
	}
	
	static function GetMechFootstepSound (mat : PhysicMaterial) : AudioClip {
		var imp : MaterialImpact = GetMaterialImpact (mat);
		return GetRandomSoundFromArray(imp.mechFootstepSounds);
	}
	
	static function GetSpiderFootstepSound (mat : PhysicMaterial) : AudioClip {
		var imp : MaterialImpact = GetMaterialImpact (mat);
		return GetRandomSoundFromArray(imp.spiderFootstepSounds);
	}
	
	static function GetBulletHitSound (mat : PhysicMaterial) : AudioClip {
		var imp : MaterialImpact = GetMaterialImpact (mat);
		return GetRandomSoundFromArray(imp.bulletHitSounds);
	}
	
	static function GetMaterialImpact (mat : PhysicMaterial) : MaterialImpact {
		if (mat && dict.ContainsKey (mat))
			return dict[mat];
		return defaultMat;
	}
	
	static function GetRandomSoundFromArray (audioClipArray : AudioClip[]) : AudioClip {
		if (audioClipArray.Length > 0)
			return audioClipArray[Random.Range (0, audioClipArray.Length)];
		return null;
	}
}
