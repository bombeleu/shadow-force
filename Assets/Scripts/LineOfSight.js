function Update () {
	var myTeam = (GetComponent("Team") as Team).team;
	
	//Debug.DrawLine(new Vector3(-5,0,13), new Vector3(-5,10,13), Color.white, 0);
	var players = GameObject.FindGameObjectsWithTag ("Player");
	//Debug.Log(players.GetLength());
	for (var p in players){
		var visi : boolean = false;
		if ((p.GetComponent("Team")as Team).team == myTeam){
			visi = true;
			continue;
		}
		for (var seer in players){
			//Debug.Log("get here 1");
			if (/*!p.networkView.isMine p!=gameObject)*/(seer.GetComponent("Team")as Team).team != myTeam){
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
				local_visi = angle <= 45;
			}
			if (local_visi){
				var hitInfo = RaycastHit ();
				var dir : Vector3 = p.transform.position - seer.transform.position;
				Physics.Raycast (seer.transform.position, dir, hitInfo);
				if (hitInfo.transform){
					var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
					//var pl = p.Find("player");
					//var sl = gameObject.Find("SpotLight");
					local_visi = targetHealth != null;
				}
			}
			visi = visi || local_visi;
			if (visi) break;
		}
		//*
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