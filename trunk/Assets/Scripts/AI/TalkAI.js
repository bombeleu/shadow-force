#pragma strict

public var visi:Visibility;
public var text:TextMesh;

public enum TalkType{
	None,
	Patrol,
	PatrolNotChase,
	PatrolBack,
	Chase,
	NotChase,
	Shoot,
	Dodge,
	Block,
	Kill
}
private var saying:boolean = false;
private var lastSentence:TalkType = TalkType.None;
private var startTime:float = -1;
private var reveal:boolean = false;
function Say(sentence:TalkType){
	if (text==null) return;//dead already
	if ( (sentence != TalkType.Kill) &&
		(lastSentence == sentence || 
		sentence == TalkType.Patrol || sentence == TalkType.PatrolNotChase || sentence == TalkType.Shoot ||
		sentence == TalkType.None || 
		lastSentence == TalkType.Block || lastSentence == TalkType.Chase)){
		if (saying) return;
	}
	var str:String;
	var emphasize:boolean = false;
	switch (sentence){
		case TalkType.Patrol:
			str = RandomStr(["Cardio's good", "For my 6pak", "Will chase u"]);
			break;
		case TalkType.PatrolNotChase:
			str = RandomStr(["Wont leave position", "No trepassing", "Defend here"]);
			break;
		case TalkType.PatrolBack:
			str = RandomStr(["Gotta leave", "Nothing here?", "Hmm, strange .."]);
			break;
		case TalkType.Chase:
			str = RandomStr(["Stop coward!", "See ya", "Wait there", "Think u can run?"]);
			emphasize = true;
			if (visi.visibilityType == VisibilityType.TeamShare){
				reveal = true;
				visi.visibilityType = VisibilityType.Reveal;
				//Debug.Log("reveal!");
			}
			break;
		case TalkType.NotChase:
			str = RandomStr(["Better stay", "Lure me out?", "Come here!"]);
			break;
		case TalkType.Shoot:
			str = RandomStr(["Die!", "Training time!", "Ya better run"]);
			emphasize = true;
			break;
		case TalkType.Dodge:
			str = RandomStr(["Learn to shoot!", "Miss!", "Y U NO aim?"]);
			break;
		case TalkType.Block:
			str = RandomStr(["Cant kill me", "Tickle me?", "No damage!"]);
			break;
		case TalkType.Kill:
			str = RandomStr(["Oh ye!", "Done!", "Easy!", "Dead?"]);
			break;
		case TalkType.None:
			str = RandomStr(["Boring", "Zzz..", "Why am I here"]);
			break;
	}
	lastSentence = sentence;
	text.text = str;
	text.renderer.material.color = emphasize?Color(1,0.5,0.5,1):Color.white;
	saying = true;
	startTime = Time.time;
}

function Update(){
	if (Time.time - startTime > 2){
		text.text = "";
		saying = false;
		if (reveal){
			visi.visibilityType = VisibilityType.TeamShare;
			reveal = false;
		}
	}
}

private function RandomStr(a:Array):String{
	return a[Mathf.FloorToInt(Random.value*a.length)];
}