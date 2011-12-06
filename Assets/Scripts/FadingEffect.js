#pragma strict


public var fadingTime : float = 1.0; // in seconds
//public var PairMaterial ;
private var opaqueShader : Shader;
private var transparentShader : Shader;

enum FadingState { Out, In, None};
private var _fadingState : FadingState ;

private var _color : Color;
private var _colorStart : Color;
private var _elapsedTime : float; 
private var _renderer : SkinnedMeshRenderer;

function Awake() {
	_renderer = gameObject.GetComponentInChildren.<SkinnedMeshRenderer>();
	enabled = false;
	opaqueShader = Shader.Find("FateHunter/Normal-Character");
	transparentShader = Shader.Find("FateHunter/Transparent-Character");
	Reset();
}

public function FadeOut() {
	enabled = true;
	_fadingState = FadingState.Out;
}

public function FadeIn() {
	enabled = true;
	_fadingState = FadingState.In;
}

function OnEnable() {
	_elapsedTime = fadingTime;
	_colorStart = _renderer.material.GetColor("_Color");
	_color = _colorStart;
	_renderer.material.shader = transparentShader;
}

function OnDisable(){
	if (_fadingState == FadingState.In)
	{
		_renderer.material.shader = opaqueShader;
		_color = _colorStart;
	}
}

function Reset() {
	_color.a = 255;
	_renderer.material.shader = opaqueShader;
	_fadingState = FadingState.None;
}

function Update () {
	_elapsedTime -= Time.deltaTime;
	//Debug.Log("Alpha" + _color.a);
	if ( _elapsedTime < 0) {
		enabled = false;
		return;
	}
	
	if (_fadingState == FadingState.Out){
		_color.a =  255*( _elapsedTime / fadingTime);
	} else {
		_color.a = 255*(1.0 -  ( _elapsedTime / fadingTime));
	}
	
	_renderer.material.SetColor("_Color",_color);
}