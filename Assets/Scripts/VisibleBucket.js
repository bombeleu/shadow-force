#pragma strict

class FadingData {
	public var material : Material;
	public var originalShader : Shader;
	public var replacedShader : Shader;	
}

public var visibleObjects:GameObject[];
public var fadingTime : float = 1.0; // in seconds

private var _alpha : float = 1.0;
enum FadingState { Out, In, None};
private var _fadingState : FadingState = FadingState.None;

private var visible : boolean = true;
private var _fadingData : FadingData[];
private var _vision : VisionMeshScript ;
private var _textMesh : TextMesh;

function Awake(){
	//Debug.Log("Start");
	var nMaterials : int = 0;
	for (var obj:GameObject in visibleObjects){
		nMaterials += obj.renderer.materials.Length;
	}	
	
	// save the original shader
	// get corresponding replacement shader
	var weapon : Weapon = GetComponentInChildren(Weapon);
	
	if (weapon != null) nMaterials += weapon.gameObject.renderer.materials.Length;
	
	_fadingData = new FadingData[nMaterials];
	for (var i : int ; i < nMaterials; i++)
		_fadingData[i] = new FadingData(); // this is ridiculous !!!

	
	var count : int = 0 ;
	for (var obj:GameObject in visibleObjects){
		AddFadingData(count,obj);
		count += obj.renderer.materials.Length;
	}
	// fade weapon
	if (weapon != null) AddFadingData(count,weapon.gameObject);

	
	//fade team name
	_textMesh = GetComponentInChildren(TextMesh);
	_vision = GetComponentInChildren.<VisionMeshScript>();
}

private function AddFadingData(count : int, obj : GameObject) {
	for (var mat : Material in obj.renderer.materials) {
		_fadingData[count].material = mat;
		_fadingData[count].originalShader = mat.shader;
		
		_fadingData[count].replacedShader = Shader.Find(mat.shader.name + "-Transparent");
		if (_fadingData[count].replacedShader == null) {
			_fadingData[count].replacedShader = Shader.Find("FateHunter/Character-Transparent"); // set to default shader
		}
		count++;
	}
}

private function SetRenderer(activate : boolean) {
	for (var obj:GameObject in visibleObjects){
		if (obj != null) 
			obj.renderer.enabled = activate;
	}
	if (_vision != null) _vision.enabled = activate;
	if (_textMesh != null) _textMesh.gameObject.renderer.enabled = activate;
}

function OnEnable() {
	//ReplaceTransparentShader();
	for (var data : FadingData in _fadingData) {
		data.material.shader = data.replacedShader;
	}
	
	SetRenderer(true);
}

function OnDisable(){
	if (_fadingState == FadingState.In)
	{
		// replace original shader
		for (var data : FadingData in _fadingData) {
			data.material.shader = data.originalShader;
		}
	} else{
		SetRenderer(false);
	}
}
function OnSetVisible(visi:boolean){
	if (visi == visible) return;
	visible = visi;
	
	if (visible) _fadingState = FadingState.In;
	else _fadingState = FadingState.Out;
	enabled = true;
	
	//Debug.Log("Enemy set visible:" + visi);
	/*
	for (var obj:GameObject in visibleObjects){
		if (recursive){
			var rr : Renderer[] = obj.GetComponentsInChildren.<Renderer>();
			for (var r:Renderer in rr)
				r.enabled = visi;
		}else {
			obj.GetComponent.<Renderer>().enabled = visi;	
		}
	}
	if (!visi)
	{
		fade.FadeOut();
	} else
	{
		fade.FadeIn();
	}
	*/
}

function Update() {
	if (_fadingState == FadingState.None) return;
	
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
			_alpha = 1.0;
			done = true;
		}
	}
	
	for (var data : FadingData in _fadingData) {
		data.material.color.a = _alpha;
	}

	if (_vision != null)
	{
		_vision.alpha = _alpha;
	}
	if (_textMesh != null) {
		//_textMesh.gameObject.renderer.material.SetColor("_Color",Color(1,1,1,_alpha));
		_textMesh.gameObject.renderer.material.color.a = _alpha;
	}
	
	if (done){
		enabled = false;
	}
}