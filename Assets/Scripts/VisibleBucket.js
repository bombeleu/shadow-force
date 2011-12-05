#pragma strict
@script RequireComponent(FadingEffect)
public var visibleObjects:GameObject[];
public var recursive:boolean = false;

function OnSetVisible(visi:boolean){
	Debug.Log("Enemy set visible:" + visi);
	for (var obj:GameObject in visibleObjects){
		if (recursive){
			var rr : Renderer[] = obj.GetComponentsInChildren.<Renderer>();
			for (var r:Renderer in rr)
				r.enabled = visi;
		}else {
			obj.GetComponent.<Renderer>().enabled = visi;	
		}
	}
	if (!visi)
	{
		gameObject.GetComponent(FadingEffect).FadeOut();
	} else
	{
		gameObject.GetComponent(FadingEffect).FadeIn();
	}
	
}