import './styles.css';
import './fonts.css';
import './premium.css';
import { initMotion, animateCards, reducedMotion } from './motion';

const filters = document.querySelector<HTMLElement>('.filters');
filters?.removeAttribute('hidden');
const cards = Array.from(document.querySelectorAll<HTMLElement>('.author-card'));
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = category !== 'Все' && card.dataset.category !== category; });
    animateCards(cards.filter(card => !card.hidden));
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = category === 'Все' ? 'Показаны все четыре автора' : `Тема «${category}»: показан один автор`;
  });
});

// Нативный dialog делает фон inert. Дополнительный Tab-loop удерживает фокус
// внутри профиля и при динамическом появлении уведомления.
const dialogs = new Map<string, HTMLDialogElement>();
let activeDialog: HTMLDialogElement | null = null;
let returnFocus: HTMLElement | null = null;
let savedScroll = 0;
let previousBodyStyle = '';
const notice = document.querySelector<HTMLElement>('.notice')!;
let noticeTimeout: ReturnType<typeof setTimeout> | undefined;

function dismissNotice() {
  notice.hidden = true;
  clearTimeout(noticeTimeout);
}

function showNotice() {
  (activeDialog ?? document.body).append(notice);
  notice.hidden = false;
  clearTimeout(noticeTimeout);
  // Не убираем сообщение автоматически, пока пользователь работает с ним.
  noticeTimeout = setTimeout(() => {
    if (!notice.contains(document.activeElement)) dismissNotice();
  }, 7000);
}

notice.querySelector<HTMLButtonElement>('[data-dismiss-notice]')?.addEventListener('click', () => {
  const focused = notice.contains(document.activeElement);
  dismissNotice();
  if (focused) (activeDialog?.querySelector<HTMLElement>('[data-telegram]') ?? lastTelegramButton)?.focus({ preventScroll: true });
});
let lastTelegramButton: HTMLElement | null = null;
document.querySelectorAll<HTMLElement>('[data-telegram]').forEach(button => {
  button.addEventListener('click', () => {
    lastTelegramButton = button;
    showNotice();
  });
});

function restorePage(dialog: HTMLDialogElement) {
  if (activeDialog !== dialog) return;
  dismissNotice();
  document.body.append(notice);
  document.body.style.cssText = previousBodyStyle;
  // Сначала применяем снятие position:fixed, затем восстанавливаем позицию
  // мгновенно, независимо от CSS scroll-behavior и событий нативного dialog.
  document.documentElement.getBoundingClientRect();
  window.scrollTo({ top: savedScroll, behavior: 'instant' });
  activeDialog = null;
  returnFocus?.focus({ preventScroll: true });
  returnFocus = null;
}

const closing = new WeakSet<HTMLDialogElement>();
function closeProfile(dialog: HTMLDialogElement) {
  if (closing.has(dialog)) return;
  const finish = () => { dialog.close(); restorePage(dialog); closing.delete(dialog); };
  if (reducedMotion.matches || !dialog.animate) { finish(); return; }
  closing.add(dialog);
  const panel = dialog.querySelector<HTMLElement>('.profile-panel')!;
  const animation = panel.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(20px)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
  animation.finished.catch(() => {}).then(() => { animation.cancel(); finish(); });
}

function nextProfile(id: string) {
  const previous = activeDialog;
  const next = dialogs.get(id);
  if (!previous || !next || closing.has(previous)) return;
  dismissNotice();
  document.body.append(notice);
  // Меняем содержимое, сохраняя одну блокировку страницы и исходную ссылку.
  activeDialog = next;
  previous.close();
  next.showModal();
  next.querySelector<HTMLElement>('.profile-scroll')!.scrollTop = 0;
  next.querySelector<HTMLElement>('[data-close]')?.focus({ preventScroll: true });
}

function openProfile(id: string, trigger?: HTMLElement) {
  const dialog = dialogs.get(id);
  if (!dialog || activeDialog) return;
  dismissNotice();
  returnFocus = trigger ?? document.querySelector<HTMLElement>(`[data-profile="${id}"]`);
  savedScroll = window.scrollY;
  previousBodyStyle = document.body.style.cssText;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  Object.assign(document.body.style, {
    position: 'fixed', top: `-${savedScroll}px`, width: '100%', overflow: 'hidden',
    paddingRight: `${scrollbarWidth}px`,
  });
  activeDialog = dialog;
  dialog.showModal();
  dialog.querySelector<HTMLElement>('.profile-scroll')!.scrollTop = 0;
  dialog.querySelector<HTMLElement>('[data-close]')?.focus({ preventScroll: true });
}

if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
  document.querySelectorAll<HTMLElement>('.profile-panel').forEach(profile => {
    const id = profile.id.replace('profile-', '');
    const dialog = document.createElement('dialog');
    dialog.className = 'profile-dialog';
    dialog.setAttribute('aria-labelledby', `profile-title-${id}`);
    document.body.append(dialog);
    dialog.append(profile);
    const close = profile.querySelector<HTMLButtonElement>('[data-close]')!;
    close.hidden = false;
    close.addEventListener('click', () => closeProfile(dialog));
    dialog.addEventListener('close', () => { if (!dialog.open) restorePage(dialog); });
    const next = profile.querySelector<HTMLButtonElement>('[data-next]')!;
    next.hidden = false;
    next.addEventListener('click', () => nextProfile(next.dataset.next!));
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeProfile(dialog);
    });
    let downOnBackdrop = false;
    dialog.addEventListener('pointerdown', event => { downOnBackdrop = event.target === dialog; });
    dialog.addEventListener('click', event => {
      if (downOnBackdrop && event.target === dialog) closeProfile(dialog);
      downOnBackdrop = false;
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(element => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
    dialogs.set(id, dialog);
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-profile]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openProfile(link.dataset.profile!, link);
    });
  });
  const profileFromHash = () => {
    if (location.hash.startsWith('#profile-')) openProfile(location.hash.slice('#profile-'.length));
  };
  window.addEventListener('hashchange', profileFromHash);
  profileFromHash();
}

initMotion();
