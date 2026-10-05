export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const easing = 'cubic-bezier(.22,1,.36,1)';
const running = new Set<Animation>();

function animate(element: HTMLElement, delay = 0, offset = 24) {
  if (reducedMotion.matches || !element.animate) return;
  element.getAnimations().forEach(animation => animation.cancel());
  const animation = element.animate([
    { opacity: 0, transform: `translateY(${offset}px)` },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 650, delay, easing, fill: 'backwards' });
  running.add(animation);
  animation.finished.catch(() => {}).finally(() => running.delete(animation));
}

export function animateCards(cards: HTMLElement[]) {
  cards.forEach((card, index) => {
    card.classList.remove('reveal-pending');
    animate(card, Math.min(index * 55, 165), 16);
  });
}

export function initMotion() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.author-card, .telegram-section, .site-footer'));
  let observer: IntersectionObserver | undefined;
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.classList.remove('reveal-pending');
        const cardIndex = targets.indexOf(element);
        animate(element, innerWidth >= 1280 && cardIndex < 4 ? cardIndex * 65 : 0);
        observer?.unobserve(element);
      });
    }, { threshold: 0.06 });
    targets.forEach(target => { target.classList.add('reveal-pending'); observer!.observe(target); });
  }

  const progress = document.querySelector<HTMLElement>('.reading-progress');
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (document.querySelector('dialog[open]')) return;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('transform', `scaleX(${range > 0 ? Math.min(scrollY / range, 1) : 0})`);
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer?.disconnect();
    targets.forEach(target => target.classList.remove('reveal-pending'));
    running.forEach(animation => animation.cancel());
  });
}
