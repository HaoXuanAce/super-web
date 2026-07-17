<template>
	<TooltipProvider>
		<section class="py-12 sm:py-16">
			<div class="grid gap-8 border-y border-stone-200 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-10">
				<div class="lg:pr-10">
					<div class="flex size-11 items-center justify-center rounded-md bg-stone-950 text-sm font-semibold text-amber-300">
						GTP
					</div>
					<p class="mt-5 text-sm font-semibold text-blue-700">
						当前可用模型
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-950">
						GTP 文生图
					</h2>
				</div>

				<div class="overflow-x-auto rounded-md border border-stone-200">
					<table class="w-full min-w-[38rem] border-collapse text-left">
						<caption class="sr-only">
							GTP 文生图基础价格
						</caption>
						<thead class="bg-stone-50 text-xs text-stone-500">
							<tr>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									清晰度
								</th>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									低画质
								</th>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									中画质
								</th>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									高画质
								</th>
							</tr>
						</thead>
						<tbody class="text-sm">
							<tr v-for="row in generationPriceRows" :key="row.resolution" class="border-b border-stone-100 last:border-b-0">
								<th class="px-5 py-4 font-semibold text-stone-950">
									{{ row.resolution }}
								</th>
								<td class="px-5 py-4 text-stone-600">
									{{ row.low }}
								</td>
								<td class="px-5 py-4 text-stone-600">
									{{ row.medium }}
								</td>
								<td class="px-5 py-4 font-medium text-stone-950">
									{{ row.high }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="grid gap-8 border-b border-stone-200 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-10">
				<div class="lg:pr-10">
					<div class="flex size-11 items-center justify-center rounded-md bg-stone-100 text-sm font-semibold text-stone-700">
						GTP
					</div>
					<p class="mt-5 text-sm font-semibold text-teal-700">
						参考生成
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-950">
						GTP 图生图
					</h2>
				</div>

				<div class="overflow-x-auto rounded-md border border-stone-200">
					<table class="w-full min-w-[38rem] border-collapse text-left">
						<caption class="sr-only">
							GTP 图生图附加费用
						</caption>
						<thead class="bg-stone-50 text-xs text-stone-500">
							<tr>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									生成方式
								</th>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									基础价格
								</th>
								<th class="border-b border-stone-200 px-5 py-4 font-medium">
									参考图附加费
								</th>
							</tr>
						</thead>
						<tbody class="text-sm">
							<tr>
								<th class="px-5 py-5 font-semibold text-stone-950">
									GTP 图生图
								</th>
								<td class="px-5 py-5 text-stone-600">
									按文生图中相同画质与清晰度的基础价格计算
								</td>
								<td class="px-5 py-5 font-semibold text-stone-950">
									每张参考图 + {{ referenceImageUnitPrice }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="grid border-b border-stone-200 md:grid-cols-3">
				<article class="border-b border-stone-200 py-7 md:border-b-0 md:pr-8">
					<p class="text-xs font-semibold text-teal-700">
						三方 API 原价
					</p>
					<h3 class="mt-2 text-lg font-semibold text-stone-950">
						基础价格一分不赚
					</h3>
					<p class="mt-2 text-sm leading-6 text-stone-600">
						上方基础价按第三方 API 原价展示，平台不做加价。
					</p>
				</article>
				<article class="border-b border-stone-200 py-7 md:border-x md:border-y-0 md:px-8">
					<p class="text-xs font-semibold text-amber-700">
						我的辛苦费
					</p>
					<h3 class="mt-2 text-lg font-semibold text-stone-950">
						每次仅赚 {{ platformServiceFeeValue }} 元
					</h3>
					<p class="mt-2 flex items-center gap-1 text-sm leading-6 text-stone-600">
						<span>{{ platformServiceFeeValue }} 不亏就是赚</span>
						<Tooltip>
							<TooltipTrigger as-child>
								<button class="flex size-4 items-center justify-center rounded-full text-stone-400 transition hover:text-stone-950 focus-visible:ring-1 focus-visible:ring-stone-400" type="button" aria-label="价格说明">
									<CircleHelp class="size-3.5" />
								</button>
							</TooltipTrigger>
							<TooltipContent>以前用别家的 API 成本太高，索性自己搭一套给自己用，把价格卷得更实在。</TooltipContent>
						</Tooltip>
					</p>
				</article>
				<article class="py-7 md:pl-8">
					<p class="text-xs font-semibold text-blue-700">
						费用透明
					</p>
					<h3 class="mt-2 text-lg font-semibold text-stone-950">
						生成前展示预计费用
					</h3>
					<p class="mt-2 text-sm leading-6 text-stone-600">
						确认生成前展示明确消耗
					</p>
				</article>
			</div>

			<div class="mt-4 grid overflow-hidden rounded-md border border-amber-200 bg-amber-50/60 sm:grid-cols-3">
				<div class="flex gap-3 border-b border-amber-200 p-5 sm:border-b-0 sm:border-r">
					<ShieldCheck class="mt-0.5 size-5 shrink-0 text-amber-700" />
					<div>
						<p class="text-xs font-semibold text-amber-800">
							模型承诺
						</p>
						<p class="mt-1 text-sm font-semibold text-stone-950">
							满血模型，假一赔十，绝不掺水
						</p>
					</div>
				</div>
				<div class="flex gap-3 border-b border-amber-200 p-5 sm:border-x-0 sm:border-b-0 sm:border-r">
					<BadgeCheck class="mt-0.5 size-5 shrink-0 text-amber-700" />
					<div>
						<p class="text-xs font-semibold text-amber-800">
							价格承诺
						</p>
						<p class="mt-1 text-sm font-semibold text-stone-950">
							三方 API 基础价原样展示，平台不加价
						</p>
					</div>
				</div>
				<div class="flex items-center gap-3 border border-amber-300 bg-white p-5 text-stone-950">
					<span class="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
						<Gift class="size-4" />
					</span>
					<div>
						<p class="text-xs font-semibold text-amber-800">
							免费领取体验额度
						</p>
						<p class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium">
							<span>微信添加</span>
							<strong class="text-lg text-stone-950">17640659681</strong>
							<span class="text-amber-700">免费送 ¥3</span>
						</p>
					</div>
				</div>
			</div>
		</section>
	</TooltipProvider>
</template>

<script setup lang="ts">
import { BadgeCheck, CircleHelp, Gift, ShieldCheck } from '@lucide/vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
	generationPriceRows,
	platformServiceFeeValue,
	referenceImageUnitPrice,
} from './generation-pricing'
</script>
