#pragma strict
@script RequireComponent (Team)

function CheckObserver(seer:Observer, viobj:Visibility):boolean{
	if (seer.gameObject == viobj.gameObject) return false;//not counted!
	if (!seer.enabled) return false;
	//Debug.Log("get here 1");
	if (seer.team.team == viobj.GetComponent.<Team>().team){//only check allies vision
		return false;
	}
	//Debug.DrawLine(transform.position, p.transform.position, Color.white, 3);
	var sl = seer;
	var local_visi : boolean = false;
	if (sl){
		var localPos :Vector3 = sl.transform.worldToLocalMatrix.MultiplyPoint(viobj.transform.position);
		var angle : float;
		var axis : Vector3;
		Quaternion.FromToRotation(Vector3(0,0,1), localPos).ToAngleAxis(angle, axis);
		//Debug.Log("angle "+angle);
		local_visi = angle <= seer.angle/2;//45;
	}
	if (local_visi){
		var hitInfo = RaycastHit ();
		var dir : Vector3 = viobj.transform.position - seer.transform.position;
		Physics.Raycast (seer.transform.position, dir, hitInfo/*, Mathf.Infinity, 1 << 8*/);
		if (hitInfo.transform){
			if (hitInfo.distance > seer.range)
				local_visi = false;
			else{
				var target : Visibility = hitInfo.transform.GetComponent.<Visibility> ();
				//local_visi = target != null;
				local_visi = target == viobj;
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

private var myTeam:int;

function Update () {
	myTeam = GetComponent.<Team>().team;
	//Debug.DrawLine(new Vector3(-5,0,13), new Vector3(-5,10,13), Color.white, 0);
	//var players = GameObject.FindGameObjectsWithTag ("Player");
	var players : Observer[] = GameObject.FindObjectsOfType(Observer) as Observer[];
	var visiobjs : Visibility[]= GameObject.FindObjectsOfType(Visibility) as Visibility[];
	
	var wantEvents : Array = new Array();
	var wantNoEvents : Array = new Array();
	for (var wantEvent:Observer in players){
		if (wantEvent.wantEventTrigger)
			wantEvents.Push(wantEvent);
		else
			wantNoEvents.Push(wantEvent);		
	}
	
	/*Debug.Log(players.length);
	Debug.Log(wantEvents.length);
	Debug.Log(wantNoEvents.length);*/
	
	//Debug.Log(players.GetLength());
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
		/*
		var rr = p.GetComponentsInChildren(Renderer);
		for (var r:Renderer in rr){
			r.enabled = visi;
		}
		var ll= p.GetComponentsInChildren(Light);
		for (var l:Light in ll){
			l.enabled = visi;
		}//*/
		//p.active = visi;
		//Debug.Log("see "+visi, gameObject);
	}
}