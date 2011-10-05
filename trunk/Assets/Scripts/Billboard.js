
function Update () {
	transform.LookAt(Camera.main.transform.position);
	transform.rotation *= Quaternion.AngleAxis(180, Vector3.up);
}
