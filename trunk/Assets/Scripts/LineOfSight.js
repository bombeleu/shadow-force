#pragma strict
@script RequireComponent (Team)

public var layerMask: LayerMask;
public var revealAll: boolean = false;


public static var BLOCKER_LAYER:int = 18;
function Awake(){
	Physics.IgnoreLayerCollision(0, 11, true);//default vs playertrigger
	Physics.IgnoreLayerCollision(8, 22, true);//player vs smoke
	Physics.IgnoreLayerCollision(19, 20, true);//projectile vs fence
	Physics.IgnoreLayerCollision(19, 22, true);//projectile vs smoke
	Physics.IgnoreLayerCollision(19, 19, true);//projectile vs projectile
	Physics.IgnoreLayerCollision(23, 22, true);//shield vs smoke
	//Physics.IgnoreLayerCollision(8, 23, true);//player vs shield
	Physics.IgnoreLayerCollision(8, 24, true);//player vs ragdoll --> prevent climbing!
	Physics.IgnoreLayerCollision(23, 24, true);//shield vs ragdoll --> prevent climbing!
	Physics.IgnoreLayerCollision(19, 24, true);//projectile vs ragdoll
	Physics.IgnoreLayerCollision(22, 24, true);//smoke vs ragdoll
}

function CheckObserver(seer:Observer, viobj:Visibility):boolean{
	if (seer.gameObject == viobj.gameObject) return false;//not counted!
	if (!seer.enabled) return false;
	//Debug.Log("get here 1");
	if (seer.team.team == viobj.GetComponent.<Team>().team){//only check allies vision
		return false;
	}
	//Debug.DrawLine(transform.position, p.transform.position, Color.white, 3);
	var local_visi : boolean = true;

	//compute distance
	var dir : Vector3 = viobj.transform.position - seer.transform.position;
	var target_dist : float = dir.magnitude;
	if (target_dist > seer.range) local_visi = false;
	
	if (local_visi){
		//compute angle
		var localPos :Vector3 = seer.transform.worldToLocalMatrix.MultiplyPoint(viobj.transform.position);
		var angle : float;
		var axis : Vector3;
		Quaternion.FromToRotation(Vector3(0,0,1), localPos).ToAngleAxis(angle, axis);
		//Debug.Log("angle "+angle);
		local_visi = angle <= seer.angle/2;//45;

		if (local_visi){//check occluder
			var hitInfo = RaycastHit ();
			Physics.Raycast (seer.transform.position, dir, hitInfo, seer.range, layerMask);
			if (hitInfo.transform && hitInfo.distance < target_dist){
				/*var target : Visibility = hitInfo.transform.GetComponent.<Visibility> ();
				local_visi = target == viobj;*///this code is used to check player occlusion
				local_visi = false;
			}
		}
	}
	
	if (seer.wantEventTrigger){
		if (local_visi){
			seer.SendMessage("OnDetectEnemy", viobj);
		}else{
			seer.SendMessage("OnLoseSightEnemy", viobj);
		}
	}
	/*Debug.Log(seer);
	Debug.Log(viobj);
	Debug.Log(local_visi);*/
	return local_visi;
}

public static var myTeam:int;

//public var visibleEnemies

function Update () {
	//myTeam = GetComponent.<Team>().team;
	var visiobjs : Visibility[]= GameObject.FindObjectsOfType(Visibility) as Visibility[];
	if (revealAll){
		for (var viobj in visiobjs){
			viobj.SetVisible(true);
		}
		return;
	}
	var players : Observer[] = GameObject.FindObjectsOfType(Observer) as Observer[];
	
	var wantEvents : Array = new Array();
	var wantNoEvents : Array = new Array();
	for (var wantEvent:Observer in players){
		if (wantEvent.wantEventTrigger)
			wantEvents.Push(wantEvent);
		else
			wantNoEvents.Push(wantEvent);		
	}

	for (var viobj in visiobjs){
		if (!viobj.enabled) continue;
		//var p = viobj.gameObject;
		//Debug.Log(p);
		//if (p == gameObject) continue;
		var visi : boolean = false;
		if (viobj.visibilityType == VisibilityType.Always){
			visi = true;
		}else if (viobj.GetComponent.<Team>().team == myTeam){
			visi = true;
			for (var seer : Observer in wantEvents){
				if (seer.team.team != myTeam)
					CheckObserver(seer, viobj);
			}
		}else{
			var local_visi:boolean;
			for (var seer : Observer in wantEvents){
				//Debug.Log('checking');
				local_visi = CheckObserver(seer, viobj);
				visi = visi || local_visi;
				//if (visi) break;
			}
			if (!visi){
				for (var seer : Observer in wantNoEvents){
					local_visi = CheckObserver(seer, viobj);
					visi = visi || local_visi;
					if (visi) break;
				}
			}
		}
		//if (!visi) Debug.Log('hidden', viobj);
		viobj.SetVisible(visi);
	}
}