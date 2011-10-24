Shader "FateHunter/JTest" {
	Properties {
		_LightColor ("Light Color", Color) = (1.0, 0.0, 1.0, 1.0)
		_LightPos ("Light Position", Vector) = (0.0,0.0,0.0,1.0)
		_DepthTex ("Base", 2D) = "VisionDepth" {}
	}
	
	CGINCLUDE

		#include "UnityCG.cginc"

		fixed4 _LightColor;
		float4 _LightPos;
		sampler2D _DepthTex;
		float4x4 _LightWVP;
						
		struct v2f {
			half4 pos : SV_POSITION;
			fixed4 vertexColor : COLOR;
			float4 worldPos : TEXCOORD0;
		};

		v2f vert(appdata_full v) {
			v2f o;
			
			o.pos = mul (UNITY_MATRIX_MVP, v.vertex);	
			o.vertexColor = v.color * _LightColor;
			//o.vertexColor = fixed4(1.0,0.0,0.0,1.0);		

			o.worldPos = v.vertex;
			
			o.vertexColor.a = 0.2;
			return o; 
		}
		
		fixed4 frag( v2f i ) : COLOR {	
			float3 distV = i.worldPos.xyz - _LightPos.xyz;
			float dist = length(distV);
			
			if (dist > 20) return float4(0,0,0,0);
			else return i.vertexColor;
		}
	
	ENDCG
	
	SubShader {
		Tags { "RenderType" = "Transparent" "Queue" = "Transparent"}
		Cull Off
		Lighting Off
		ZWrite Off
		Fog { Mode Off }
		Blend SrcAlpha OneMinusSrcAlpha
		
	Pass {
	
		CGPROGRAM
		
		#pragma vertex vert
		#pragma fragment frag
		#pragma fragmentoption ARB_precision_hint_fastest 
		
		ENDCG
		 
		}
				
	} 
	FallBack Off
}
