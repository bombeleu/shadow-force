#pragma strict

public var visi:Visibility;
public var text:TextMesh;

public enum TalkType{
	None,
	Patrol,
	PatrolNotChase,
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
	switch (sentence){
		case TalkType.Patrol:
			str = RandomStr(["Cardio's good", "For my 6pak", "Few more rounds", "Hunting enemy"]);
			break;
		case TalkType.PatrolNotChase:
			str = RandomStr(["Wont leave position", "No trepassing", "Defend here"]);
			break;
		case TalkType.Chase:
			str = RandomStr(["Stop coward!", "See ya", "Wait there", "Think u can run?"]);
			break;
		case TalkType.NotChase:
			str = RandomStr(["Better stay", "Lure me out?", "Come here!"]);
			break;
		case TalkType.Shoot:
			str = RandomStr(["Die!", "Training time!", "Ya better run"]);
			break;
		case TalkType.Dodge:
			str = RandomStr(["Open your eye!", "Miss!", "Know aiming?"]);
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
	saying = true;
	startTime = Time.time;
}

function Update(){
	if (Time.time - startTime > 2){
		text.text = "";
		saying = false;
	}
}

private function RandomStr(a:Array):String{
	return a[Mathf.FloorToInt(Random.value*a.length)];
}