#pragma strict
public var weapons: MonoScript[];

private var ws: Weapon[];
function Awake(){
	ws = new Weapon[1];
	ws[0] = ScriptableObject.CreateInstance(weapons[0].GetClass());
	//ws[0].saySth();
}

function Update () {
#if UNITY_IPHONE || UNITY_ANDROID

#else
	if (ws[0].needPosition){
	}else{
		
	}
#endif
}