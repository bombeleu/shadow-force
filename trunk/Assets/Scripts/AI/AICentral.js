public var dodger:DodgingAI;
public var patroller:PatrolMoveController;

function Update () {
	patroller.enabled = !dodger.IsActive();
}
