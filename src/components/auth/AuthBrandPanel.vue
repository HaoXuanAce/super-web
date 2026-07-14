<template>
  <section class="relative hidden overflow-hidden bg-slate-950 px-6 py-8 text-slate-100 sm:col-span-2 sm:flex sm:min-h-dvh sm:flex-col sm:justify-between md:px-8 md:py-10 lg:col-span-1 lg:px-10 lg:py-12 xl:px-16">
    <div class="relative">
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
          <Sparkles class="size-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight">Super Studio</span>
      </div>

      <div class="mt-12 max-w-md lg:mt-20">
        <p class="text-xs font-medium tracking-widest text-cyan-300 sm:text-sm">CREATE WITH INTENT</p>
        <h1 class="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:mt-5 lg:text-5xl xl:text-6xl">让灵感，<br>一键显影。</h1>
        <p class="mt-5 max-w-sm text-sm leading-6 text-slate-400 md:text-base md:leading-7">从一句描述到一张成片，为每一次创作保留清晰、专注的开始。</p>
      </div>
    </div>

    <div class="relative hidden max-w-lg grid-cols-3 gap-3 lg:grid">
      <div class="col-span-2 h-32 rounded-2xl border border-white/10 bg-slate-800 p-5 shadow-xl shadow-black/20">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>CREATIVE ENGINE</span>
          <span class="size-2 rounded-full bg-emerald-400"></span>
        </div>
        <p class="mt-7 text-sm font-medium text-slate-200">准备好把想法变成作品</p>
      </div>
      <div class="h-32 rounded-2xl bg-cyan-400 p-5 text-slate-950">
        <WandSparkles class="size-6" />
        <p class="mt-8 text-xs font-semibold leading-4">AI IMAGE<br>STUDIO</p>
      </div>
      <div class="col-span-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <ShieldCheck class="size-5 text-cyan-300" />
        登录状态将安全保存在当前设备
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheck, Sparkles, WandSparkles } from '@lucide/vue'
</script>
