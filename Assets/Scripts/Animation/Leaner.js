#pragma strict
//@script RequireComponent (CharacterController)

public var playerAnimation : PlayerAnimation;
private var radius : Vector3;

function Awake(){
	var r:float;
	if (collider as CharacterController) r = (collider as CharacterController).radius;
	if (collider as CapsuleCollider) r = (collider as CapsuleCollider).radius;
	
	radius = Vector3(r,r,r);
}

private var leaning:boolean = false;
private var leanNormal:Vector3;
private var leanRight:boolean;

function check(collision : Collision){
	if (leaning) return;
    for (var contact : ContactPoint in collision.contacts){
    	var box : BoxCollider = contact.otherCollider as BoxCollider;
    	if (box && box.gameObject.CompareTag("Blocker")){
    		var localP : Vector3 = box.transform.worldToLocalMatrix.MultiplyPoint(contact.point);
    		localP.Scale(box.transform.localScale);
    		var sign:float = localP.x*localP.z;
    		localP.x = Mathf.Abs(localP.x);
    		localP.z = Mathf.Abs(localP.z);
    		var size : Vector3 = Vector3.Scale(box.size,box.transform.localScale) * 0.5 - 0.5*radius;
    		var downSize : Vector3 = size - 1.5*radius;
    		/*Debug.Log(localP);
    		Debug.Log(size);*/
    		var x_axis:boolean = (localP.x > downSize.x && localP.x < size.x);
    		var z_axis:boolean = (localP.z > downSize.z && localP.z < size.z);
    		
    		if (x_axis || z_axis){
    			leanRight = x_axis?sign > 0:sign < 0;
    			leanNormal = contact.normal;
    			leaning = true;
    			break;
    		}
    	}
    }
}
/*
function OnCollisionEnter(collision : Collision) {
	check(collision);
}*/

function OnCollisionStay(collision : Collision) {
	check(collision);
}

private var leanPos:Vector3;
function OnControllerColliderHit (hit : ControllerColliderHit) : void{
	if (leaning) return;
	var box : BoxCollider = hit.collider as BoxCollider;
	if (box && box.gameObject.CompareTag("Blocker")){
		var localP : Vector3 = box.transform.worldToLocalMatrix.MultiplyPoint(hit.point);
		localP.Scale(box.transform.localScale);
		var sign:float = localP.x*localP.z;
		localP.x = Mathf.Abs(localP.x);
		localP.z = Mathf.Abs(localP.z);
		var size : Vector3 = Vector3.Scale(box.size,box.transform.localScale) * 0.5 - 0.5*radius;
		var downSize : Vector3 = size - 1.5*radius;
		/*Debug.Log(localP);
		Debug.Log(size);*/
		var x_axis:boolean = (localP.x > downSize.x && localP.x < size.x);
		var z_axis:boolean = (localP.z > downSize.z && localP.z < size.z);
		
		if (x_axis || z_axis){
			leanRight = x_axis?sign > 0:sign < 0;
			leanNormal = hit.normal;
			leaning = true;
			leanPos = transform.position;
			return;
		}
	}
}

public var weaponManager:WeaponManager;
function FixedUpdate(){
	if (leaning){
		playerAnimation.Lean(leanNormal, leanRight);
		weaponManager.Lean();
	}else{
		playerAnimation.ExitLean();
		weaponManager.ExitLean();
	}
	if ((transform.position - leanPos).sqrMagnitude > 0.04)
		leaning = false;
}
