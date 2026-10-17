<script lang="ts">
	let { target, class: cls = '' }: { target: number; class?: string } = $props();

	let el: HTMLElement;
	let started = false;

	function animate() {
		const t0 = performance.now();
		const tick = (t: number) => {
			const p = Math.min(1, (t - t0) / 1600);
			const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
			el.textContent = v.toLocaleString('fa-IR');
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}

	$effect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting && !started) {
						started = true;
						animate();
						io.disconnect();
					}
				});
			},
			{ threshold: 0.4 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

<span bind:this={el} class="tick {cls}">۰</span>
