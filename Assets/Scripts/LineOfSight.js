#pragma strict
@script RequireComponent (Team)

function Update () {
	var myTeam = GetComponent.<Team>().team;
	
	//Debug.DrawLine(new Vector3(-5,0,13), new Vector3(-5,10,13), Color.white, 0);
	//var players = GameObject.FindGameObjectsWithTag ("Player");
	var players : Observer[] = GameObject.FindObjectsOfType(Observer) as Observer[];
	var visiobjs : Visibility[]= GameObject.FindObjectsOfType(Visibility) as Visibility[];
	//Debug.Log(players.GetLength());
	for (var viobj in visiobjs){
		var p = viobj.gameObject;
		//Debug.Log(p);
		//if (p == gameObject) continue;
		var visi : boolean = false;
		if (viobj.visibilityType == VisibilityType.Always || p.GetComponent.<Team>().team == myTeam){
			visi = true;
			//Debug.Log('same team', viobj);
			//continue;
		}else
			for (var seer : Observer in players){
				if (!seer.GetEnable()) continue;
				//Debug.Log("get here 1");
				if (seer.GetComponent.<Team>().team != myTeam){//only check allies vision
					continue;
				}
				//Debug.DrawLine(transform.position, p.transform.position, Color.white, 3);
				var sl = seer;
				var local_visi : boolean = false;
				if (sl){
					var localPos :Vector3 = sl.transform.worldToLocalMatrix.MultiplyPoint(p.transform.position);
					var angle : float;
					var axis : Vector3;
					Quaternion.FromToRotation(Vector3(0,0,1), localPos).ToAngleAxis(angle, axis);
					//Debug.Log("angle "+angle);
					local_visi = angle <= seer.angle/2;//45;
				}
				if (local_visi){
					var hitInfo = RaycastHit ();
					var dir : Vector3 = p.transform.position - seer.transform.position;
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
				visi = visi || local_visi;
				if (visi) break;
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