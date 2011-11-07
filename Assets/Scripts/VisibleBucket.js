#pragma strict
public var visibleObjects:GameObject[];
public var recursive:boolean = false;

function OnSetVisible(visi:boolean){
	for (var obj:GameObject in visibleObjects){
		if (recursive){
			var rr = obj.GetComponentsInChildren(Renderer);
			for (var r:Renderer in rr)
				r.enabled = visi;
		}else
			obj.GetComponent.<Renderer>().enabled = visi;	
	}
}