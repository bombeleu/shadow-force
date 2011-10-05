public var lifeTime:float = 1;
private var timer:float;

function Awake(){
	timer = Time.time;
}

function Update () {
	if (Time.time - timer > lifeTime)
		Spawner.Destroy (gameObject);
		//Network.Destroy(networkView.viewID);
}
