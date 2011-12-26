#pragma strict

var audioSource : AudioSource;
var sounds : AudioClip[];

function Awake () {
	if (!audioSource && audio)
		audioSource = audio;
}

function OnSignal () {
	if (sounds){
		audioSource.clip = sounds[Mathf.FloorToInt(Random.value * sounds.Length)];
	}
	audioSource.Play ();
}
