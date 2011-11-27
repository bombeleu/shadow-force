#pragma strict
@script RequireComponent (Weapon)

private var plantingObject: GameObject;
public var plantingTime: float = 2;
public var effect: Renderer;

private var planted:boolean = false;
private var startTime:float;
private var weapon:Weapon;

function Awake(){
	weapon = GetComponent.<Weapon>();
	plantingObject = weapon.bulletPrefab;
}

function Start(){
	effect.enabled = false;
}

function OnLaunchBullet(){
	startTime = Time.time;
	planted = true;
	effect.enabled = true && weapon.isEnable;
}

function Update () {
	if (!planted) return;
	if (Time.time - startTime > plantingTime){
		ConnectionGUI.CreateTeamObject(plantingObject, Network.AllocateViewID(), 
			weapon.owner.transform.position, weapon.owner.transform.rotation, 
			Camera.main.GetComponent.<Team>().team);
		planted = false;
		effect.enabled = false;
		//DestroyObject(gameObject);
	}
}
