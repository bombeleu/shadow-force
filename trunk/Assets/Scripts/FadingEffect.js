public var fadingTime : float = 2.0; // in seconds
public var opaqueShader : Shader;
public var transparentShader : Shader;

enum FadingState { Out, In, None};
private var _fadingState : FadingState ;

private var _color : Color;
private var _colorStart : Color;
private var _elapsedTime : float; 
private var _renderer : SkinnedMeshRenderer;

function Awake() {
	_renderer = gameObject.GetComponentInChildren.<SkinnedMeshRenderer>();
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
	_elapsedTime = fadingTime;
	_colorStart = _renderer.material.GetColor("_Color");
	_color = _colorStart;
	_renderer.material.shader = transparentShader;
}

function Reset() {
	_color.a = 255;
	_renderer.material.shader = opaqueShader;
	fadingState = FadingState.None;
}

function Update () {
	_elapsedTime -= Time.deltaTime;

	if ( _elapsedTime < 0) {
		enabled = false;
		return;
	}
	
	if (_fadingState == FadingState.Out){
		_color.a =  ( _elapsedTime / fadingTime);
	} else {
		_color.a = 1.0 -  ( _elapsedTime / fadingTime);
	}
	
	_renderer.material.SetColor("_Color",_color);
}