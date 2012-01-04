Shader "FateHunter/Detail-Character" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
	_Shininess ("Shininess", Range (0.03, 5)) = 0.078125
	_MainTex ("Base (RGB) Gloss (A)", 2D) = "white" {}
	_BumpMap ("Normalmap", 2D) = "bump" {}
	_SpecularMap ("SpecularMap",2D) = "specular" {}
}
SubShader { 
	Tags { "RenderType"="Opaque" }
	LOD 400
	
CGPROGRAM
#pragma surface surf BumpSpecularMap

sampler2D _MainTex;
sampler2D _BumpMap;
sampler2D _SpecularMap;
fixed4 _Color;
half _Shininess;

struct Input {
	float2 uv_MainTex;
	float2 uv_BumpMap;
	float2 uv_SpecularMap;
};


half4 LightingBumpSpecularMap (SurfaceOutput s, half3 lightDir, half3 viewDir, half atten) {
  	half3 h = normalize (lightDir + viewDir);

  	half diff = max (0, dot (s.Normal, lightDir));

  	float nh = max (0, dot (s.Normal, h));
  	float spec = pow (nh, 64.0) *_Shininess* s.Specular;
  	//spec = pow(nh,s.Specular);

  	half4 c;
  	c.rgb = (s.Albedo * _LightColor0.rgb * diff + _SpecColor.rgb * spec ) * (atten * 2);
  	c.a = 1.0;
  	
  	return c;
}
void surf (Input IN, inout SurfaceOutput o) {
	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
	o.Albedo = tex.rgb * _Color.rgb;
	//o.Gloss = tex.a;
	//o.Alpha = tex.a * _Color.a;
	fixed4 glossy = tex2D(_SpecularMap,IN.uv_SpecularMap);
	//o.Gloss = glossy ;
	//o.Alpha = glossy * _Color.a;
	o.Specular = glossy.r;
	//o.Albedo = glossy.r;
	o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
}
ENDCG
}


}
