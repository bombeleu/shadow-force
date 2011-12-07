#pragma strict


public var fadingTime : float = 1.0; // in seconds
//public var PairMaterial ;
private var opaqueShader : Shader;
private var transparentShader : Shader;

enum FadingState { Out, In, None};
private var _fadingState : FadingState ;

private var _color : Color;
private var _colorStart : Color;
private var _renderer : SkinnedMeshRenderer;
private var _alpha : float = 1;

function Awake() {
	_renderer = gameObject.GetComponentInChildren.<SkinnedMeshRenderer>();
	opaqueShader = Shader.Find("FateHunter/Normal-Character");
	transparentShader = Shader.Find("FateHunter/Transparent-Character");
	enabled = false;
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
	_renderer.enabled = true;
	_color = _colorStart;
	_renderer.material.shader = transparentShader;
}

function OnDisable(){
	if (_fadingState == FadingState.In)
	{
		_renderer.material.shader = opaqueShader;
		_color = _colorStart;
	}else{
		_renderer.enabled = false;
	}
}

function Reset() {
	_color.a = 255;
	_renderer.material.shader = opaqueShader;
	_fadingState = FadingState.None;
}

function Update () {
	//Debug.Log("Alpha" + _color.a);
	var done:boolean = false;
	
	if (_fadingState == FadingState.Out){
		_alpha -= Time.deltaTime / fadingTime;
		if (_alpha<0){
			_alpha = 0;
			done = true;
		}
	} else {
		_alpha += Time.deltaTime / fadingTime;
		if (_alpha>1){
			_alpha = 1;
			done = true;
		}
	}
	
	_color.a =  255*_alpha;
	
	_renderer.material.SetColor("_Color",_color);
	if (done){
		enabled = false;
	}
}