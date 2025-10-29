"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// ---- Ripple Shader Background ---- //
const ShaderCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const bgColorLocRef = useRef<WebGLUniformLocation | null>(null);
    const [bgColor, setBgColor] = useState([1.0, 1.0, 1.0]);

    useEffect(() => {
        const root = document.documentElement;
        const updateColor = () => {
            const isDark = root.classList.contains("dark");
            setBgColor(isDark ? [0, 0, 0] : [1.0, 1.0, 1.0]);
        };
        updateColor();

        const observer = new MutationObserver(() => updateColor());
        observer.observe(root, { attributes: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl");
        if (!gl) return console.error("WebGL not supported");

        glRef.current = gl;

        const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;
        const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff=center-uv; float len=length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(v.x,v.y,.7-v.y*v.x);
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }
    `;

        const compileShader = (type: number, src: string) => {
            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                throw new Error(gl.getShaderInfoLog(shader) || "Shader error");
            return shader;
        };

        const program = gl.createProgram()!;
        gl.attachShader(
            program,
            compileShader(gl.VERTEX_SHADER, vertexShaderSource)
        );
        gl.attachShader(
            program,
            compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
        );
        gl.linkProgram(program);
        gl.useProgram(program);
        programRef.current = program;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );
        const pos = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

        const iTimeLoc = gl.getUniformLocation(program, "iTime");
        const iResLoc = gl.getUniformLocation(program, "iResolution");
        bgColorLocRef.current = gl.getUniformLocation(
            program,
            "uBackgroundColor"
        );
        gl.uniform3fv(bgColorLocRef.current, new Float32Array(bgColor));

        let frame: number;
        const render = (time: number) => {
            gl.uniform1f(iTimeLoc, time * 0.001);
            gl.uniform2f(iResLoc, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            frame = requestAnimationFrame(render);
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        };
        resize();
        window.addEventListener("resize", resize);
        frame = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
        };
    }, [bgColor]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0"
        />
    );
};

// ---- Glassy Pricing Card ---- //
interface PricingCardProps {
    title: string;
    description: string;
    price: string;
    features: string[];
    buttonText: string;
    isPopular?: boolean;
}

export const AnimatedGlassyPricing = ({
    title,
    description,
    price,
    features,
    buttonText,
    isPopular = false,
}: PricingCardProps) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
            <ShaderCanvas />

            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10 p-10 rounded-3xl border backdrop-blur-lg bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-900/40 dark:to-slate-800/20 shadow-2xl border-slate-200/50 dark:border-slate-700/50"
            >
                <div className="flex-1 space-y-3">
                    {isPopular && (
                        <span className="text-xs font-semibold uppercase text-cyan-500">
                            Most Popular
                        </span>
                    )}
                    <h2 className="text-5xl font-light tracking-tight text-foreground">
                        {title}
                    </h2>
                    <p className="text-foreground/70 text-base">
                        {description}
                    </p>
                    <div className="mt-6 flex items-end gap-2">
                        <span className="text-5xl font-extralight text-foreground">
                            ${price}
                        </span>
                        <span className="text-sm text-foreground/70 mb-1">
                            /mo
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 mb-6 text-sm text-foreground/80">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-cyan-400" /> {f}
                            </li>
                        ))}
                    </ul>
                    <Button className="bg-cyan-400 hover:bg-cyan-300 text-foreground font-semibold rounded-xl w-full md:w-auto">
                        {buttonText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
