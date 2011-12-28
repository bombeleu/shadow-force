Shader "FateHunter/Shining" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_MainTex ("Base (RGB)", 2D) = "white" {}
}
SubShader {
	Tags { "RenderType"="Opaque" }
	LOD 200
	Blend Off

CGPROGRAM
#pragma surface surf Lambert

sampler2D _MainTex;
sampler2D _ShiningTex;
fixed4 _Color;

struct Input {
	float2 uv_MainTex;
};

void surf (Input IN, inout SurfaceOutput o) {
	fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
	o.Albedo = c.rgb ;
	float val = sin(_Time.z);
	o.Emission = 0.2*val*val;
	//o.Alpha = c.a;
}
ENDCG
}

Fallback "VertexLit"
}
