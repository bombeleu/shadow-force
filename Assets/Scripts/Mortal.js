#pragma strict
@script RequireComponent (NetworkView)

public var explosionPrefab : GameObject;

function OnDead():void{//this func is already called form an RPC, no need to do RPC
	DestroyObject(gameObject);
	Instantiate(explosionPrefab, transform.position, transform.rotation);
}
