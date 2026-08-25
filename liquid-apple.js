import {
  ShaderMount,
  liquidMetalFragmentShader,
  getShaderColorFromString,
  toProcessedLiquidMetal,
} from "https://esm.sh/@paper-design/shaders@0.0.80";

const el = document.getElementById("heroLiquidApple");
if (el) {
  /* The fallback SVG (gold gradient apple, defined in index.html) stays visible
     until the shader is ready — so we never show a broken white logo. */
  (async () => {
    try {
      const { pngBlob } = await toProcessedLiquidMetal("assets/apple-liquid.svg");
      const imageUrl = URL.createObjectURL(pngBlob);
      const img = new Image();
      img.onload = () => {
        try {
          new ShaderMount(
            el,
            liquidMetalFragmentShader,
            {
              u_image: img,
              u_isImage: true,
              /* Transparent dark backdrop: only the apple silhouette shows,
                 letting the plasma background bleed through around it. */
              u_colorBack: getShaderColorFromString("#0a0201").map((c, i) => (i === 3 ? 0 : c)),
              u_colorTint: getShaderColorFromString("#f2bf73"),
              u_contour: 0.4,
              u_distortion: 0.35,
              u_softness: 0.25,
              u_repetition: 1.2,
              u_shiftRed: 0.5,
              u_shiftBlue: 0.8,
              u_angle: 70,
              u_shape: 0,
              u_fit: 1,
              u_scale: 1,
              u_rotation: 0,
              u_offsetX: 0,
              u_offsetY: 0,
              u_originX: 0.5,
              u_originY: 0.5,
              u_worldWidth: 0,
              u_worldHeight: 0,
            },
            undefined,
            1,
            0,
            2,
            undefined,
            ["u_image"]
          );
          requestAnimationFrame(() => el.classList.add("ready"));
        } catch (err) {
          console.warn("Liquid metal apple unavailable, keeping fallback", err);
        }
      };
      img.onerror = () => console.warn("Liquid metal apple image failed to load");
      img.src = imageUrl;
    } catch (err) {
      console.warn("Liquid metal apple unavailable, keeping fallback", err);
    }
  })();
}
