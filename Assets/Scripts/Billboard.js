
function Update () {
	//transform.LookAt(Camera.main.transform.position);
	transform.rotation = Quaternion.LookRotation(Camera.main.transform.forward, Camera.main.transform.up);
}
