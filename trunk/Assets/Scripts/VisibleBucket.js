#pragma strict
@script RequireComponent(FadingEffect)
public var visibleObjects:GameObject[];
public var recursive:boolean = false;

private var fade:FadingEffect;
private var visible : boolean = true;

function Awake(){
	fade = GetComponent(FadingEffect);
}

function OnSetVisible(visi:boolean){
	if (visi == visible) return;
	visible = visi;
	//Debug.Log("Enemy set visible:" + visi);
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
		fade.FadeOut();
	} else
	{
		fade.FadeIn();
	}
}