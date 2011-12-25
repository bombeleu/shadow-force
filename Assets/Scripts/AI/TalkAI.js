#pragma strict

public var visi:Visibility;
public var text:TextMesh;

public enum TalkType{
	None,
	Patrol,
	Chase,
	Shoot,
	Dodge,
	Kill
}
private var saying:boolean = false;
private var lastSentence:TalkType = TalkType.None;
private var startTime:float = -1;
function Say(sentence:TalkType){
	if (lastSentence == sentence || 
		sentence == TalkType.Patrol || sentence == TalkType.Shoot ||
		sentence == TalkType.None){
		if (saying) return;
	}
	var str:String;
	switch (sentence){
		case TalkType.Patrol:
			str = RandomStr(["Cardio's good", "For my 6pak", "Few more rounds"]);
			break;
		case TalkType.Chase:
			str = RandomStr(["Stop coward!", "Get over here", "Wait there"]);
			break;
		case TalkType.Shoot:
			str = RandomStr(["Die!", "Shooting time", "Ya better run"]);
			break;
		case TalkType.Dodge:
			str = RandomStr(["Not that easy!", "Miss!", "Over here"]);
			break;
		case TalkType.Kill:
			str = RandomStr(["Oh ye!", "Phew!", "Easy!", "Dead?"]);
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