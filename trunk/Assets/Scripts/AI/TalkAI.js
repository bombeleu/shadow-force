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
	var willReveal:boolean = false;
	switch (sentence){
		case TalkType.Patrol:
			str = RandomStr(["Cardio's good", "For my 6pak", "Will chase u"]);
			break;
		case TalkType.PatrolNotChase:
			str = RandomStr(["Wont leave position", "No trepassing", "Defend here"]);
			break;
		case TalkType.PatrolBack:
			str = RandomStr(["Gotta leave", "Nothing here?", "Hmm, strange .."]);
			emphasize = true;
			willReveal = true;
			break;
		case TalkType.Chase:
			str = RandomStr(["Will catch u!", "Spot ya!", "Wait there!", "Think u can run?"]);
			emphasize = true;
			willReveal = true;
			break;
		case TalkType.NotChase:
			str = RandomStr(["Lure me out?", "Come here!"]);
			emphasize = true;
			willReveal = true;
			break;
		case TalkType.Shoot:
			str = RandomStr(["Die!", "Training time!", "Ya better run"]);
			emphasize = true;
			break;
		case TalkType.Dodge:
			str = RandomStr(["Learn to shoot!", "Miss!", "Y U NO aim?"]);
			break;
		case TalkType.Block:
			str = RandomStr(["Deflect!", "Tickle me?", "No damage!"]);
			break;
		case TalkType.Kill:
			str = RandomStr(["Oh ye!", "Done!", "Easy!", "Dead?"]);
			break;
		case TalkType.None:
			str = RandomStr(["Boring", "Zzz..", "Why am I here"]);
			break;
	}
	if (willReveal){
		visi.Reveal();
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
	}
}

private function RandomStr(a:Array):String{
	return a[Mathf.FloorToInt(Random.value*a.length)];
}